// /src/utils/imageUrl.js
// Las fotos pueden ser rutas locales (placeholders viejos: "/assets/...") o fotos de Cloudinary ({ url, width, height }).
// A las de Cloudinary les pedimos el tamaño justo y el mejor formato para cada navegador (WebP/AVIF):
// una foto de 8 MB llega pesando ~100 KB.

const CLOUDINARY_UPLOAD = '/image/upload/';

const isCloudinary = (url) => typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(CLOUDINARY_UPLOAD);

const rawUrl = (image) => (typeof image === 'string' ? image : image?.url ?? '');

// URL de la foto con un ancho máximo
export const imageUrl = (image, width = 800) => {
  const url = rawUrl(image);
  if (!isCloudinary(url)) return url;
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}f_auto,q_auto,c_limit,w_${width}/`);
};

// srcSet para que el navegador elija el tamaño según la pantalla
const WIDTHS = [400, 700, 1000, 1400, 2000];
export const imageSrcSet = (image) => {
  const url = rawUrl(image);
  if (!isCloudinary(url)) return undefined;
  return WIDTHS.map((width) => `${imageUrl(url, width)} ${width}w`).join(', ');
};

// Proporción ancho/alto para reservar el espacio antes de que cargue
export const imageDimensions = (image) =>
  typeof image === 'object' && image?.width && image?.height
    ? { width: image.width, height: image.height }
    : {};
