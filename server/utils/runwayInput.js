// /server/utils/runwayInput.js
// Limpia y valida lo que llega del panel para un desfile: solo estos campos, con su tipo correcto.
import { CLOUDINARY_ROOT } from '../config/cloudinary.js';
import { cleanString, cleanImage, cleanImages, isOurImage } from './productInput.js';
import { parseVideoUrl } from './videoUrl.js';

export const INVALID_VIDEO = 'El video tiene que ser un link de YouTube o Vimeo, o un video subido desde el panel';
export const INVALID_DATE = 'La fecha no es válida';

// "2025-11-29" -> Date a las 00:00 UTC. '' / null -> null. Otra cosa -> undefined (inválida)
const cleanDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const valid = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d && y >= 1950 && y <= 2100;
  return valid ? date : undefined;
};

// null = sin video. undefined = link inválido.
const cleanVideo = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const rawUrl = typeof value === 'string' ? value : value.url;
  if (!rawUrl || !String(rawUrl).trim()) return null;
  const parsed = parseVideoUrl(String(rawUrl).slice(0, 500));
  if (!parsed) return undefined;
  const video = { url: parsed.url };
  // Solo se guarda el publicId de videos nuestros (para borrarlo de Cloudinary si se quita)
  const publicId = typeof value === 'object' ? value.publicId : null;
  if (parsed.provider === 'cloudinary' && typeof publicId === 'string' && publicId.startsWith(`${CLOUDINARY_ROOT}/`)) {
    video.publicId = publicId.slice(0, 300);
  }
  return video;
};

// partial = true en ediciones: solo se actualiza lo que vino.
// Devuelve { data } o { error } con un mensaje para mostrar en el panel.
export const cleanRunwayInput = (body = {}, { partial = false } = {}) => {
  const data = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has('title')) data.title = cleanString(body.title, 140);
  if (!partial || has('location')) data.location = cleanString(body.location, 160);
  if (!partial || has('collection')) data.collectionName = cleanString(body.collection, 140);
  if (!partial || has('description')) data.description = cleanString(body.description, 5000);
  if (!partial || has('status')) data.status = body.status === 'published' ? 'published' : 'draft';
  if (!partial || has('gallery')) data.gallery = cleanImages(body.gallery, 60);
  if (!partial || has('coverImage')) data.coverImage = isOurImage(body.coverImage) ? cleanImage(body.coverImage) : null;

  if (!partial || has('date')) {
    data.date = cleanDate(body.date);
    if (data.date === undefined) return { error: INVALID_DATE };
  }
  if (!partial || has('video')) {
    data.video = cleanVideo(body.video);
    if (data.video === undefined) return { error: INVALID_VIDEO };
  }

  return { data };
};
