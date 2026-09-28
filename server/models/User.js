// /server/models/User.js
// Usuarios del panel (Mauro, Ico). Se crean con: npm run create-admin
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
