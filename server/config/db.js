// /server/config/db.js
// Conexión a MongoDB reutilizable: en Vercel cada función puede "despertar" muchas veces,
// así que guardamos la conexión en una variable global para no abrir una nueva en cada request.
import mongoose from 'mongoose';

let cached = globalThis.__mongoose;
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'icobatista',
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Permite reintentar en el próximo request
    throw error;
  }
  return cached.conn;
};
