// /server/utils/rateLimit.js
// Freno simple contra abusos en los formularios públicos: N pedidos por IP cada X minutos.
// (Igual que en el login: en Vercel cada instancia tiene su propia memoria, así que es una
// protección básica contra spam, no absoluta.)

export const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'desconocida';

export const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map(); // ip -> { count, first }

  const prune = () => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now - entry.first > windowMs) hits.delete(ip);
    }
  };

  return (req, res, next) => {
    if (hits.size > 5000) prune(); // Evita que el mapa crezca sin límite
    const ip = getClientIp(req);
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now - entry.first > windowMs) {
      hits.set(ip, { count: 1, first: now });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.first + windowMs - now) / 1000)));
      return res.status(429).json({ message });
    }
    return next();
  };
};
