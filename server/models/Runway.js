// /server/models/Runway.js
// Desfiles de Ico: se cargan desde el panel y se ven en /desfiles.
import mongoose from 'mongoose';
import { imageSchema } from './imageSchema.js';
import { parseVideoUrl } from '../utils/videoUrl.js';

const videoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },  // YouTube, Vimeo o Cloudinary (validado en runwayInput.js)
    publicId: { type: String },             // Solo si se subió a Cloudinary (para poder borrarlo)
  },
  { _id: false }
);

const runwaySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 140 },
    // Se usa en la URL: /desfiles/el-lujo-del-tiempo. No cambia al renombrar.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    date: { type: Date, default: null },                       // Fecha del desfile (día, sin hora)
    location: { type: String, trim: true, maxlength: 160, default: '' },
    // Colección que se presentó (ej. "El lujo del tiempo"). En la API se llama "collection";
    // acá no, porque "collection" es un nombre reservado de Mongoose.
    collectionName: { type: String, trim: true, maxlength: 140, default: '' },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    video: { type: videoSchema, default: null },
    coverImage: { type: imageSchema, default: null },
    gallery: { type: [imageSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

runwaySchema.index({ status: 1, date: -1 });

// "2025-11-29" (la fecha se guarda a las 00:00 UTC, así no se corre un día por la zona horaria)
const toDateString = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

const publicVideo = (video) => {
  const parsed = video?.url ? parseVideoUrl(video.url) : null;
  return parsed ? { provider: parsed.provider, url: parsed.url, embedUrl: parsed.embedUrl, id: parsed.id } : null;
};

const publicImage = (image) => (image ? { url: image.url, width: image.width, height: image.height } : null);

// Formato que consume la web pública (sin campos internos)
runwaySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    slug: this.slug,
    title: this.title,
    date: toDateString(this.date),
    location: this.location,
    collection: this.collectionName,
    description: this.description,
    video: publicVideo(this.video),
    coverImage: publicImage(this.coverImage),
    gallery: this.gallery.map(publicImage),
  };
};

runwaySchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    _id: this._id,
    title: this.title,
    slug: this.slug,
    date: toDateString(this.date),
    location: this.location,
    collection: this.collectionName,
    description: this.description,
    video: this.video ? { url: this.video.url, publicId: this.video.publicId ?? null, provider: publicVideo(this.video)?.provider ?? null } : null,
    coverImage: this.coverImage,
    gallery: this.gallery,
    status: this.status,
    updatedAt: this.updatedAt,
  };
};

export const Runway = mongoose.models.Runway || mongoose.model('Runway', runwaySchema);
