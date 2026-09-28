// /server/utils/productInput.js
// Limpia y valida lo que llega del panel: solo se aceptan estos campos, con su tipo correcto.
import { CLOUDINARY_ROOT } from '../config/cloudinary.js';

const cleanString = (value, max) => String(value ?? '').trim().slice(0, max);

const cleanPrice = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
};

const cleanSizes = (value) => {
  if (!Array.isArray(value)) return [];
  const unique = [...new Set(value.map((size) => cleanString(size, 20)).filter(Boolean))];
  return unique.slice(0, 20);
};

const isOurImage = (image) =>
  image &&
  typeof image.publicId === 'string' &&
  image.publicId.startsWith(`${CLOUDINARY_ROOT}/`) &&
  typeof image.url === 'string' &&
  image.url.startsWith('https://res.cloudinary.com/');

const cleanImages = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(isOurImage).slice(0, 30).map((image) => ({
    publicId: image.publicId,
    url: image.url,
    width: Number(image.width) || undefined,
    height: Number(image.height) || undefined,
  }));
};

// partial = true en ediciones: solo se actualiza lo que vino
export const cleanProductInput = (body = {}, { partial = false } = {}) => {
  const data = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has('name')) data.name = cleanString(body.name, 120);
  if (!partial || has('category')) data.category = cleanString(body.category, 100);
  if (!partial || has('description')) data.description = cleanString(body.description, 2000);
  if (!partial || has('price')) data.price = cleanPrice(body.price);
  if (!partial || has('sizes')) data.sizes = cleanSizes(body.sizes);
  if (!partial || has('measurements')) data.measurements = cleanString(body.measurements, 300);
  if (!partial || has('madeToMeasure')) data.madeToMeasure = body.madeToMeasure !== false;
  if (!partial || has('images')) data.images = cleanImages(body.images);
  if (!partial || has('status')) data.status = body.status === 'published' ? 'published' : 'draft';
  if (!partial || has('featured')) data.featured = body.featured === true;

  return data;
};
