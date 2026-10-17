// /server/routes/subscribers.js
// "Novedades": suscripción pública desde el footer + listado en el panel.
import { Router } from 'express';
import { Subscriber } from '../models/Subscriber.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { normalizeEmail, isValidEmail } from '../utils/email.js';
import { cleanString } from '../utils/productInput.js';

// ================= Ruta pública: POST /api/subscribe =================
export const publicRouter = Router();

const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos. Prueba de nuevo en unos minutos.',
});

publicRouter.post('/', limiter, async (req, res) => {
  // Campo trampa invisible: las personas lo dejan vacío, los robots lo completan
  if (cleanString(req.body?.website, 200)) return res.json({ ok: true });

  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Escribe un email válido' });
  }
  const source = cleanString(req.body?.source, 40).replace(/[^a-z0-9_-]/gi, '') || 'footer';

  try {
    await Subscriber.create({ email, source });
  } catch (error) {
    // Ya estaba suscripto: se responde igual que si fuera nuevo (no revela quién está en la lista)
    if (error.code !== 11000) throw error;
  }
  return res.json({ ok: true });
});

// ================= Panel: /api/admin/subscribers =================
export const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get('/', async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).limit(20000);
  res.json(subscribers.map(({ _id, email, source, createdAt }) => ({ _id, email, source, createdAt })));
});

adminRouter.delete('/:id', async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) return res.status(404).json({ message: 'Suscriptor no encontrado' });
  return res.json({ ok: true });
});
