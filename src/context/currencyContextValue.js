// /src/context/currencyContextValue.js
import { createContext, useContext } from 'react';

export const CurrencyContext = createContext(null);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>');
  }
  return context;
};
