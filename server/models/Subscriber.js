// /server/models/Subscriber.js
// Personas suscriptas a "Novedades" (formulario del footer).
import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    source: { type: String, trim: true, maxlength: 40, default: 'footer' }, // Desde dónde se suscribió
  },
  { timestamps: true }
);

subscriberSchema.index({ createdAt: -1 });

export const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
