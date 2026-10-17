// /src/context/ProductsContext.jsx
// Catálogo de prendas publicadas. Se pide UNA vez a la API y queda en memoria:
// navegar entre categorías, buscar y abrir fichas es instantáneo.
// Se pide recién cuando un componente usa useProducts(): las páginas que no muestran
// prendas (entradas, "Próximamente") no descargan el catálogo.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ProductsContext } from './productsContextValue.js';

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requested, setRequested] = useState(false);
  const request = useCallback(() => setRequested(true), []);

  useEffect(() => {
    if (!requested) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        // Vista previa desde el panel (?preview=...): se saltea la caché para ver el último orden guardado
        const isPreview = new URLSearchParams(window.location.search).has('preview');
        const response = await fetch(isPreview ? `/api/products?preview=${Date.now()}` : '/api/products');
        const isJson = response.headers.get('content-type')?.includes('application/json');
        if (!response.ok || !isJson) throw new Error(`API ${response.status}`);
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError('No pudimos cargar las prendas. Prueba recargar la página.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [requested]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    request,
    getProduct: (id) => products.find((product) => product.id === id),
  }), [products, loading, error, request]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
