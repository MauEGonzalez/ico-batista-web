// /server/utils/migrations.js
// Ajustes automáticos de datos viejos. Corren una vez cada vez que arranca el servidor
// y no hacen nada si ya están aplicados.
import { Product } from '../models/Product.js';
import { nextProductCode } from '../models/Counter.js';

let done = null;

const migrate = async () => {
  // 1) "category" (una sola) -> "categories" (lista)
  const legacy = await Product.collection
    .find({ category: { $exists: true } }, { projection: { category: 1, categories: 1 } })
    .toArray();
  for (const doc of legacy) {
    const categories = Array.isArray(doc.categories) && doc.categories.length > 0
      ? doc.categories
      : [doc.category].filter(Boolean);
    await Product.collection.updateOne(
      { _id: doc._id },
      { $set: { categories }, $unset: { category: '' } }
    );
  }

  // 2) Prendas sin código: se les asigna uno en orden de creación
  const withoutCode = await Product.find({ code: { $exists: false } }).sort({ createdAt: 1 }).select('_id');
  for (const product of withoutCode) {
    await Product.updateOne({ _id: product._id }, { $set: { code: await nextProductCode() } });
  }

  if (legacy.length || withoutCode.length) {
    console.log(`Migración: ${legacy.length} prendas a varias categorías, ${withoutCode.length} códigos asignados`);
  }
};

export const runMigrations = () => {
  if (!done) {
    done = migrate().catch((error) => {
      done = null; // Reintenta en el próximo request
      throw error;
    });
  }
  return done;
};
