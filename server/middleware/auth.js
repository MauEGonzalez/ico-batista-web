// /server/middleware/auth.js
// Sesión del panel: un token firmado (JWT) guardado en una cookie httpOnly.
// httpOnly = el JavaScript de la página no puede leerla, así un script malicioso no puede robarla.
import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'ib_session';
const SESSION_DAYS = 7;

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET falta o es muy corto (mínimo 32 caracteres)');
  }
  return secret;
};

export const setSessionCookie = (res, user) => {
  const token = jwt.sign({ sub: String(user._id), email: user.email, name: user.name || '', role: user.role || 'admin' }, getSecret(), {
    expiresIn: `${SESSION_DAYS}d`,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
};

const readSession = (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ message: 'Iniciá sesión para continuar', error: 'Iniciá sesión para continuar' });
    return null;
  }
  try {
    const payload = jwt.verify(token, getSecret());
    // Las sesiones anteriores a los roles no traen "role": eran todas de administradores
    return { id: payload.sub, email: payload.email, name: payload.name || '', role: payload.role || 'admin' };
  } catch {
    clearSessionCookie(res);
    res.status(401).json({ message: 'La sesión expiró, volvé a iniciar sesión', error: 'La sesión expiró, volvé a iniciar sesión' });
    return null;
  }
};

// Protege las rutas del panel: solo administradores (el personal de puerta no entra acá)
export const requireAuth = (req, res, next) => {
  const user = readSession(req, res);
  if (!user) return undefined;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Tu usuario no tiene acceso a esta sección', error: 'Tu usuario no tiene acceso a esta sección' });
  }
  req.user = user;
  return next();
};

// Rutas de la puerta (buscar, marcar ingreso, cobrar): administradores o personal de puerta.
// Al personal de puerta se lo vuelve a buscar en la base, así se le puede quitar el acceso al instante.
export const requireStaff = async (req, res, next) => {
  const user = readSession(req, res);
  if (!user) return undefined;
  if (user.role === 'puerta') {
    try {
      const { User } = await import('../models/User.js');
      const current = await User.findById(user.id).select('name role active').lean();
      if (!current || current.role !== 'puerta' || current.active === false) {
        clearSessionCookie(res);
        return res.status(401).json({ message: 'Tu acceso fue desactivado', error: 'Tu acceso fue desactivado' });
      }
      user.name = current.name;
    } catch (error) {
      return next(error);
    }
  } else if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Sin acceso', error: 'Sin acceso' });
  }
  req.user = user;
  return next();
};
