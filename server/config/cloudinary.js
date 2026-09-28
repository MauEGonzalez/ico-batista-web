// /server/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export const getCloudinary = () => {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Faltan las variables de entorno de Cloudinary');
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
};

// Carpeta raíz en Cloudinary para todo lo del sitio
export const CLOUDINARY_ROOT = 'icobatista';
