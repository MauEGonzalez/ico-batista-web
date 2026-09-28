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
  const token = jwt.sign({ sub: String(user._id), email: user.email }, getSecret(), {
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

// Protege las rutas del panel
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ message: 'Iniciá sesión para continuar' });
  try {
    const payload = jwt.verify(token, getSecret());
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ message: 'La sesión expiró, volvé a iniciar sesión' });
  }
};
