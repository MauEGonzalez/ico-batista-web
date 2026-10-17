// /server/utils/email.js
// Validación de emails de los formularios públicos (suscripción y contacto).

// Suficiente para descartar errores de tipeo y basura; no intenta cubrir todo el RFC.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z0-9-]{2,}$/i;

export const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase().slice(0, 254);

export const isValidEmail = (email) => email.length <= 254 && EMAIL_PATTERN.test(email);
