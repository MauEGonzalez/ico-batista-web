// /server/routes/contact.js
// Formulario de /contacto: se guarda en la base y se lee en el panel, pestaña "Mensajes".
import { Router } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { normalizeEmail, isValidEmail } from '../utils/email.js';
import { cleanString } from '../utils/productInput.js';
import { notifyNewMessage } from '../utils/notify.js';

// ================= Ruta pública: POST /api/contact =================
export const publicRouter = Router();

const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Enviaste varios mensajes seguidos. Prueba de nuevo en unos minutos o escríbenos por WhatsApp.',
});

publicRouter.post('/', limiter, async (req, res) => {
  const body = req.body ?? {};
  // Campo trampa invisible: si viene completo es un robot. Se responde OK sin guardar nada.
  if (cleanString(body.website, 200)) return res.json({ ok: true });

  const name = cleanString(body.name, 100);
  const email = normalizeEmail(body.email);
  const phone = cleanString(body.phone, 40).replace(/[^\d+()\-\s.]/g, '');
  const message = cleanString(body.message, 5000);

  if (!name) return res.status(400).json({ message: 'Escribe tu nombre' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Escribe un email válido' });
  if (message.length < 5) return res.status(400).json({ message: 'Escribe tu mensaje' });

  const saved = await ContactMessage.create({ name, email, phone, message });
  await notifyNewMessage(saved);
  return res.status(201).json({ ok: true });
});

// ================= Panel: /api/admin/messages =================
export const adminRouter = Router();
adminRouter.use(requireAuth);

const toAdminItem = ({ _id, name, email, phone, message, read, createdAt }) => ({
  _id, name, email, phone, message, read, createdAt,
});

// No leídos primero; dentro de cada grupo, los más nuevos arriba
adminRouter.get('/', async (req, res) => {
  const messages = await ContactMessage.find().sort({ read: 1, createdAt: -1 }).limit(2000);
  res.json(messages.map(toAdminItem));
});

// Para el numerito de la pestaña "Mensajes"
adminRouter.get('/unread-count', async (req, res) => {
  const count = await ContactMessage.countDocuments({ read: false });
  res.json({ count });
});

adminRouter.patch('/:id', async (req, res) => {
  if (typeof req.body?.read !== 'boolean') {
    return res.status(400).json({ message: 'Falta indicar si está leído' });
  }
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { $set: { read: req.body.read } },
    { new: true }
  );
  if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });
  return res.json(toAdminItem(message));
});

adminRouter.delete('/:id', async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });
  return res.json({ ok: true });
});
