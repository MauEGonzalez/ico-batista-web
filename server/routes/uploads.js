// /server/routes/uploads.js
// Las fotos se suben DIRECTO del navegador a Cloudinary (Vercel no acepta archivos de más de 4,5 MB).
// El servidor solo firma el permiso de subida, así nadie sin sesión puede subir a nuestra cuenta.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCloudinary, CLOUDINARY_ROOT } from '../config/cloudinary.js';

const router = Router();
router.use(requireAuth);

router.post('/signature', (req, res) => {
  const cloudinary = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CLOUDINARY_ROOT}/products`;
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  res.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
