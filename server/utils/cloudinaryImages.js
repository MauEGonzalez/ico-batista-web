import { getCloudinary, CLOUDINARY_ROOT } from '../config/cloudinary.js';

// Borra archivos de Cloudinary. Si falla no corta el guardado: a lo sumo queda un archivo huérfano.
const destroyResources = async (publicIds, resourceType) => {
  const ours = publicIds.filter((id) => typeof id === 'string' && id.startsWith(`${CLOUDINARY_ROOT}/`));
  if (ours.length === 0) return;
  try {
    const cloudinary = getCloudinary();
    await cloudinary.api.delete_resources(ours, { resource_type: resourceType });
  } catch (error) {
    console.error(`No se pudieron borrar archivos (${resourceType}) de Cloudinary:`, error.message || error.error?.message || error);
  }
};

export const destroyImages = (publicIds = []) => destroyResources(publicIds, 'image');

export const destroyVideos = (publicIds = []) => destroyResources(publicIds, 'video');
