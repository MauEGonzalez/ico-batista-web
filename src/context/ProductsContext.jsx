// /src/context/ProductsContext.jsx
// Catálogo de prendas publicadas. Se pide UNA vez a la API y queda en memoria:
// navegar entre categorías, buscar y abrir fichas es instantáneo.
import React, { useEffect, useMemo, useState } from 'react';
import { ProductsContext } from './productsContextValue.js';

// En desarrollo, si la API no está corriendo, se usan los productos de ejemplo (productsData.js).
// En producción esto no se incluye.
const loadLocalSample = async () => {
  if (!import.meta.env.DEV) return null;
  const { productsData } = await import('../productsData.js');
  console.info('[Ico Batista] API no disponible: usando productos de ejemplo (solo en desarrollo)');
  return productsData;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/products');
        const isJson = response.headers.get('content-type')?.includes('application/json');
        if (!response.ok || !isJson) throw new Error(`API ${response.status}`);
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch (err) {
        const sample = await loadLocalSample();
        if (cancelled) return;
        if (sample) setProducts(sample);
        else setError('No pudimos cargar las prendas. Probá recargar la página.');
        if (!sample) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    getProduct: (id) => products.find((product) => product.id === id),
  }), [products, loading, error]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
