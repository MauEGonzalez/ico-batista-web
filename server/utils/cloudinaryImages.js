// /server/utils/cloudinaryImages.js
import { getCloudinary, CLOUDINARY_ROOT } from '../config/cloudinary.js';

// Borra fotos de Cloudinary. Si falla no corta el guardado: a lo sumo queda una foto huérfana.
export const destroyImages = async (publicIds = []) => {
  const ours = publicIds.filter((id) => typeof id === 'string' && id.startsWith(`${CLOUDINARY_ROOT}/`));
  if (ours.length === 0) return;
  try {
    const cloudinary = getCloudinary();
    await cloudinary.api.delete_resources(ours, { resource_type: 'image' });
  } catch (error) {
    console.error('No se pudieron borrar fotos de Cloudinary:', error.message || error.error?.message || error);
  }
};
