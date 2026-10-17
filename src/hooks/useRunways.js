// /src/hooks/useRunways.js
// Desfiles publicados. Se piden UNA vez a la API (igual que las prendas) y se comparten entre
// el menú y las páginas /desfiles: navegar entre ellas no vuelve a pedir nada.
import { useEffect, useState } from 'react';

let cache = null;   // Lista ya cargada
let pending = null; // Pedido en curso (para no repetirlo si varios componentes lo piden a la vez)

const fetchRunways = async () => {
  // Vista previa desde el panel (?preview=...): se saltea la caché de la CDN
  const isPreview = new URLSearchParams(window.location.search).has('preview');
  const response = await fetch(isPreview ? `/api/runways?preview=${Date.now()}` : '/api/runways');
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!response.ok || !isJson) throw new Error(`API ${response.status}`);
  return response.json();
};

const loadRunways = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetchRunways()
      .then((data) => {
        cache = Array.isArray(data) ? data : [];
        return cache;
      })
      .catch((error) => {
        // Sin API (por ej. en desarrollo) no hay desfiles: el menú simplemente no los muestra
        if (import.meta.env.DEV) console.info('[Ico Batista] No se pudieron cargar los desfiles:', error.message);
        pending = null; // Permite reintentar más adelante
        return null;
      });
  }
  return pending;
};

// Devuelve { runways, loading, error }
export const useRunways = () => {
  const [state, setState] = useState(() => ({ runways: cache ?? [], loading: !cache, error: false }));

  useEffect(() => {
    if (cache) return undefined;
    let cancelled = false;
    loadRunways().then((data) => {
      if (!cancelled) setState({ runways: data ?? [], loading: false, error: data === null });
    });
    return () => { cancelled = true; };
  }, []);

  return state;
};
