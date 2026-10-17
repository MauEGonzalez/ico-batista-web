import crypto from 'node:crypto';

// Sin caracteres ambiguos (0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomString(len) {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

/** Código de entrada: XXXX-XXXX-XXXX */
export function newTicketCode() {
  return `${randomString(4)}-${randomString(4)}-${randomString(4)}`;
}

/** Normaliza lo que escribe/escanea el portero (minúsculas, sin guiones, espacios) */
export function normalizeCode(input) {
  const raw = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 12) return null;
  const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  return /^[A-Z0-9-]{14}$/.test(code) ? code : null;
}

/** Si escanean el QR (URL completa) extrae el código */
export function codeFromScan(text) {
  const s = String(text || '');
  const m = s.match(/([A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4})\s*$/);
  return normalizeCode(m ? m[1] : s);
}

/** Id público de orden (va en external_reference y URLs) */
export function newPublicId() {
  return crypto.randomBytes(12).toString('hex');
}
