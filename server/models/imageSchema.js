// /server/models/imageSchema.js
// Formato de una foto de Cloudinary (lo usan prendas y desfiles).
import mongoose from 'mongoose';

export const imageSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true }, // Identificador en Cloudinary (para borrarla)
    url: { type: String, required: true },      // URL original; la web le agrega el tamaño/formato
    width: Number,
    height: Number,
  },
  { _id: false }
);
