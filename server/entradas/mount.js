// /server/entradas/mount.js
// Monta el módulo de entradas del desfile en la API de la web.
// - El panel usa la misma sesión de Ico (requireAuth), no una clave aparte.
// - Si falta configuración (por ejemplo MP_MODE=live sin credenciales), la API de entradas
//   responde 503 pero el resto del sitio sigue funcionando.
import express from 'express';
import mongoose from 'mongoose';
import { loadConfig } from './config.js';
import { createEntradas } from './index.js';
import { requireAuth } from '../middleware/auth.js';

const siteUrl = (env) => {
  if (env.PUBLIC_URL) return env.PUBLIC_URL;
  if (env.VERCEL_ENV === 'production') return 'https://icobatista.com';
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return 'http://localhost:5173';
};

let cached = null;
export const getEntradas = () => {
  if (cached) return cached;
  try {
    const url = siteUrl(process.env);
    // La API vive en el mismo dominio que la web (/api), así que ambas URLs coinciden
    const config = loadConfig({
      ...process.env,
      PUBLIC_URL: url,
      API_URL: process.env.API_URL || url,
      // Cotización para pasar los USD de tandas.json a pesos (Mercado Pago cobra en UYU).
      // Conviene fijarla en Vercel (USD_UYU_RATE) o poner precioUYU en cada tanda.
      USD_UYU_RATE: process.env.USD_UYU_RATE || '40',
    });
    cached = { config, entradas: createEntradas({ config, mongoose, requireAdmin: requireAuth }) };
  } catch (error) {
    console.error('[entradas] configuración inválida:', error.message);
    cached = { error };
  }
  return cached;
};

// Tarea diaria de Vercel Cron: recupera pagos cuyo aviso se perdió y reintenta emails caídos
const cronAllowed = (req) => {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.authorization === `Bearer ${secret}`;
  return String(req.headers['user-agent'] || '').startsWith('vercel-cron');
};

export const entradasRouter = () => {
  // Se crea al arrancar (no dentro de un pedido): express-rate-limit lo exige
  getEntradas();
  const router = express.Router();

  router.get('/cron', async (req, res) => {
    if (!cronAllowed(req)) return res.status(401).json({ error: 'No autorizado' });
    const { entradas, error } = getEntradas();
    if (error) return res.status(503).json({ error: 'Entradas sin configurar' });
    res.json(await entradas.service.reconcile());
  });

  router.use((req, res, next) => {
    const { entradas, error } = getEntradas();
    if (error) {
      return res.status(503).json({ error: 'La venta de entradas no está disponible en este momento.' });
    }
    return entradas.router(req, res, next);
  });

  return router;
};
