// /server/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { setSessionCookie, clearSessionCookie, requireAuth, requireStaff } from '../middleware/auth.js';

const router = Router();

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const publicUser = (user) => ({ email: user.role === 'puerta' ? '' : user.email, name: user.name, role: user.role || 'admin' });

// Freno simple contra intentos de adivinar contraseñas: 10 intentos fallidos cada 15 min por IP.
// (En Vercel cada instancia tiene su propia memoria: es una protección básica, no absoluta.)
const failedAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const isBlocked = (ip) => {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

const registerFailure = (ip) => {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
};

router.post('/login', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (isBlocked(ip)) {
    return res.status(429).json({ message: 'Demasiados intentos. Probá de nuevo en unos minutos.' });
  }

  // Se puede entrar con el email o con el nombre de usuario (el personal de puerta no tiene email)
  const login = String(req.body?.email || '').trim().replace(/\s+/g, ' ');
  const password = String(req.body?.password || '');
  if (!login || !password) {
    return res.status(400).json({ message: 'Completá usuario y contraseña' });
  }

  const user = login.includes('@')
    ? await User.findOne({ email: login.toLowerCase() })
    : await User.findOne({ name: new RegExp(`^${escapeRegExp(login)}$`, 'i') });
  const valid = user && user.active !== false ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) {
    registerFailure(ip);
    // Mismo mensaje exista o no el usuario, para no revelar qué cuentas existen
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }

  failedAttempts.delete(ip);
  setSessionCookie(res, user);
  return res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// El panel lo usa para saber si hay una sesión activa
router.get('/me', requireStaff, async (req, res) => {
  const user = await User.findById(req.user.id).select('email name role active');
  if (!user || user.active === false) {
    clearSessionCookie(res);
    return res.status(401).json({ message: 'Usuario inexistente' });
  }
  return res.json({ user: publicUser(user) });
});

/* ---------- Personal de puerta: lo crea un administrador desde Entradas ---------- */
const puertaJson = (u) => ({ id: String(u._id), name: u.name, active: u.active !== false, updatedAt: u.updatedAt });

router.get('/puerta', requireAuth, async (_req, res) => {
  const users = await User.find({ role: 'puerta' }).sort({ name: 1 }).select('name active updatedAt').lean();
  res.json({ users: users.map(puertaJson) });
});

// Crea el usuario o, si ya existe con ese nombre, le cambia la contraseña y lo reactiva
router.post('/puerta', requireAuth, async (req, res) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  const password = String(req.body?.password || '');
  if (name.length < 3 || name.length > 60 || name.includes('@')) {
    return res.status(400).json({ message: 'Poné el nombre y apellido de la persona (sin @)' });
  }
  if (password.length < 8 || password.length > 100) {
    return res.status(400).json({ message: 'La contraseña tiene que tener al menos 8 caracteres' });
  }
  const sameName = await User.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') });
  if (sameName && sameName.role !== 'puerta') {
    return res.status(409).json({ message: 'Ya hay un administrador con ese nombre. Usá otro.' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  let user = sameName;
  if (user) {
    user.passwordHash = passwordHash;
    user.name = name;
    user.active = true;
    await user.save();
  } else {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
    user = await User.create({ name, email: `${slug}.${Date.now().toString(36)}@puerta.local`, passwordHash, role: 'puerta' });
  }
  return res.json({ user: puertaJson(user), creado: !sameName });
});

// Activa o desactiva el acceso (por ejemplo, después del evento)
router.patch('/puerta/:id', requireAuth, async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'puerta' }).catch(() => null);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  user.active = Boolean(req.body?.active);
  await user.save();
  return res.json({ user: puertaJson(user) });
});

export default router;
