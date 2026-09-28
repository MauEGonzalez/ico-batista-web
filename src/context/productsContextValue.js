// /src/context/productsContextValue.js
import { createContext, useContext } from 'react';

export const ProductsContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts debe usarse dentro de <ProductsProvider>');
  return context;
};
