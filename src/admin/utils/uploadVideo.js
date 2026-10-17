// /src/admin/utils/uploadVideo.js
// Sube un video directo del navegador a Cloudinary (carpeta de desfiles) mostrando el progreso.
import { adminApi } from '../api/adminApi.js';

// El plan gratis de Cloudinary acepta videos de hasta 100 MB por archivo
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export const uploadVideo = async (file, onProgress = () => {}) => {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('El video pesa más de 100 MB. Subilo a YouTube o Vimeo y pegá el link.');
  }
  const { signature, timestamp, folder, apiKey, cloudName, resourceType } =
    await adminApi.getUploadSignature({ kind: 'video', target: 'runways' });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* respuesta vacía */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(data.error?.message || 'No se pudo subir el video'));
      }
    };
    xhr.onerror = () => reject(new Error('Sin conexión: no se pudo subir el video'));
    xhr.send(form);
  });
};
