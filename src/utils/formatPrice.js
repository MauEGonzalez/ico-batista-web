// /src/utils/formatPrice.js
// Los precios se cargan SIEMPRE en pesos uruguayos (UYU).
// En dólares se muestran convertidos con el tipo de cambio del día (aproximado).

const formatters = {
  UYU: new Intl.NumberFormat('es-UY', {
    style: 'currency', currency: 'UYU', currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('es-UY', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }),
};

// valueUYU: precio en pesos. rate: cuántos pesos vale 1 dólar.
export const formatPrice = (valueUYU, currency = 'UYU', rate = 40) => {
  if (currency === 'USD') {
    return formatters.USD.format(valueUYU / rate);
  }
  return formatters.UYU.format(valueUYU);
};

// Una prenda "tiene precio" si es un número mayor a 0
export const hasPrice = (value) => typeof value === 'number' && value > 0;
