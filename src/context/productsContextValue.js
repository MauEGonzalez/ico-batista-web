// /src/context/productsContextValue.js
import { createContext, useContext, useEffect } from 'react';

export const ProductsContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts debe usarse dentro de <ProductsProvider>');
  const { request } = context;
  useEffect(() => {
    request(); // el catálogo se pide la primera vez que alguien lo necesita
  }, [request]);
  return context;
};
