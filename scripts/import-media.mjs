// /scripts/import-media.mjs
// Importación masiva: lee una carpeta con una subcarpeta por prenda, sube las fotos a Cloudinary
// y crea cada prenda como BORRADOR (oculta) para completar precio, talles, etc. desde el panel.
//
// Uso:
//   npm run import-media -- "C:\ruta\fotos-ico" --dry     (solo muestra qué haría, no sube nada)
//   npm run import-media -- "C:\ruta\fotos-ico"           (importa)
//
// Estructura esperada (la ruta de carpetas = la categoría del menú):
//   fotos-ico/mujer/formal/fiesta/vestidos/vestido-aurora/1.jpg, 2.jpg...
//   fotos-ico/videos/portada.mp4 ...
// Se puede correr varias veces: las prendas ya importadas se saltean.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { connectDB } from '../server/config/db.js';
import { getCloudinary, CLOUDINARY_ROOT } from '../server/config/cloudinary.js';
import { Product } from '../server/models/Product.js';
import { nextProductCode } from '../server/models/Counter.js';
import { slugify } from '../server/utils/slugify.js';
import { isValidCategory } from '../src/categories.js';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tif', '.tiff']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const MAX_IMAGE_BYTES = 9 * 1024 * 1024;   // Límite del plan gratis: 10 MB por foto
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // Límite del plan gratis: 100 MB por video
const MAX_SIDE = 3000;
const PARALLEL = 3;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const root = args.find((arg) => !arg.startsWith('--'));

const naturalSort = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });

// "vestido-aurora-de-saten" -> "Vestido Aurora de Saten"; "Vestido Aurora de Satén" queda igual
const CONNECTORS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'con', 'en', 'a']);
const humanize = (folderName) =>
  folderName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, i) => (i > 0 && CONNECTORS.has(word.toLowerCase())
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');

// "Mujer/Formal/Fiesta/Vestidos" -> "mujer/formal/fiesta/vestidos"
const toCategory = (parts) => parts.map((part) => slugify(part)).join('/');

// Recorre la carpeta y devuelve las carpetas-prenda (las que tienen fotos adentro)
const findProductFolders = async (dir, relParts = [], found = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const images = entries
    .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort(naturalSort);

  if (images.length > 0 && relParts.length > 0) {
    found.push({ dir, relParts, images });
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && slugify(entry.name) !== 'videos') {
      await findProductFolders(path.join(dir, entry.name), [...relParts, entry.name], found);
    }
  }
  return found;
};

// Achica la foto si pesa más de lo permitido o es gigante
const prepareImage = async (filePath) => {
  const { size } = await fs.stat(filePath);
  try {
    const meta = await sharp(filePath).metadata();
    const tooBig = Math.max(meta.width || 0, meta.height || 0) > MAX_SIDE;
    if (size <= MAX_IMAGE_BYTES && !tooBig) return filePath;
    const buffer = await sharp(filePath)
      .rotate() // respeta la orientación de la cámara
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch {
    // Formato que sharp no lee (ej. HEIC): se sube tal cual si entra en el límite
    if (size > MAX_IMAGE_BYTES) throw new Error('La foto pesa más de 10 MB y no se pudo achicar');
    return filePath;
  }
};

// Corre tareas de a N en paralelo, manteniendo el orden de los resultados
const mapLimit = async (items, limit, fn) => {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const uniqueSlug = async (name) => {
  const base = slugify(name) || 'prenda';
  let slug = base;
  for (let i = 2; await Product.exists({ slug }); i += 1) slug = `${base}-${i}`;
  return slug;
};

const importVideos = async (cloudinary, videosDir, report) => {
  let files;
  try {
    files = (await fs.readdir(videosDir)).filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase())).sort(naturalSort);
  } catch {
    return; // No hay carpeta de videos
  }
  for (const file of files) {
    const filePath = path.join(videosDir, file);
    const { size } = await fs.stat(filePath);
    const name = slugify(path.parse(file).name);
    if (size > MAX_VIDEO_BYTES) {
      report.errors.push({ item: `videos/${file}`, error: 'Pesa más de 100 MB (límite del plan gratis). Hay que comprimirlo antes.' });
      console.log(`  ✖ videos/${file}: pesa más de 100 MB`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`  ▸ video ${file} → ${CLOUDINARY_ROOT}/videos/${name}`);
      continue;
    }
    const result = await cloudinary.uploader.upload_large(filePath, {
      resource_type: 'video',
      folder: `${CLOUDINARY_ROOT}/videos`,
      public_id: name,
      overwrite: true,
      chunk_size: 20 * 1024 * 1024,
    });
    // URL optimizada: calidad y formato automáticos, 720p máximo, sin audio
    const optimized = result.secure_url.replace('/video/upload/', '/video/upload/f_auto,q_auto,c_limit,h_1280,ac_none/');
    const poster = result.secure_url.replace('/video/upload/', '/video/upload/so_0,f_auto,q_auto,c_limit,h_1280/').replace(/\.\w+$/, '.jpg');
    report.videos.push({ file, url: optimized, poster });
    console.log(`  ✔ video ${file}`);
  }
};

