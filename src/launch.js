// /src/launch.js
// Lanzamiento de la tienda. Mientras SITIO_ABIERTO sea false, la web muestra la página
// "Próximamente" y solo funcionan: entradas del desfile, panel (/admin), términos y privacidad.
//
// Para abrir la tienda: en Vercel agregar VITE_SITIO_ABIERTO=1 (Production) y redeployar.
// Vista previa para Ico y Mauro (en ese navegador queda guardada):
//   icobatista.com/?vista=previa   → ver la tienda completa
//   icobatista.com/?vista=publica  → volver a ver lo que ve el público
const KEY = 'ib_vista_previa';

function previewActiva() {
  if (typeof window === 'undefined') return false;
  try {
    const v = new URLSearchParams(window.location.search).get('vista');
    if (v === 'previa') window.localStorage.setItem(KEY, '1');
    if (v === 'publica') window.localStorage.removeItem(KEY);
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return new URLSearchParams(window.location.search).get('vista') === 'previa';
  }
}

export const SITIO_ABIERTO = import.meta.env.VITE_SITIO_ABIERTO === '1' || previewActiva();
