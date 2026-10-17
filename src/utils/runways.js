// /src/utils/runways.js
// Ayudas para mostrar desfiles en la web.
import { COLLECTIONS } from '../collections.js';

// "2025-11-29" -> "29 de noviembre de 2025" (se lee en UTC para que no se corra un día)
export const formatRunwayDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
};

// Imagen para el listado: la portada; si no hay, la miniatura de YouTube
export const runwayThumbnail = (runway) => {
  if (runway.coverImage) return runway.coverImage;
  if (runway.video?.provider === 'youtube' && runway.video.id) {
    return { url: `https://i.ytimg.com/vi/${runway.video.id}/hqdefault.jpg`, width: 480, height: 360 };
  }
  return null;
};

const normalize = (text) => String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Si la colección del desfile es una de las colecciones de la tienda, devuelve su link
export const collectionPath = (name) => {
  if (!name) return null;
  const match = COLLECTIONS.find((collection) => normalize(collection.title) === normalize(name));
  return match ? `/colecciones/${match.slug}` : null;
};
