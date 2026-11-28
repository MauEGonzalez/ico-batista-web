// /server/models/User.js
// Usuarios del panel. Los administradores (Mauro, Ico) se crean con: npm run create-admin
// El personal de puerta (rol "puerta") lo crea un administrador desde Entradas en el panel:
// solo puede buscar entradas, marcar ingresos y cobrar entradas en la puerta.
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'puerta'], default: 'admin' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
