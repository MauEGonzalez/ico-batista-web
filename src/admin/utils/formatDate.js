// /src/admin/utils/formatDate.js
// Fechas del panel en formato uruguayo.

// "2025-11-29" (fecha sin hora) -> "29/11/2025". Se lee en UTC para que no se corra un día.
export const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-UY', { timeZone: 'UTC' });
};

// Fecha y hora local: "29/11/2025, 18:30"
export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' });
};
