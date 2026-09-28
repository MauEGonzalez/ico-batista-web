// /src/context/cartContextValue.js
// El contexto y el hook viven separados del Provider para que el Fast Refresh de Vite funcione bien.
import { createContext, useContext } from 'react';

export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return context;
};
