// /src/context/CurrencyContext.jsx
// Moneda elegida (UYU o USD) y tipo de cambio del día.
// La elección se recuerda en el navegador; el tipo de cambio se guarda 12 h para no pedirlo en cada visita.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CurrencyContext } from './currencyContextValue.js';
import { formatPrice } from '../utils/formatPrice.js';

const CURRENCY_KEY = 'icobatista-currency';
const RATE_KEY = 'icobatista-usd-rate';
const RATE_MAX_AGE = 12 * 60 * 60 * 1000; // 12 horas
const FALLBACK_RATE = 40; // Se usa si no se puede consultar el tipo de cambio
// API gratuita, sin clave, actualizada una vez por día.
// TODO: cuando esté el backend, pedir el tipo de cambio a nuestra API.
const RATE_API = 'https://open.er-api.com/v6/latest/USD';

const readStorage = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* modo privado: no pasa nada */ }
};

const loadCachedRate = () => {
  try {
    const cached = JSON.parse(readStorage(RATE_KEY));
    if (cached?.rate > 0) return cached;
  } catch { /* sin caché */ }
  return null;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() =>
    readStorage(CURRENCY_KEY) === 'USD' ? 'USD' : 'UYU'
  );
  const [rate, setRate] = useState(() => loadCachedRate()?.rate ?? FALLBACK_RATE);

  useEffect(() => {
    const cached = loadCachedRate();
    if (cached && Date.now() - cached.savedAt < RATE_MAX_AGE) return;

    const controller = new AbortController();
    fetch(RATE_API, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        const uyu = data?.rates?.UYU;
        if (typeof uyu === 'number' && uyu > 0) {
          setRate(uyu);
          writeStorage(RATE_KEY, JSON.stringify({ rate: uyu, savedAt: Date.now() }));
        }
      })
      .catch(() => { /* sin conexión o API caída: queda el último valor conocido */ });
    return () => controller.abort();
  }, []);

  const setCurrency = useCallback((next) => {
    setCurrencyState(next);
    writeStorage(CURRENCY_KEY, next);
  }, []);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    rate,
    format: (valueUYU) => formatPrice(valueUYU, currency, rate),
  }), [currency, setCurrency, rate]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
