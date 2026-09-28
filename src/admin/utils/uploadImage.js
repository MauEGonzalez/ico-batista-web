// /src/admin/utils/uploadImage.js
// Achica la foto en el navegador (si hace falta) y la sube directo a Cloudinary mostrando el progreso.
import { adminApi } from '../api/adminApi.js';

const MAX_SIDE = 3000;              // Suficiente para el zoom de la ficha; más es peso de más
const MAX_BYTES = 9 * 1024 * 1024;  // El plan gratis de Cloudinary acepta hasta 10 MB por foto

// Devuelve el archivo original si ya es chico, o una versión JPEG reducida si no
export const prepareImage = async (file) => {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // El navegador no puede leer el formato (ej. HEIC en Windows): se sube tal cual
    return file;
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  if (scale === 1 && file.size <= MAX_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

// Sube a Cloudinary con XMLHttpRequest (fetch no informa el progreso de subida)
export const uploadImage = async (file, onProgress = () => {}) => {
  const prepared = await prepareImage(file);
  const { signature, timestamp, folder, apiKey, cloudName } = await adminApi.getUploadSignature();

  const form = new FormData();
  form.append('file', prepared);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* respuesta vacía */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          publicId: data.public_id,
          url: data.secure_url,
          width: data.width,
          height: data.height,
        });
      } else {
        reject(new Error(data.error?.message || 'No se pudo subir la foto'));
      }
    };
    xhr.onerror = () => reject(new Error('Sin conexión: no se pudo subir la foto'));
    xhr.send(form);
  });
};
