// /server/routes/uploads.js
// Las fotos y videos se suben DIRECTO del navegador a Cloudinary (Vercel no acepta archivos de más de 4,5 MB).
// El servidor solo firma el permiso de subida, así nadie sin sesión puede subir a nuestra cuenta.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCloudinary, CLOUDINARY_ROOT } from '../config/cloudinary.js';

const router = Router();
router.use(requireAuth);

// Carpetas permitidas en Cloudinary según qué se sube y para qué.
// Body opcional: { kind: 'image' | 'video', target: 'products' | 'runways' }. Sin body = fotos de prendas.
const FOLDERS = {
  image: { products: 'products', runways: 'runways' },
  video: { runways: 'runways/videos' },
};

router.post('/signature', (req, res) => {
  const kind = req.body?.kind === 'video' ? 'video' : 'image';
  const target = typeof req.body?.target === 'string' ? req.body.target : 'products';
  const subfolder = FOLDERS[kind][target];
  if (!subfolder) return res.status(400).json({ message: 'Tipo de archivo no permitido' });

  const cloudinary = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CLOUDINARY_ROOT}/${subfolder}`;
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  return res.json({
    signature,
    timestamp,
    folder,
    resourceType: kind, // El navegador sube a .../<resourceType>/upload
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