const main = async () => {
  if (!root) {
    console.log('Uso: npm run import-media -- "C:\\ruta\\a\\fotos" [--dry]');
    process.exitCode = 1;
    return;
  }
  const rootDir = path.resolve(root);
  await fs.access(rootDir).catch(() => { throw new Error(`No existe la carpeta: ${rootDir}`); });

  console.log(`\n${DRY_RUN ? 'SIMULACIÓN (no se sube nada)' : 'IMPORTANDO'} desde ${rootDir}\n`);
  const folders = await findProductFolders(rootDir);
  const report = { created: [], skipped: [], invalid: [], errors: [], videos: [] };

  if (!DRY_RUN) await connectDB();
  const cloudinary = DRY_RUN ? null : getCloudinary();

  for (const [index, folder] of folders.entries()) {
    const categoryParts = folder.relParts.slice(0, -1);
    const folderName = folder.relParts.at(-1);
    const category = toCategory(categoryParts);
    const importKey = folder.relParts.map(slugify).join('/');
    const name = humanize(folderName);
    const label = `[${index + 1}/${folders.length}] ${folder.relParts.join('/')}`;

    if (!isValidCategory(category)) {
      report.invalid.push({ folder: folder.relParts.join('/'), category, photos: folder.images.length });
      console.log(`  ⚠ ${label}: la categoría "${category || '(ninguna)'}" no existe en el menú → se saltea`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ▸ ${label} → "${name}" (${category}) · ${folder.images.length} fotos`);
      report.created.push({ name, category, photos: folder.images.length });
      continue;
    }

    if (await Product.exists({ importKey })) {
      report.skipped.push(importKey);
      console.log(`  · ${label}: ya estaba importada`);
      continue;
    }

    try {
      const slug = await uniqueSlug(name);
      const images = await mapLimit(folder.images, PARALLEL, async (file) => {
        const source = await prepareImage(path.join(folder.dir, file));
        const result = await cloudinary.uploader.upload(source, {
          folder: `${CLOUDINARY_ROOT}/products`,
          public_id: `${slug}-${slugify(path.parse(file).name)}`,
          overwrite: true,
          resource_type: 'image',
        });
        return { publicId: result.public_id, url: result.secure_url, width: result.width, height: result.height };
      });
      const code = await nextProductCode();
      await Product.create({ name, slug, code, categories: [category], images, status: 'draft', importKey });
      report.created.push({ code, name, slug, category, photos: images.length });
      console.log(`  ✔ ${label} → ${code} "${name}" · ${images.length} fotos`);
    } catch (error) {
      report.errors.push({ item: folder.relParts.join('/'), error: error.message || String(error) });
      console.log(`  ✖ ${label}: ${error.message || error}`);
    }
  }

  const videosDir = (await fs.readdir(rootDir, { withFileTypes: true }))
    .find((e) => e.isDirectory() && slugify(e.name) === 'videos');
  if (videosDir) {
    console.log('\nVideos:');
    await importVideos(cloudinary, path.join(rootDir, videosDir.name), report);
  }

  const reportPath = path.join(process.cwd(), `import-report${DRY_RUN ? '-simulacion' : ''}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\nResumen:
  ${DRY_RUN ? 'Se importarían' : 'Importadas'}: ${report.created.length} prendas
  Ya existentes: ${report.skipped.length}
  Carpetas con categoría inválida: ${report.invalid.length}
  Errores: ${report.errors.length}
  Detalle en: ${reportPath}\n`);
};

main()
  .catch((error) => {
    console.error(`\n✖ ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
