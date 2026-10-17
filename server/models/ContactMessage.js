// /server/models/ContactMessage.js
// Mensajes del formulario de /contacto. Se leen en el panel, pestaña "Mensajes".
import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Escribe tu nombre'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Escribe tu email'], lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    message: { type: String, required: [true, 'Escribe tu mensaje'], trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactMessageSchema.index({ read: 1, createdAt: -1 });

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
