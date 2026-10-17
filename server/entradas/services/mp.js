import crypto from 'node:crypto';
import { HttpError } from '../utils/errors.js';

const MP_BASE = 'https://api.mercadopago.com';

/** Cliente REST de Mercado Pago (Checkout Pro). Sin SDK: solo fetch. */
export function createMp(config) {
  async function api(path, { method = 'GET', body, idempotencyKey } = {}) {
    const headers = {
      Authorization: `Bearer ${config.mp.accessToken}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
    const res = await fetch(MP_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      const err = new HttpError(res.status, `Mercado Pago ${res.status}: ${text.slice(0, 300)}`, 'mp_error');
      err.mpStatus = res.status;
      throw err;
    }
    return json;
  }

  return {
    createPreference: (pref, idempotencyKey) =>
      api('/checkout/preferences', { method: 'POST', body: pref, idempotencyKey }),
    async getPayment(id) {
      try {
        return await api(`/v1/payments/${encodeURIComponent(id)}`);
      } catch (e) {
        if (e.mpStatus === 404) return null;
        throw e;
      }
    },
    async searchPayments(externalReference) {
      const q = new URLSearchParams({
        external_reference: externalReference,
        sort: 'date_created',
        criteria: 'desc',
      });
      const r = await api(`/v1/payments/search?${q}`);
      return r?.results || [];
    },
  };
}

/**
 * Valida la firma `x-signature` de las notificaciones.
 * Plantilla del manifest (documentación de MP): `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * con HMAC-SHA256 y la clave secreta del webhook. data.id en minúsculas si es alfanumérico.
 */
export function verifySignature({ secret, signatureHeader, requestId, dataId }) {
  if (!secret) return { ok: false, reason: 'sin_secret' };
  if (!signatureHeader) return { ok: false, reason: 'sin_firma' };
  const parts = Object.fromEntries(
    String(signatureHeader)
      .split(',')
      .map((p) => p.trim().split('='))
      .filter((kv) => kv.length === 2)
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return { ok: false, reason: 'firma_mal_formada' };
  let manifest = '';
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected, 'hex');
  let b;
  try {
    b = Buffer.from(v1, 'hex');
  } catch {
    return { ok: false, reason: 'firma_invalida' };
  }
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'firma_invalida' };
  return { ok: true };
}

/** Utilidad para tests: arma una firma válida. */
export function signNotification({ secret, dataId, requestId, ts = String(Date.now()) }) {
  let manifest = `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return `ts=${ts},v1=${v1}`;
}

/**
 * Simulador de Mercado Pago (MP_MODE=mock y tests). Misma interfaz que createMp.
 */
export function createMockMp(config) {
  const prefs = new Map();
  const payments = new Map();
  let seq = 1000;

  const mp = {
    prefs,
    payments,
    async createPreference(pref) {
      const id = `mock-pref-${++seq}`;
      prefs.set(id, pref);
      return {
        id,
        init_point: `${config.publicUrl}/mock-mp?pref=${id}`,
        sandbox_init_point: `${config.publicUrl}/mock-mp?pref=${id}`,
      };
    },
    async getPayment(id) {
      return payments.get(String(id)) || null;
    },
    async searchPayments(ref) {
      return [...payments.values()].filter((p) => p.external_reference === ref);
    },
    /** Crea un pago simulado para una preferencia. */
    addPayment({ prefId, status = 'approved', amount, currency, externalReference, statusDetail }) {
      const pref = prefs.get(prefId);
      const item = pref?.items?.[0];
      const id = String(++seq * 7);
      const payment = {
        id: Number(id),
        status,
        status_detail: statusDetail || (status === 'approved' ? 'accredited' : status),
        external_reference: externalReference ?? pref?.external_reference,
        transaction_amount: amount ?? (item ? item.unit_price * item.quantity : 0),
        currency_id: currency ?? item?.currency_id ?? 'UYU',
        date_approved: status === 'approved' ? new Date().toISOString() : null,
      };
      payments.set(id, payment);
      return payment;
    },
    setStatus(id, status) {
      const p = payments.get(String(id));
      if (p) p.status = status;
      return p;
    },
  };
  return mp;
}
