// /server/routes/products.js
import { Router } from 'express';
import { Product } from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanProductInput } from '../utils/productInput.js';
import { slugify } from '../utils/slugify.js';
import { destroyImages } from '../utils/cloudinaryImages.js';
import { nextProductCode } from '../models/Counter.js';

// ================= Rutas públicas (la web) =================
export const publicRouter = Router();

publicRouter.get('/', async (req, res) => {
  const products = await Product.find({ status: 'published' })
    .sort({ featured: -1, createdAt: -1 });
  // La CDN de Vercel guarda la respuesta 1 minuto: la web vuela y la base casi no se usa.
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  res.json(products.map((product) => product.toPublicJSON()));
});

// ================= Rutas del panel (requieren sesión) =================
export const adminRouter = Router();
adminRouter.use(requireAuth);

// Genera un slug único: "vestido-aurora", "vestido-aurora-2", ...
const uniqueSlug = async (name, excludeId) => {
  const base = slugify(name) || 'prenda';
  let slug = base;
  let counter = 2;
  while (await Product.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

const toAdminListItem = (product) => ({
  _id: product._id,
  name: product.name,
  slug: product.slug,
  code: product.code,
  categories: product.categories,
  price: product.price,
  status: product.status,
  featured: product.featured,
  cover: product.images[0]?.url ?? null,
  imageCount: product.images.length,
  updatedAt: product.updatedAt,
});

adminRouter.get('/', async (req, res) => {
  const products = await Product.find().sort({ updatedAt: -1 });
  res.json(products.map(toAdminListItem));
});

// Cambiar el estado de varias prendas a la vez (publicar / pasar a borrador)
// Body: { ids: [...], status: 'published' | 'draft' }
adminRouter.post('/bulk-status', async (req, res) => {
  const status = req.body?.status === 'published' ? 'published' : req.body?.status === 'draft' ? 'draft' : null;
  const ids = Array.isArray(req.body?.ids)
    ? [...new Set(req.body.ids.map(String))].filter((id) => /^[a-f0-9]{24}$/i.test(id)).slice(0, 1000)
    : [];
  if (!status || ids.length === 0) {
    return res.status(400).json({ message: 'Elegí al menos una prenda' });
  }

  let skipped = [];
  let targetIds = ids;
  if (status === 'published') {
    // Sin foto o sin categoría no se puede publicar: esas se saltean y se informan
    const products = await Product.find({ _id: { $in: ids } }).select('name code images categories');
    const ready = products.filter((p) => p.images.length > 0 && p.categories?.length > 0);
    skipped = products
      .filter((p) => !ready.includes(p))
      .map((p) => ({ id: p._id, name: p.name, code: p.code, reason: p.images.length === 0 ? 'sin fotos' : 'sin categoría' }));
    targetIds = ready.map((p) => p._id);
  }

  const result = targetIds.length
    ? await Product.updateMany({ _id: { $in: targetIds } }, { $set: { status } })
    : { matchedCount: 0 };
  return res.json({ updated: result.matchedCount, updatedIds: targetIds.map(String), skipped });
});

adminRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Prenda no encontrada' });
  return res.json(product);
});

const NEEDS_PHOTO = 'Para publicar la prenda necesita al menos una foto';

adminRouter.post('/', async (req, res) => {
  const data = cleanProductInput(req.body);
  if (!data.name) return res.status(400).json({ message: 'El nombre es obligatorio' });
  if (data.status === 'published' && data.images.length === 0) {
    return res.status(400).json({ message: NEEDS_PHOTO });
  }
  if (data.categories.length === 0) return res.status(400).json({ message: 'Elegí al menos una categoría' });
  data.slug = await uniqueSlug(data.name);
  const product = new Product(data);
  await product.validate(); // Primero se valida: así un error no "gasta" un código
  product.code = await nextProductCode();
  await product.save();
  res.status(201).json(product);
});

adminRouter.put('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Prenda no encontrada' });

  const data = cleanProductInput(req.body, { partial: true });
  if ('name' in data && !data.name) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  const finalImages = data.images ?? product.images;
  if ((data.status ?? product.status) === 'published' && finalImages.length === 0) {
    return res.status(400).json({ message: NEEDS_PHOTO });
  }
  // El slug (la URL) NO cambia al renombrar: así no se rompen los links ya compartidos por WhatsApp.

  // Fotos que se sacaron de la prenda: se borran de Cloudinary
  const removedImages = 'images' in data
    ? product.images.filter((old) => !data.images.some((img) => img.publicId === old.publicId))
    : [];

  product.set(data);
  await product.save();
  await destroyImages(removedImages.map((img) => img.publicId));
  return res.json(product);
});

adminRouter.delete('/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Prenda no encontrada' });
  await destroyImages(product.images.map((img) => img.publicId));
  return res.json({ ok: true });
});
