// /server/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { setSessionCookie, clearSessionCookie, requireAuth } from '../middleware/auth.js';

const router = Router();

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

  const email = String(req.body?.email || '').toLowerCase().trim();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ message: 'Completá email y contraseña' });
  }

  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) {
    registerFailure(ip);
    // Mismo mensaje exista o no el email, para no revelar qué cuentas existen
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }

  failedAttempts.delete(ip);
  setSessionCookie(res, user);
  return res.json({ user: { email: user.email, name: user.name } });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// El panel lo usa para saber si hay una sesión activa
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('email name');
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ message: 'Usuario inexistente' });
  }
  return res.json({ user: { email: user.email, name: user.name } });
});

export default router;
