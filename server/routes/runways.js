// /server/routes/runways.js
import { Router } from 'express';
import { Runway } from '../models/Runway.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanRunwayInput } from '../utils/runwayInput.js';
import { slugify } from '../utils/slugify.js';
import { destroyImages, destroyVideos } from '../utils/cloudinaryImages.js';

// Los más recientes primero; a igual fecha, el último cargado
const BY_DATE = { date: -1, createdAt: -1 };

// ================= Rutas públicas (la web) =================
export const publicRouter = Router();

// Igual que /api/products: la CDN de Vercel guarda la respuesta 1 minuto
const PUBLIC_CACHE = 'public, s-maxage=60, stale-while-revalidate=600';

publicRouter.get('/', async (req, res) => {
  const runways = await Runway.find({ status: 'published' }).sort(BY_DATE);
  res.set('Cache-Control', PUBLIC_CACHE);
  res.json(runways.map((runway) => runway.toPublicJSON()));
});

publicRouter.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug).toLowerCase().slice(0, 100);
  const runway = await Runway.findOne({ slug, status: 'published' });
  if (!runway) return res.status(404).json({ message: 'Desfile no encontrado' });
  res.set('Cache-Control', PUBLIC_CACHE);
  return res.json(runway.toPublicJSON());
});

// ================= Rutas del panel (requieren sesión) =================
export const adminRouter = Router();
adminRouter.use(requireAuth);

// Genera un slug único: "desfile-montevideo", "desfile-montevideo-2", ...
const uniqueSlug = async (title) => {
  const base = slugify(title) || 'desfile';
  let slug = base;
  let counter = 2;
  while (await Runway.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

const toAdminListItem = (runway) => ({
  _id: runway._id,
  title: runway.title,
  slug: runway.slug,
  date: runway.date ? runway.date.toISOString().slice(0, 10) : null,
  location: runway.location,
  collection: runway.collectionName,
  status: runway.status,
  cover: runway.coverImage?.url ?? null,
  galleryCount: runway.gallery.length,
  hasVideo: Boolean(runway.video?.url),
  updatedAt: runway.updatedAt,
});

// Para publicar hace falta la fecha y algo para mostrar (portada o video)
const publishError = ({ date, coverImage, video }) => {
  if (!date) return 'Para publicar el desfile necesita una fecha';
  if (!coverImage && !video) return 'Para publicar el desfile necesita una foto de portada o un video';
  return null;
};

adminRouter.get('/', async (req, res) => {
  const runways = await Runway.find().sort(BY_DATE);
  res.json(runways.map(toAdminListItem));
});

adminRouter.get('/:id', async (req, res) => {
  const runway = await Runway.findById(req.params.id);
  if (!runway) return res.status(404).json({ message: 'Desfile no encontrado' });
  return res.json(runway.toAdminJSON());
});

adminRouter.post('/', async (req, res) => {
  const { data, error } = cleanRunwayInput(req.body);
  if (error) return res.status(400).json({ message: error });
  if (!data.title) return res.status(400).json({ message: 'El título es obligatorio' });
  if (data.status === 'published') {
    const message = publishError(data);
    if (message) return res.status(400).json({ message });
  }
  data.slug = await uniqueSlug(data.title);
  const runway = await Runway.create(data);
  res.status(201).json(runway.toAdminJSON());
});

adminRouter.put('/:id', async (req, res) => {
  const runway = await Runway.findById(req.params.id);
  if (!runway) return res.status(404).json({ message: 'Desfile no encontrado' });

  const { data, error } = cleanRunwayInput(req.body, { partial: true });
  if (error) return res.status(400).json({ message: error });
  if ('title' in data && !data.title) return res.status(400).json({ message: 'El título es obligatorio' });

  const final = {
    date: 'date' in data ? data.date : runway.date,
    coverImage: 'coverImage' in data ? data.coverImage : runway.coverImage,
    video: 'video' in data ? data.video : runway.video,
  };
  if ((data.status ?? runway.status) === 'published') {
    const message = publishError(final);
    if (message) return res.status(400).json({ message });
  }
  // El slug (la URL) NO cambia al renombrar: así no se rompen los links ya compartidos.

  // Fotos y video que se sacaron: se borran de Cloudinary después de guardar
  const keptIds = new Set([
    ...(final.coverImage ? [final.coverImage.publicId] : []),
    ...('gallery' in data ? data.gallery : runway.gallery).map((img) => img.publicId),
  ]);
  const oldImages = [runway.coverImage, ...runway.gallery].filter(Boolean);
  const removedImages = oldImages.map((img) => img.publicId).filter((id) => !keptIds.has(id));
  const removedVideo = runway.video?.publicId && runway.video.publicId !== final.video?.publicId
    ? [runway.video.publicId]
    : [];

  runway.set(data);
  await runway.save();
  await Promise.all([destroyImages(removedImages), destroyVideos(removedVideo)]);
  return res.json(runway.toAdminJSON());
});

adminRouter.delete('/:id', async (req, res) => {
  const runway = await Runway.findByIdAndDelete(req.params.id);
  if (!runway) return res.status(404).json({ message: 'Desfile no encontrado' });
  await Promise.all([
    destroyImages([runway.coverImage, ...runway.gallery].filter(Boolean).map((img) => img.publicId)),
    destroyVideos(runway.video?.publicId ? [runway.video.publicId] : []),
  ]);
  return res.json({ ok: true });
});
