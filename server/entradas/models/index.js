/**
 * Modelos. Se crean sobre la instancia de mongoose que se le pase, así se pueden
 * montar en el backend existente de Ico sin pisar nada (nombres con prefijo).
 */
export function createModels(mongoose) {
  const { Schema } = mongoose;

  const ordenSchema = new Schema(
    {
      publicId: { type: String, required: true, unique: true, index: true },
      tipo: { type: String, enum: ['venta', 'cortesia'], default: 'venta' },
      // pending: esperando pago | paid | review: algo raro, revisar a mano
      // refunded | expired | cancelled
      status: {
        type: String,
        enum: ['pending', 'paid', 'review', 'refunded', 'expired', 'cancelled'],
        default: 'pending',
        index: true,
      },
      comprador: {
        nombre: { type: String, required: true },
        email: { type: String, default: '' },
        telefono: { type: String, default: '' },
      },
      cantidad: { type: Number, required: true },
      tandaId: { type: String, required: true },
      tandaNombre: { type: String, default: '' },
      precioUnitUYU: { type: Number, required: true },
      totalUYU: { type: Number, required: true },
      currency: { type: String, default: 'UYU' },
      mpPreferenceId: { type: String, default: '' },
      mpPaymentId: { type: String, default: '' },
      mpStatus: { type: String, default: '' },
      expiresAt: { type: Date },
      paidAt: { type: Date },
      emailStatus: { type: String, enum: ['none', 'sending', 'sent', 'failed'], default: 'none' },
      emailAttempts: { type: Number, default: 0 },
      emailAttemptAt: { type: Date },
      emailSentAt: { type: Date },
      emailError: { type: String, default: '' },
      notifiedAt: { type: Date, default: null },
      flags: { type: [String], default: [] },
      notas: { type: String, default: '' },
    },
    { timestamps: true }
  );

  const entradaSchema = new Schema(
    {
      orderId: { type: Schema.Types.ObjectId, ref: 'EntradaOrden', required: true, index: true },
      orderPublicId: { type: String, required: true },
      seq: { type: Number, required: true },
      code: { type: String, required: true, unique: true },
      nombre: { type: String, required: true },
      email: { type: String, default: '' },
      telefono: { type: String, default: '' },
      tandaId: { type: String, default: '' },
      tipo: { type: String, enum: ['venta', 'cortesia'], default: 'venta' },
      status: { type: String, enum: ['valid', 'used', 'void'], default: 'valid', index: true },
      checkedInAt: { type: Date, default: null },
      checkedInBy: { type: String, default: '' },
    },
    { timestamps: true }
  );
  entradaSchema.index({ orderId: 1, seq: 1 }, { unique: true });

  const Orden = mongoose.models.EntradaOrden || mongoose.model('EntradaOrden', ordenSchema);
  const Entrada = mongoose.models.Entrada || mongoose.model('Entrada', entradaSchema);
  return { Orden, Entrada };
}
