import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Importados (no leídos con fs) para que Vercel los incluya en la función
import defaultEvent from './event.json' with { type: 'json' };
import defaultTandas from './tandas.json' with { type: 'json' };

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const strip = (u) => String(u || '').replace(/\/+$/, '');
const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v));
const bool = (v) => ['1', 'true', 'yes', 'si'].includes(String(v || '').toLowerCase());

function readJson(envPath, fallback) {
  return envPath ? JSON.parse(fs.readFileSync(path.resolve(envPath), 'utf8')) : fallback;
}

/**
 * Arma la configuración a partir de variables de entorno.
 * `overrides` permite pisar cualquier cosa (tests / integración con otro backend).
 */
export function loadConfig(env = process.env, overrides = {}) {
  // off = venta cerrada (default en producción hasta cargar las credenciales de Mercado Pago)
  // mock = simulador local (solo desarrollo) · live = Mercado Pago real
  let mode = env.MP_MODE || (env.VERCEL ? 'off' : 'mock');
  if (mode === 'mock' && env.VERCEL_ENV === 'production') mode = 'off'; // nunca simular pagos en producción
  const cfg = {
    mode,
    isLive: mode === 'live',
    isMock: mode === 'mock',
    isOff: mode === 'off',
    port: num(env.PORT, 4000),
    publicUrl: strip(env.PUBLIC_URL || 'http://localhost:5173'),
    apiUrl: strip(env.API_URL || 'http://localhost:4000'),
    corsOrigins: String(env.CORS_ORIGINS || env.PUBLIC_URL || 'http://localhost:5173')
      .split(',')
      .map((s) => strip(s.trim()))
      .filter(Boolean),
    mp: {
      accessToken: env.MP_ACCESS_TOKEN || '',
      webhookSecret: env.MP_WEBHOOK_SECRET || '',
    },
    usdUyuRate: num(env.USD_UYU_RATE, null),
    mail: {
      provider: env.MAIL_PROVIDER || 'dev',
      from: env.MAIL_FROM || 'Ico Batista <entradas@icobatista.com>',
      resendApiKey: env.RESEND_API_KEY || '',
      smtp: {
        host: env.SMTP_HOST || '',
        port: num(env.SMTP_PORT, 587),
        user: env.SMTP_USER || '',
        pass: env.SMTP_PASS || '',
        secure: bool(env.SMTP_SECURE),
      },
      outboxDir: env.VERCEL ? path.join(os.tmpdir(), 'entradas-outbox') : path.join(moduleDir, '.outbox'),
    },
    notify: {
      email: env.ICO_NOTIFY_EMAIL || '',
      telegramToken: env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: env.TELEGRAM_CHAT_ID || '',
    },
    adminToken: env.ADMIN_TOKEN || '',
    maxPorCompra: num(env.MAX_POR_COMPRA, 10),
    holdMinutes: num(env.HOLD_MINUTES, 30),
    event: readJson(env.EVENT_FILE, defaultEvent),
    tandas: readJson(env.TANDAS_FILE, defaultTandas),
  };
  // Precio de prueba (solo para la compra real de prueba): ENTRADAS_PRECIO_PRUEBA_UYU=40 en Vercel.
  // Pisa el precio de todas las tandas. Borrar la variable y redeployar para volver a los precios reales.
  const testPrice = Number(env.ENTRADAS_PRECIO_PRUEBA_UYU);
  if (testPrice > 0) {
    cfg.tandas = cfg.tandas.map((t) => ({ ...t, precioUYU: Math.round(testPrice), precioUSD: null }));
  }
  Object.assign(cfg, overrides);
  validateConfig(cfg);
  return cfg;
}

export function validateConfig(cfg) {
  const problems = [];
  if (!Array.isArray(cfg.tandas) || cfg.tandas.length === 0) problems.push('tandas.json vacío');
  for (const t of cfg.tandas || []) {
    if (!t.id || !t.hasta || Number.isNaN(Date.parse(t.hasta))) problems.push(`tanda inválida: ${t.id}`);
    if (!t.precioUYU && !(t.precioUSD && cfg.usdUyuRate)) {
      problems.push(`la tanda ${t.id} necesita "precioUYU" o USD_UYU_RATE`);
    }
  }
  if (cfg.isLive) {
    if (!cfg.mp.accessToken) problems.push('Falta MP_ACCESS_TOKEN');
    if (!cfg.mp.webhookSecret) problems.push('Falta MP_WEBHOOK_SECRET');
    if (!cfg.apiUrl.startsWith('https://')) problems.push('API_URL debe ser https en modo live');
    if (!cfg.publicUrl.startsWith('https://')) problems.push('PUBLIC_URL debe ser https en modo live');
    if (cfg.mail.provider === 'dev') problems.push('MAIL_PROVIDER no puede ser "dev" en modo live');
    if (!cfg.notify.email && !cfg.notify.telegramToken) problems.push('Falta ICO_NOTIFY_EMAIL (o Telegram)');
  }
  if (problems.length) {
    throw new Error('Configuración inválida:\n - ' + problems.join('\n - '));
  }
}

export function uyuPrice(tanda, cfg) {
  if (tanda.precioUYU) return Math.round(tanda.precioUYU);
  return Math.round(tanda.precioUSD * cfg.usdUyuRate);
}
