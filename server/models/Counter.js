// /server/models/Counter.js
// Contadores autoincrementales (para el código de prenda IB-0001, IB-0002...).
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// Devuelve el próximo código de prenda. La operación es atómica: dos prendas creadas
// al mismo tiempo nunca reciben el mismo número.
export const nextProductCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'productCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `IB-${String(counter.seq).padStart(4, '0')}`;
};
