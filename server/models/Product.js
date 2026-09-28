// /server/models/Product.js
import mongoose from 'mongoose';
import { isValidCategory } from '../../src/categories.js';

const imageSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true }, // Identificador en Cloudinary (para borrarla)
    url: { type: String, required: true },      // URL original; la web le agrega el tamaño/formato
    width: Number,
    height: Number,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 120 },
    // Se usa en la URL: /producto/vestido-aurora
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      validate: { validator: isValidCategory, message: 'Categoría inválida' },
    },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    // Precio en pesos uruguayos. null = "Consultar precio"
    price: { type: Number, min: [0, 'El precio no puede ser negativo'], default: null },
    sizes: { type: [String], default: [] },            // Talles en stock: ['S', 'M']
    measurements: { type: String, trim: true, maxlength: 300, default: '' },
    madeToMeasure: { type: Boolean, default: true },   // Se puede pedir a medida
    images: { type: [imageSchema], default: [] },      // La primera es la portada
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },       // Aparece en "Productos destacados"
    // Carpeta de origen si vino de la importación masiva (evita importarla dos veces)
    importKey: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

productSchema.index({ status: 1, category: 1 });

// Formato que consume la web pública (sin campos internos)
productSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this.slug,
    name: this.name,
    category: this.category,
    description: this.description,
    price: this.price,
    sizes: this.sizes,
    measurements: this.measurements,
    madeToMeasure: this.madeToMeasure,
    featured: this.featured,
    images: this.images.map(({ url, width, height }) => ({ url, width, height })),
  };
};

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
