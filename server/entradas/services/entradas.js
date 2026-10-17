import { uyuPrice } from '../config.js';
import { HttpError } from '../utils/errors.js';
import { newPublicId, newTicketCode, normalizeCode, codeFromScan } from '../utils/codes.js';
import { verifySignature } from './mp.js';
import { ticketsEmail } from './emailTemplates.js';
import { qrPng } from './qr.js';

const MIN = 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isoUY = (d) => new Date(d.getTime() - 3 * 60 * MIN).toISOString().replace('Z', '-03:00');

/**
 * Lógica de negocio: tandas, órdenes, pagos, entradas, emails, avisos y control en puerta.
 * Todo lo que pasa después de un pago es idempotente (se puede repetir sin duplicar nada).
 */
export function createService({ config, models, mp, mailer, notifier, log = console, now = () => new Date() }) {
  const { Orden, Entrada } = models;

  /* ------------------------------ tandas / stock ------------------------------ */

  async function usedInTanda(tandaId) {
    const t = now();
    const [row] = await Orden.aggregate([
      {
        $match: {
          tandaId,
          tipo: 'venta',
          $or: [
            { status: { $in: ['paid', 'review'] } },
            { status: 'pending', expiresAt: { $gt: t } },
          ],
        },
      },
      { $group: { _id: null, n: { $sum: '$cantidad' } } },
    ]);
    return row?.n || 0;
  }

  async function currentTanda() {
    const t = now();
    if (t > new Date(config.event.ventaHasta)) return null;
    const sorted = [...config.tandas].sort((a, b) => Date.parse(a.hasta) - Date.parse(b.hasta));
    for (const tanda of sorted) {
      if (t > new Date(tanda.hasta)) continue;
      const used = tanda.cupo == null ? 0 : await usedInTanda(tanda.id);
      const remaining = tanda.cupo == null ? Infinity : tanda.cupo - used;
      if (remaining > 0) return { ...tanda, remaining };
    }
    return null;
  }

  async function publicConfig() {
    const tanda = config.isOff ? null : await currentTanda();
    const ev = config.event;
    return {
      evento: {
        nombre: ev.nombre,
        marca: ev.marca,
        subtitulo: ev.subtitulo,
        fechaTexto: ev.fechaTexto,
        horario: ev.horario,
        lugar: ev.lugar,
        ciudad: ev.ciudad,
        dressCode: ev.dressCode,
      },
      maxPorCompra: config.maxPorCompra,
      mock: config.isMock,
      tarjeta: config.isMock ? { mock: true } : config.isLive && config.mp.publicKey ? { publicKey: config.mp.publicKey } : null,
      venta: tanda
        ? {
            abierta: true,
            tandaId: tanda.id,
            tandaNombre: tanda.nombre,
            precioUSD: tanda.precioUSD ?? null,
            precioUYU: uyuPrice(tanda, config),
            quedan: tanda.remaining === Infinity ? null : tanda.remaining,
            hasta: tanda.hasta,
          }
        : { abierta: false, motivo: config.isOff ? 'pronto' : 'cerrada' },
      puerta: { precioUSD: ev.precioPuertaUSD },
    };
  }

  /* ------------------------------ checkout ------------------------------ */

  function validateBuyer(input) {
    const nombre = String(input?.nombre || '').trim().replace(/\s+/g, ' ');
    const email = String(input?.email || '').trim().toLowerCase();
    const telefono = String(input?.telefono || '').trim().slice(0, 30);
    const cantidad = Number(input?.cantidad);
    if (nombre.length < 3 || nombre.length > 80) throw new HttpError(400, 'Ingresá tu nombre y apellido.', 'nombre');
    if (!EMAIL_RE.test(email) || email.length > 120) throw new HttpError(400, 'El email no es válido.', 'email');
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > config.maxPorCompra) {
      throw new HttpError(400, `Podés comprar entre 1 y ${config.maxPorCompra} entradas.`, 'cantidad');
    }
    return { nombre, email, telefono, cantidad };
  }

  async function reserveOrder(input) {
    if (config.isOff) throw new HttpError(503, 'La venta de entradas todavía no está abierta.', 'venta_cerrada');
    const buyer = validateBuyer(input);
    const tanda = await currentTanda();
    if (!tanda) throw new HttpError(409, 'La venta online no está disponible.', 'venta_cerrada');
    if (buyer.cantidad > tanda.remaining) {
      throw new HttpError(
        409,
        tanda.remaining === 1 ? 'Queda solo 1 entrada.' : `Quedan solo ${tanda.remaining} entradas.`,
        'sin_stock'
      );
    }
    const unit = uyuPrice(tanda, config);
    const t = now();
    const expiresAt = new Date(t.getTime() + config.holdMinutes * MIN);
    const publicId = newPublicId();

    const order = await Orden.create({
      publicId,
      tipo: 'venta',
      comprador: { nombre: buyer.nombre, email: buyer.email, telefono: buyer.telefono },
      cantidad: buyer.cantidad,
      tandaId: tanda.id,
      tandaNombre: tanda.nombre,
      precioUnitUYU: unit,
      totalUYU: unit * buyer.cantidad,
      currency: 'UYU',
      expiresAt,
    });
    return { buyer, tanda, unit, order, publicId, t, expiresAt };
  }

  function itemFor(tanda, unit, cantidad) {
    return {
      id: tanda.id,
      title: `Entrada — ${config.event.nombre} (${tanda.nombre})`,
      description: `${config.event.marca} · ${config.event.fechaTexto}`,
      quantity: cantidad,
      unit_price: unit,
      currency_id: 'UYU',
      category_id: 'tickets',
    };
  }

  async function createCheckout(input) {
    const { buyer, tanda, unit, order, publicId, t, expiresAt } = await reserveOrder(input);

    const back = (r) => `${config.publicUrl}/entradas/pago?orden=${publicId}&r=${r}`;
    const pref = {
      items: [itemFor(tanda, unit, buyer.cantidad)],
      payer: payerData(buyer),
      external_reference: publicId,
      notification_url: `${config.apiUrl}/api/entradas/webhook?source_news=webhooks`,
      back_urls: { success: back('ok'), failure: back('fail'), pending: back('pending') },
      auto_return: 'approved',
      statement_descriptor: 'ICO BATISTA',
      expires: true,
      expiration_date_from: isoUY(t),
      expiration_date_to: isoUY(expiresAt),
    };

    let created;
    try {
      created = await mp.createPreference(pref, publicId);
    } catch (e) {
      order.status = 'cancelled';
      order.notas = `No se pudo crear la preferencia: ${e.message}`.slice(0, 500);
      await order.save();
      log.error?.('[entradas] createPreference falló', e.message);
      throw new HttpError(502, 'No pudimos iniciar el pago. Probá de nuevo en un momento.', 'mp_down');
    }
    order.mpPreferenceId = created.id;
    await order.save();
    return { orden: publicId, url: created.init_point, total: order.totalUYU };
  }

  /* Datos del comprador para MercadoPago: cuantos más datos reales, menos
     rechazos "por seguridad" del antifraude. */
  function payerData(buyer) {
    const partes = String(buyer.nombre || '').trim().split(/\s+/);
    const name = partes.shift() || '';
    const surname = partes.join(' ');
    const payer = { name, email: buyer.email };
    if (surname) payer.surname = surname;
    const digits = String(buyer.telefono || '').replace(/\D/g, '');
    if (digits.length >= 6) payer.phone = { number: digits };
    return payer;
  }


  /* ------------------------- pago con tarjeta (Card Payment Brick) ------------------------- */

  const RECHAZOS = {
    cc_rejected_bad_filled_card_number: 'Revisá el número de la tarjeta.',
    cc_rejected_bad_filled_date: 'Revisá la fecha de vencimiento.',
    cc_rejected_bad_filled_security_code: 'Revisá el código de seguridad.',
    cc_rejected_bad_filled_other: 'Revisá los datos de la tarjeta.',
    cc_rejected_insufficient_amount: 'La tarjeta no tiene saldo suficiente.',
    cc_rejected_call_for_authorize: 'Tu banco pide que autorices este pago. Llamalo y volvé a intentar.',
    cc_rejected_card_disabled: 'La tarjeta no está habilitada. Activala con tu banco o probá con otra.',
    cc_rejected_duplicated_payment: 'Ya hiciste un pago por este mismo monto. Si necesitás otra entrada, probá con otra tarjeta.',
    cc_rejected_max_attempts: 'Llegaste al límite de intentos. Probá con otra tarjeta.',
    cc_rejected_high_risk: 'El pago fue rechazado por seguridad. Probá con otra tarjeta o pagá con Mercado Pago.',
    cc_rejected_blacklist: 'No pudimos procesar este pago. Probá con otra tarjeta.',
    cc_rejected_card_type_not_allowed: 'Ese tipo de tarjeta no está aceptado. Probá con otra.',
  };
  const mensajeRechazo = (detail) => RECHAZOS[detail] || 'El banco rechazó el pago. Probá con otra tarjeta.';

  function validateCard(card) {
    const token = String(card?.token || '').trim();
    const pm = String(card?.payment_method_id || '').trim();
    const installments = Number(card?.installments || 1);
    if (!token || token.length > 200 || !pm || pm.length > 40 || !Number.isInteger(installments) || installments < 1 || installments > 36) {
      throw new HttpError(400, 'Faltan datos de la tarjeta.', 'tarjeta');
    }
    const out = { token, payment_method_id: pm, installments };
    if (card.issuer_id) out.issuer_id = String(card.issuer_id).slice(0, 20);
    const email = String(card?.payer?.email || '').trim().toLowerCase();
    if (EMAIL_RE.test(email)) out.email = email;
    const id = card?.payer?.identification;
    if (id?.type && id?.number) {
      out.identification = { type: String(id.type).slice(0, 10), number: String(id.number).replace(/[^\dA-Za-z]/g, '').slice(0, 20) };
    }
    return out;
  }

  async function createCardPayment(input) {
    if (!config.isLive && !config.isMock) throw new HttpError(503, 'La venta de entradas todavía no está abierta.', 'venta_cerrada');
    const card = validateCard(input?.tarjeta);
    const { buyer, tanda, unit, order, publicId } = await reserveOrder(input);
    const payer = payerData(buyer);
    const body = {
      transaction_amount: order.totalUYU,
      token: card.token,
      description: `Entradas — ${config.event.nombre} (${tanda.nombre})`,
      installments: card.installments,
      payment_method_id: card.payment_method_id,
      ...(card.issuer_id ? { issuer_id: card.issuer_id } : {}),
      payer: {
        email: card.email || buyer.email,
        first_name: payer.name,
        ...(payer.surname ? { last_name: payer.surname } : {}),
        ...(card.identification ? { identification: card.identification } : {}),
      },
      external_reference: publicId,
      notification_url: `${config.apiUrl}/api/entradas/webhook?source_news=webhooks`,
      statement_descriptor: 'ICO BATISTA',
      additional_info: {
        items: [itemFor(tanda, unit, buyer.cantidad)],
        payer: {
          first_name: payer.name,
          ...(payer.surname ? { last_name: payer.surname } : {}),
          ...(payer.phone ? { phone: payer.phone } : {}),
        },
      },
    };

    let payment;
    try {
      payment = await mp.createPayment(body, publicId);
    } catch (e) {
      await Orden.updateOne({ _id: order._id, status: 'pending' }, { $set: { status: 'cancelled', notas: `Pago con tarjeta falló: ${e.message}`.slice(0, 500) } });
      log.error?.('[entradas] createPayment falló', e.message);
      const status = e.mpStatus && e.mpStatus < 500 ? 402 : 502;
      throw new HttpError(status, status === 402 ? 'No pudimos procesar la tarjeta. Revisá los datos o probá con otra.' : 'No pudimos procesar el pago. Probá de nuevo en un momento.', 'pago_tarjeta');
    }

    await processPayment(payment);
    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      // libera el cupo reservado; si después llegara un pago aprobado, processPayment lo reclama igual
      await Orden.updateOne(
        { _id: order._id, status: 'pending' },
        { $set: { status: 'cancelled', mpStatus: payment.status, mpPaymentId: String(payment.id) } }
      );
      return { orden: publicId, status: 'rejected', mensaje: mensajeRechazo(payment.status_detail) };
    }
    return { orden: publicId, status: payment.status === 'approved' ? 'approved' : 'pending' };
  }

  /* ------------------------------ pagos ------------------------------ */

  async function handleNotification({ query = {}, body = {}, headers = {}, trusted = false }) {
    if (config.isOff) return { ignored: 'venta_cerrada' };
    const type = body?.type || query.type || query.topic;
    const dataId = query['data.id'] || body?.data?.id || query.id;
    if (type !== 'payment' || !dataId) return { ignored: true, reason: 'tipo_no_soportado' };

    if (config.mp.webhookSecret && !trusted) {
      const sig = verifySignature({
        secret: config.mp.webhookSecret,
        signatureHeader: headers['x-signature'],
        requestId: headers['x-request-id'],
        dataId: query['data.id'] || body?.data?.id,
      });
      if (!sig.ok) {
        log.warn?.('[entradas] webhook con firma inválida:', sig.reason);
        throw new HttpError(401, 'Firma inválida', 'firma');
      }
    }

    const payment = await mp.getPayment(dataId);
    if (!payment) return { ignored: true, reason: 'pago_inexistente' }; // p. ej. notificación de prueba
    return processPayment(payment);
  }

  async function processPayment(payment) {
    const ref = payment.external_reference;
    if (!ref) return { ignored: true, reason: 'sin_referencia' };
    let order = await Orden.findOne({ publicId: ref });
    if (!order) return { ignored: true, reason: 'orden_desconocida' };
    const pid = String(payment.id);

    // --- reembolsos / contracargos
    if (['refunded', 'charged_back'].includes(payment.status)) {
      if (order.mpPaymentId === pid && ['paid', 'review'].includes(order.status)) {
        await Entrada.updateMany({ orderId: order._id, status: { $ne: 'void' } }, { $set: { status: 'void' } });
        order.status = 'refunded';
        order.mpStatus = payment.status;
        await order.save();
        await notifier.alert(
          `Pago ${payment.status === 'refunded' ? 'reembolsado' : 'con contracargo'}`,
          `Compra ${order.publicId} de ${order.comprador.nombre} (${order.comprador.email}). Las entradas quedaron anuladas.`
        );
        return { order: order.publicId, status: order.status };
      }
      return { ignored: true, reason: 'reembolso_sin_orden_pagada' };
    }

    if (payment.status !== 'approved') {
      await Orden.updateOne({ _id: order._id, status: { $in: ['pending'] } }, { $set: { mpStatus: payment.status } });
      return { order: order.publicId, status: order.status, mpStatus: payment.status };
    }

    // --- pago aprobado: ¿es el mismo que ya registramos?
    if (['paid', 'review'].includes(order.status) && order.mpPaymentId && order.mpPaymentId !== pid) {
      const flag = `pago_extra:${pid}`;
      if (!order.flags.includes(flag)) {
        await Orden.updateOne({ _id: order._id }, { $addToSet: { flags: flag } });
        await notifier.alert(
          'Pago duplicado',
          `La compra ${order.publicId} (${order.comprador.nombre}) recibió un segundo pago aprobado (MP ${pid}). Hay que reembolsarlo desde Mercado Pago.`
        );
      }
      return { order: order.publicId, status: order.status, duplicate: true };
    }

    // --- monto / moneda
    const amountOk = Math.abs(Number(payment.transaction_amount) - order.totalUYU) < 0.01;
    const currencyOk = (payment.currency_id || 'UYU') === 'UYU';
    if (!amountOk || !currencyOk) {
      const claimed = await Orden.findOneAndUpdate(
        { _id: order._id, status: { $in: ['pending', 'expired', 'cancelled'] } },
        {
          $set: { status: 'review', mpPaymentId: pid, mpStatus: payment.status, paidAt: now() },
          $addToSet: { flags: 'monto_distinto' },
        },
        { new: true }
      );
      if (claimed) {
        await notifier.alert(
          'Pago con monto distinto',
          `Compra ${order.publicId}: se esperaban ${order.totalUYU} UYU y MP informa ${payment.transaction_amount} ${payment.currency_id} (pago ${pid}). No se emitieron entradas; revisar a mano.`
        );
      }
      return { order: order.publicId, status: 'review' };
    }

    // --- reclamo atómico: solo una ejecución pasa de pendiente a pagada
    const claimed = await Orden.findOneAndUpdate(
      { _id: order._id, status: { $in: ['pending', 'expired', 'cancelled'] } },
      { $set: { status: 'paid', mpPaymentId: pid, mpStatus: 'approved', paidAt: now() } },
      { new: true }
    );
    order = claimed || (await Orden.findById(order._id));
    if (order.status !== 'paid') return { order: order.publicId, status: order.status };
    await fulfill(order);
    return { order: order.publicId, status: 'paid' };
  }

  /* ------------------------------ entregar ------------------------------ */

  async function ensureTickets(order) {
    for (let seq = 1; seq <= order.cantidad; seq++) {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await Entrada.updateOne(
            { orderId: order._id, seq },
            {
              $setOnInsert: {
                orderId: order._id,
                orderPublicId: order.publicId,
                seq,
                code: newTicketCode(),
                nombre: order.comprador.nombre,
                email: order.comprador.email,
                telefono: order.comprador.telefono,
                tandaId: order.tandaId,
                tipo: order.tipo,
                status: 'valid',
              },
            },
            { upsert: true }
          );
          break;
        } catch (e) {
          if (e.code !== 11000 || attempt === 4) throw e; // choque de código o carrera: reintenta
        }
      }
    }
    return Entrada.find({ orderId: order._id }).sort({ seq: 1 });
  }

  async function resumenBasico() {
    return { vendidas: await Entrada.countDocuments({ tipo: 'venta', status: { $ne: 'void' } }) };
  }

  async function sendTicketsEmail(order) {
    if (!order.comprador.email) return false;
    const t = now();
    const claimed = await Orden.findOneAndUpdate(
      {
        _id: order._id,
        $or: [
          { emailStatus: { $in: ['none', 'failed'] } },
          { emailStatus: 'sending', emailAttemptAt: { $lt: new Date(t.getTime() - 5 * MIN) } },
        ],
      },
      { $set: { emailStatus: 'sending', emailAttemptAt: t }, $inc: { emailAttempts: 1 } },
      { new: true }
    );
    if (!claimed) return false;
    try {
      const tickets = await Entrada.find({ orderId: order._id, status: { $ne: 'void' } }).sort({ seq: 1 });
      const mail = ticketsEmail({ config, order: claimed, tickets });
      const attachments = [];
      for (const c of mail.cids) {
        attachments.push({ filename: `${c.code}.png`, content: await qrPng(config, c.code), cid: c.cid });
      }
      await mailer.send({
        to: claimed.comprador.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments,
      });
      await Orden.updateOne({ _id: order._id }, { $set: { emailStatus: 'sent', emailSentAt: now(), emailError: '' } });
      return true;
    } catch (e) {
      await Orden.updateOne(
        { _id: order._id },
        { $set: { emailStatus: 'failed', emailError: String(e.message).slice(0, 300) } }
      );
      log.error?.('[entradas] fallo el envío de entradas', order.publicId, e.message);
      return false;
    }
  }

  async function notifySale(order) {
    if (order.tipo !== 'venta') return;
    const claimed = await Orden.findOneAndUpdate(
      { _id: order._id, notifiedAt: null },
      { $set: { notifiedAt: now() } },
      { new: true }
    );
    if (!claimed) return;
    try {
      await notifier.sale(claimed, await resumenBasico());
    } catch (e) {
      await Orden.updateOne({ _id: order._id }, { $set: { notifiedAt: null } }); // se reintenta en el reconcile
      log.error?.('[entradas] fallo el aviso a Ico', e.message);
    }
  }

  /** Emite entradas, manda el email al comprador y avisa a Ico. Idempotente. */
  async function fulfill(order) {
    await ensureTickets(order);
    await sendTicketsEmail(order);
    await notifySale(order);
    // Sobreventa (pago llegó después de vencida la reserva)
    const tanda = config.tandas.find((x) => x.id === order.tandaId);
    if (tanda?.cupo != null && order.tipo === 'venta') {
      const used = await usedInTanda(tanda.id);
      if (used > tanda.cupo && !order.flags.includes('sobreventa')) {
        await Orden.updateOne({ _id: order._id }, { $addToSet: { flags: 'sobreventa' } });
        await notifier.alert('Cupo superado', `La ${tanda.nombre} superó su cupo (${used}/${tanda.cupo}) por un pago tardío.`);
      }
    }
  }

  /* ------------------------------ consultas públicas ------------------------------ */

  async function getOrderPublic(publicId) {
    const order = await Orden.findOne({ publicId: String(publicId) });
    if (!order) throw new HttpError(404, 'Compra no encontrada', 'no_existe');
    const tickets =
      order.status === 'paid' ? await Entrada.find({ orderId: order._id, status: { $ne: 'void' } }).sort({ seq: 1 }) : [];
    return {
      orden: order.publicId,
      status: order.status,
      mpStatus: order.mpStatus,
      cantidad: order.cantidad,
      total: order.totalUYU,
      email: maskEmail(order.comprador.email),
      emailEnviado: order.emailStatus === 'sent',
      entradas: tickets.map((t) => ({ code: t.code, seq: t.seq })),
    };
  }

  /** Consulta a MP por si el webhook se demora (lo llama la página de "pago" mientras espera). */
  async function syncOrder(publicId) {
    const order = await Orden.findOne({ publicId: String(publicId) });
    if (!order) throw new HttpError(404, 'Compra no encontrada', 'no_existe');
    if (order.status !== 'pending') return getOrderPublic(publicId);
    const results = await mp.searchPayments(order.publicId);
    const best = results.find((p) => p.status === 'approved') || results[0];
    if (best) await processPayment(best);
    return getOrderPublic(publicId);
  }

  async function getTicketPublic(codeInput) {
    const code = normalizeCode(codeInput);
    if (!code) throw new HttpError(404, 'Entrada no encontrada', 'no_existe');
    const t = await Entrada.findOne({ code });
    if (!t) throw new HttpError(404, 'Entrada no encontrada', 'no_existe');
    return {
      code: t.code,
      nombre: t.nombre,
      seq: t.seq,
      status: t.status,
      tipo: t.tipo,
      rsvp: t.tipo === 'cortesia' ? t.rsvp || 'pending' : undefined,
      evento: {
        nombre: config.event.nombre,
        subtitulo: config.event.subtitulo,
        fechaTexto: config.event.fechaTexto,
        horario: config.event.horario,
        lugar: config.event.lugar,
        ciudad: config.event.ciudad,
        dressCode: config.event.dressCode,
      },
    };
  }

  /* Confirmación de asistencia de una invitación de cortesía (el invitado responde desde su invitación) */
  async function rsvp(codeInput, respuesta) {
    const code = normalizeCode(codeInput);
    if (!['yes', 'no'].includes(respuesta)) throw new HttpError(400, 'Respuesta inválida', 'respuesta');
    const t = code && (await Entrada.findOne({ code }));
    if (!t) throw new HttpError(404, 'Invitación no encontrada', 'no_existe');
    if (t.tipo !== 'cortesia') throw new HttpError(400, 'Solo las invitaciones de cortesía se confirman', 'no_cortesia');
    if (t.status === 'void') throw new HttpError(409, 'Esta invitación fue anulada', 'anulada');
    await Entrada.updateOne({ _id: t._id }, { $set: { rsvp: respuesta, rsvpAt: now() } });
    return { code: t.code, rsvp: respuesta };
  }

  async function getTicketQr(codeInput) {
    const code = normalizeCode(codeInput);
    const t = code && (await Entrada.findOne({ code }));
    if (!t) throw new HttpError(404, 'Entrada no encontrada', 'no_existe');
    return qrPng(config, t.code);
  }

  /* ------------------------------ panel ------------------------------ */

  async function resumen() {
    const [porEstado, porTanda, ordenes, pendientes] = await Promise.all([
      Entrada.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Orden.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: { id: '$tandaId', tipo: '$tipo' }, entradas: { $sum: '$cantidad' }, total: { $sum: '$totalUYU' } } },
      ]),
      Orden.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Orden.countDocuments({ status: 'pending', expiresAt: { $gt: now() } }),
    ]);
    const rsvpRows = await Entrada.aggregate([
      { $match: { tipo: 'cortesia', status: { $ne: 'void' } } },
      { $group: { _id: { $ifNull: ['$rsvp', 'pending'] }, n: { $sum: 1 } } },
    ]);
    const r = Object.fromEntries(rsvpRows.map((x) => [x._id, x.n]));
    const e = Object.fromEntries(porEstado.map((r) => [r._id, r.n]));
    const o = Object.fromEntries(ordenes.map((r) => [r._id, r.n]));
    const ventas = porTanda.filter((r) => r._id.tipo === 'venta');
    return {
      entradasValidas: (e.valid || 0) + (e.used || 0),
      ingresaron: e.used || 0,
      faltanIngresar: e.valid || 0,
      anuladas: e.void || 0,
      cortesias: porTanda.filter((r) => r._id.tipo === 'cortesia').reduce((s, r) => s + r.entradas, 0),
      vendidas: ventas.reduce((s, r) => s + r.entradas, 0),
      recaudadoUYU: ventas.reduce((s, r) => s + r.total, 0),
      porTanda: ventas.map((r) => ({ tandaId: r._id.id, entradas: r.entradas, totalUYU: r.total })),
      pagosPendientes: pendientes,
      ordenesParaRevisar: o.review || 0,
      emailsFallidos: await Orden.countDocuments({ status: 'paid', emailStatus: 'failed' }),
      invitados: { confirmados: r.yes || 0, noAsisten: r.no || 0, sinRespuesta: r.pending || 0 },
    };
  }

  async function lista({ q, estado, tanda, page = 1, limit = 100 } = {}) {
    const filter = {};
    if (['valid', 'used', 'void'].includes(estado)) filter.status = estado;
    if (['yes', 'no', 'pending'].includes(estado)) {
      filter.tipo = 'cortesia';
      filter.status = { $ne: 'void' };
      filter.rsvp = estado === 'pending' ? { $in: ['pending', null] } : estado;
    }
    if (tanda) filter.tandaId = String(tanda);
    const term = String(q || '').trim().slice(0, 80);
    if (term) {
      const re = new RegExp(escRe(term), 'i');
      filter.$or = [{ nombre: re }, { email: re }, { code: re }, { telefono: re }];
    }
    limit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    page = Math.max(Number(page) || 1, 1);
    const [items, total] = await Promise.all([
      Entrada.find(filter)
        .sort({ nombre: 1, seq: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Entrada.countDocuments(filter),
    ]);
    return {
      total,
      page,
      limit,
      items: items.map((t) => ({
        id: String(t._id),
        code: t.code,
        nombre: t.nombre,
        email: t.email,
        telefono: t.telefono,
        seq: t.seq,
        tandaId: t.tandaId,
        tipo: t.tipo,
        status: t.status,
        checkedInAt: t.checkedInAt,
        rsvp: t.tipo === 'cortesia' ? t.rsvp || 'pending' : null,
        rsvpAt: t.rsvpAt || null,
        orden: t.orderPublicId,
        creada: t.createdAt,
      })),
    };
  }

  async function checkIn(codeInput, by = 'panel') {
    const code = codeFromScan(codeInput);
    if (!code) throw new HttpError(400, 'Código inválido', 'codigo_invalido');
    const ok = await Entrada.findOneAndUpdate(
      { code, status: 'valid' },
      { $set: { status: 'used', checkedInAt: now(), checkedInBy: by } },
      { new: true }
    );
    if (ok) return { ok: true, entrada: { code: ok.code, nombre: ok.nombre, seq: ok.seq, tandaId: ok.tandaId } };
    const t = await Entrada.findOne({ code });
    if (!t) throw new HttpError(404, 'Entrada inexistente', 'no_existe');
    if (t.status === 'used') {
      throw new HttpError(409, 'Esta entrada ya ingresó', 'ya_ingreso', {
        nombre: t.nombre,
        checkedInAt: t.checkedInAt,
      });
    }
    throw new HttpError(410, 'Entrada anulada', 'anulada', { nombre: t.nombre });
  }

  async function undoCheckIn(codeInput) {
    const code = normalizeCode(codeInput);
    const t = code && (await Entrada.findOneAndUpdate(
      { code, status: 'used' },
      { $set: { status: 'valid', checkedInAt: null, checkedInBy: '' } },
      { new: true }
    ));
    if (!t) throw new HttpError(404, 'No hay un ingreso para deshacer', 'no_existe');
    return { ok: true };
  }

  async function voidTicket(codeInput) {
    const code = normalizeCode(codeInput);
    const t = code && (await Entrada.findOneAndUpdate({ code, status: { $ne: 'void' } }, { $set: { status: 'void' } }, { new: true }));
    if (!t) throw new HttpError(404, 'Entrada inexistente', 'no_existe');
    return { ok: true };
  }

  async function createCortesia(input) {
    const nombre = String(input?.nombre || '').trim().replace(/\s+/g, ' ');
    const email = String(input?.email || '').trim().toLowerCase();
    const cantidad = Number(input?.cantidad || 1);
    if (nombre.length < 2) throw new HttpError(400, 'Falta el nombre', 'nombre');
    if (email && !EMAIL_RE.test(email)) throw new HttpError(400, 'Email inválido', 'email');
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) throw new HttpError(400, 'Cantidad inválida', 'cantidad');
    const order = await Orden.create({
      publicId: newPublicId(),
      tipo: 'cortesia',
      status: 'paid',
      comprador: { nombre, email, telefono: String(input?.telefono || '').slice(0, 30) },
      cantidad,
      tandaId: 'cortesia',
      tandaNombre: 'Cortesía',
      precioUnitUYU: 0,
      totalUYU: 0,
      paidAt: now(),
      notifiedAt: now(),
      notas: String(input?.notas || '').slice(0, 200),
    });
    const tickets = await ensureTickets(order);
    if (email) await sendTicketsEmail(order);
    return { orden: order.publicId, entradas: tickets.map((t) => ({ code: t.code, seq: t.seq })) };
  }

  async function resend(publicId) {
    const order = await Orden.findOne({ publicId: String(publicId) });
    if (!order || order.status !== 'paid') throw new HttpError(404, 'Compra no encontrada o no pagada', 'no_existe');
    await Orden.updateOne({ _id: order._id }, { $set: { emailStatus: 'failed' } });
    const fresh = await Orden.findById(order._id);
    const sent = await sendTicketsEmail(fresh);
    if (!sent) throw new HttpError(502, 'No se pudo enviar el email', 'email');
    return { ok: true };
  }

  async function ordenes({ status } = {}) {
    const filter = status ? { status } : {};
    const rows = await Orden.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    return rows.map((o) => ({
      orden: o.publicId,
      status: o.status,
      tipo: o.tipo,
      comprador: o.comprador,
      cantidad: o.cantidad,
      totalUYU: o.totalUYU,
      mpPaymentId: o.mpPaymentId,
      emailStatus: o.emailStatus,
      emailError: o.emailError,
      flags: o.flags,
      creada: o.createdAt,
    }));
  }

  async function exportCsv() {
    const rows = await Entrada.find({}).sort({ nombre: 1, seq: 1 }).lean();
    const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const head = ['codigo', 'nombre', 'email', 'telefono', 'tanda', 'tipo', 'estado', 'asistencia', 'ingreso', 'orden'];
    const lines = rows.map((t) =>
      [t.code, t.nombre, t.email, t.telefono, t.tandaId, t.tipo, t.status, t.tipo === 'cortesia' ? ({ yes: 'confirmada', no: 'no asiste' }[t.rsvp] || 'sin respuesta') : '', t.checkedInAt?.toISOString() || '', t.orderPublicId]
        .map(q)
        .join(',')
    );
    return '﻿' + [head.join(','), ...lines].join('\r\n');
  }

  /* ------------------------------ tareas periódicas ------------------------------ */

  async function reconcile() {
    const t = now();
    const stats = { revisadas: 0, reenviadas: 0, expiradas: 0 };

    // 1) pendientes: preguntar a MP si hay un pago aprobado que no nos llegó
    // (con la venta cerrada no hay pagos que consultar; igual se reintentan los emails de cortesías)
    const pend = config.isOff ? [] : await Orden.find({
      status: 'pending',
      createdAt: { $lt: new Date(t.getTime() - 2 * MIN), $gt: new Date(t.getTime() - 3 * 60 * MIN) },
    }).limit(100);
    for (const o of pend) {
      stats.revisadas++;
      try {
        const results = await mp.searchPayments(o.publicId);
        const approved = results.find((p) => p.status === 'approved' || p.status === 'refunded');
        if (approved) await processPayment(approved);
        else if (o.expiresAt < new Date(t.getTime() - 5 * MIN)) {
          const r = await Orden.updateOne({ _id: o._id, status: 'pending' }, { $set: { status: 'expired' } });
          stats.expiradas += r.modifiedCount;
        }
      } catch (e) {
        log.error?.('[entradas] reconcile', o.publicId, e.message);
      }
    }

    // 2) pagadas con algo sin terminar (sin entradas, email caído, aviso pendiente)
    const loose = await Orden.find({
      status: 'paid',
      $or: [
        { emailStatus: { $in: ['failed', 'none'] }, 'comprador.email': { $ne: '' } },
        { emailStatus: 'sending', emailAttemptAt: { $lt: new Date(t.getTime() - 5 * MIN) } },
        { notifiedAt: null, tipo: 'venta' },
      ],
      paidAt: { $lt: new Date(t.getTime() - 30 * 1000) },
    }).limit(100);
    for (const o of loose) {
      try {
        await fulfill(o);
        stats.reenviadas++;
      } catch (e) {
        log.error?.('[entradas] reconcile fulfill', o.publicId, e.message);
      }
    }
    return stats;
  }

  return {
    publicConfig,
    currentTanda,
    createCheckout,
    createCardPayment,
    handleNotification,
    processPayment,
    fulfill,
    ensureTickets,
    getOrderPublic,
    syncOrder,
    getTicketPublic,
    getTicketQr,
    rsvp,
    resumen,
    lista,
    checkIn,
    undoCheckIn,
    voidTicket,
    createCortesia,
    resend,
    ordenes,
    exportCsv,
    reconcile,
  };
}

function maskEmail(email) {
  const [u, d] = String(email || '').split('@');
  if (!d) return '';
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(u.length - 2, 1))}@${d}`;
}
