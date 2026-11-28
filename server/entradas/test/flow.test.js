import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import express from 'express';
import { loadConfig } from '../config.js';
import { createEntradas } from '../index.js';
import { signNotification } from '../services/mp.js';

// Tests del módulo de entradas. Necesitan un Mongo de prueba: TEST_MONGODB_URI=mongodb://127.0.0.1:27017
// Correr con: node --test server/entradas/test/
function createApp(config, { deps } = {}) {
  const app = express();
  const entradas = createEntradas({ config, mongoose, deps, log: { error() {}, warn() {}, info() {} } });
  app.use('/api/entradas', entradas.router);
  return { app, entradas };
}

let app, ent, base, server, config, clock;
const SECRET = 'secreto-test';
const H = { Authorization: 'Bearer admin-test', 'Content-Type': 'application/json' };

const post = (p, body, headers = { 'Content-Type': 'application/json' }) =>
  fetch(base + p, { method: 'POST', headers, body: JSON.stringify(body ?? {}) });
const get = (p, headers) => fetch(base + p, { headers });

const invitadosPara = (n) => Array.from({ length: Math.max(0, n - 1) }, (_, i) => `Invitado Número ${i + 2}`);
async function buy(extra = {}) {
  const cantidad = extra.cantidad ?? 2;
  const r = await post('/checkout', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad, invitados: invitadosPara(cantidad), ...extra });
  const j = await r.json();
  return { status: r.status, ...j };
}
const prefIdOf = (url) => new URL(url).searchParams.get('pref');
function webhook(paymentId, { secret = SECRET, bad = false } = {}) {
  const requestId = 'req-' + Math.random();
  const sig = signNotification({ secret: bad ? 'otra' : secret, dataId: String(paymentId), requestId });
  return fetch(`${base}/webhook?data.id=${paymentId}&type=payment&source_news=webhooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-signature': sig, 'x-request-id': requestId },
    body: JSON.stringify({ type: 'payment', data: { id: String(paymentId) } }),
  });
}

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', { dbName: 'entradas_test' });
  clock = new Date('2026-10-20T15:00:00-03:00');
  config = loadConfig(
    {
      MP_MODE: 'mock',
      USD_UYU_RATE: '40',
      MP_WEBHOOK_SECRET: SECRET,
      ADMIN_TOKEN: 'admin-test',
      PUERTA_TOKEN: 'puerta-test',
      ICO_NOTIFY_EMAIL: 'ico@example.com',
      MAIL_PROVIDER: 'dev',
      PUBLIC_URL: 'http://localhost:5173',
    },
    { disableRateLimit: true, tandasCacheMs: 0, mail: { provider: 'dev', from: 'x@x.com', outboxDir: '/tmp/ico-outbox-test', smtp: {} } }
  );
  const built = createApp(config, { deps: { now: () => clock } });
  app = built.app;
  ent = built.entradas;
  await ent.models.Orden.init();
  await ent.models.Entrada.init();
  await new Promise((res) => (server = app.listen(0, res)));
  base = `http://127.0.0.1:${server.address().port}/api/entradas`;
});

after(async () => {
  server?.close();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await ent.models.Orden.deleteMany({});
  await ent.models.Entrada.deleteMany({});
  ent.mailer.sent.length = 0;
  ent.mp.payments.clear();
  clock = new Date('2026-10-20T15:00:00-03:00');
});

test('config pública: primera tanda, precio en pesos', async () => {
  const j = await (await get('/config')).json();
  assert.equal(j.venta.abierta, true);
  assert.equal(j.venta.tandaId, 't1');
  assert.equal(j.venta.precioUYU, 2600);
});

test('validaciones del checkout', async () => {
  assert.equal((await buy({ email: 'mal' })).status, 400);
  assert.equal((await buy({ nombre: 'A' })).status, 400);
  assert.equal((await buy({ cantidad: 0 })).status, 400);
  assert.equal((await buy({ cantidad: 11 })).status, 400);
  assert.equal((await buy({ web: 'bot' })).status, 400);
});

test('flujo completo: compra → pago aprobado → webhook → entradas + email + aviso a Ico', async () => {
  const c = await buy();
  assert.equal(c.status, 200);
  assert.equal(c.total, 5200);
  const pref = ent.mp.prefs.get(prefIdOf(c.url));
  assert.equal(pref.external_reference, c.orden);
  assert.equal(pref.items[0].unit_price, 2600);
  assert.match(pref.notification_url, /\/api\/entradas\/webhook\?source_news=webhooks$/);
  assert.equal(pref.auto_return, 'approved');

  // antes de pagar no hay entradas
  assert.equal((await (await get(`/orden/${c.orden}`)).json()).status, 'pending');

  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  const w = await webhook(pay.id);
  assert.equal(w.status, 200);

  const o = await (await get(`/orden/${c.orden}`)).json();
  assert.equal(o.status, 'paid');
  assert.equal(o.entradas.length, 2);
  assert.match(o.entradas[0].code, /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(o.email, 'an•@example.com');

  const comprador = ent.mailer.sent.filter((m) => m.to === 'ana@example.com');
  const ico = ent.mailer.sent.filter((m) => m.to === 'ico@example.com');
  assert.equal(comprador.length, 1);
  assert.equal(ico.length, 1);
  assert.equal(comprador[0].attachments.length, 2);
  assert.match(comprador[0].html, new RegExp(o.entradas[0].code));
  assert.match(ico[0].subject, /Nueva venta: 2 entrada/);

  // página pública de la entrada + QR
  const t = await (await get(`/ticket/${o.entradas[0].code}`)).json();
  assert.equal(t.nombre, 'Ana Pérez');
  assert.equal(t.email, undefined);
  const qr = await get(`/ticket/${o.entradas[0].code}/qr.png`);
  assert.equal(qr.headers.get('content-type'), 'image/png');
});

test('idempotencia: el mismo webhook 5 veces en paralelo no duplica entradas, emails ni avisos', async () => {
  const c = await buy();
  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  const rs = await Promise.all([1, 2, 3, 4, 5].map(() => webhook(pay.id)));
  assert.ok(rs.every((r) => r.status === 200));
  assert.equal(await ent.models.Entrada.countDocuments({}), 2);
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'ana@example.com').length, 1);
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'ico@example.com').length, 1);
});

test('firma inválida → 401 y no se emite nada', async () => {
  const c = await buy();
  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  const w = await webhook(pay.id, { bad: true });
  assert.equal(w.status, 401);
  assert.equal(await ent.models.Entrada.countDocuments({}), 0);
});

test('notificación de prueba de MP (pago inexistente) → 200 ignorada', async () => {
  const w = await webhook('123456');
  assert.equal(w.status, 200);
  assert.equal((await w.json()).ignored, true);
});

test('pago rechazado: no emite entradas', async () => {
  const c = await buy();
  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url), status: 'rejected' });
  await webhook(pay.id);
  assert.equal(await ent.models.Entrada.countDocuments({}), 0);
  assert.equal((await (await get(`/orden/${c.orden}`)).json()).status, 'pending');
});

test('monto distinto → orden en revisión, sin entradas, alerta a Ico', async () => {
  const c = await buy();
  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url), amount: 100 });
  await webhook(pay.id);
  const o = await ent.models.Orden.findOne({ publicId: c.orden });
  assert.equal(o.status, 'review');
  assert.equal(await ent.models.Entrada.countDocuments({}), 0);
  assert.ok(ent.mailer.sent.some((m) => /monto distinto/i.test(m.subject)));
});

test('segundo pago aprobado de la misma orden → marcado como duplicado', async () => {
  const c = await buy();
  const p1 = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  await webhook(p1.id);
  const p2 = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  await webhook(p2.id);
  assert.equal(await ent.models.Entrada.countDocuments({}), 2);
  const o = await ent.models.Orden.findOne({ publicId: c.orden });
  assert.ok(o.flags.some((f) => f.startsWith('pago_extra')));
  assert.ok(ent.mailer.sent.some((m) => /duplicado/i.test(m.subject)));
});

test('webhook perdido: /sync consulta a MP y entrega igual', async () => {
  const c = await buy();
  ent.mp.addPayment({ prefId: prefIdOf(c.url) }); // sin webhook
  const r = await (await post(`/orden/${c.orden}/sync`)).json();
  assert.equal(r.status, 'paid');
  assert.equal(r.entradas.length, 2);
});

test('reconcile: recupera pago aprobado sin webhook y reintenta emails caídos', async () => {
  const c = await buy();
  ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  await ent.models.Orden.collection.updateOne({ publicId: c.orden }, { $set: { createdAt: new Date(clock) } });
  clock = new Date(clock.getTime() + 10 * 60 * 1000);
  // el mailer falla la primera vez
  const orig = ent.mailer.send.bind(ent.mailer);
  let fail = true;
  ent.mailer.send = async (m) => {
    if (fail && m.to === 'ana@example.com') throw new Error('smtp caído');
    return orig(m);
  };
  await ent.service.reconcile();
  let o = await ent.models.Orden.findOne({ publicId: c.orden });
  assert.equal(o.status, 'paid');
  assert.equal(o.emailStatus, 'failed');
  fail = false;
  clock = new Date(clock.getTime() + 60 * 1000);
  await ent.service.reconcile();
  o = await ent.models.Orden.findOne({ publicId: c.orden });
  assert.equal(o.emailStatus, 'sent');
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'ana@example.com').length, 1);
  assert.equal(await ent.models.Entrada.countDocuments({}), 2);
  ent.mailer.send = orig;
});

test('reembolso anula las entradas', async () => {
  const c = await buy();
  const pay = ent.mp.addPayment({ prefId: prefIdOf(c.url) });
  await webhook(pay.id);
  ent.mp.setStatus(pay.id, 'refunded');
  await webhook(pay.id);
  assert.equal(await ent.models.Entrada.countDocuments({ status: 'void' }), 2);
  assert.equal((await ent.models.Orden.findOne({ publicId: c.orden })).status, 'refunded');
});

test('tandas: cupo agotado pasa a la segunda tanda; vencida la fecha también', async () => {
  const cfg = ent.service;
  assert.equal((await cfg.currentTanda()).id, 't1');
  // llenar el cupo de t1 (80) con reservas
  await ent.models.Orden.create({
    publicId: 'x'.repeat(24), comprador: { nombre: 'Lleno', email: 'l@l.com' }, cantidad: 80,
    tandaId: 't1', precioUnitUYU: 2400, totalUYU: 192000, status: 'paid',
  });
  const j = await (await get('/config')).json();
  assert.equal(j.venta.tandaId, 't2');
  assert.equal(j.venta.precioUYU, 3000);
  // fecha posterior al cierre de t1
  await ent.models.Orden.deleteMany({});
  clock = new Date('2026-11-06T10:00:00-03:00');
  assert.equal((await (await get('/config')).json()).venta.tandaId, 't2');
  // venta cerrada el día del evento
  clock = new Date('2026-11-26T10:00:00-03:00');
  assert.equal((await (await get('/config')).json()).venta.abierta, false);
  assert.equal((await buy()).status, 409);
});

test('stock: no deja comprar más de lo que queda', async () => {
  await ent.models.Orden.create({
    publicId: 'y'.repeat(24), comprador: { nombre: 'Casi', email: 'l@l.com' }, cantidad: 79,
    tandaId: 't1', precioUnitUYU: 2400, totalUYU: 1, status: 'paid',
  });
  const r = await buy({ cantidad: 2 });
  assert.equal(r.status, 409);
  assert.equal(r.code, 'sin_stock');
  assert.equal((await buy({ cantidad: 1 })).status, 200);
});

test('panel: requiere token; lista, búsqueda, ingreso, doble escaneo, deshacer, resumen, CSV', async () => {
  assert.equal((await get('/admin/lista')).status, 401);
  assert.equal((await get('/admin/lista', { Authorization: 'Bearer mal' })).status, 401);

  const c = await buy({ nombre: 'Lucía Gómez', invitados: ['Lucía Rivero'] });
  await webhook(ent.mp.addPayment({ prefId: prefIdOf(c.url) }).id);

  const lista = await (await get('/admin/lista?q=luc', H)).json();
  assert.equal(lista.total, 2);
  const code = lista.items[0].code;

  // escanear el QR (URL completa) o tipear el código en minúsculas
  const ok = await post('/admin/ingreso', { code: `http://x/entrada/${code}` }, H);
  assert.equal(ok.status, 200);
  const dup = await post('/admin/ingreso', { code: code.toLowerCase().replaceAll('-', '') }, H);
  assert.equal(dup.status, 409);
  assert.equal((await dup.json()).code, 'ya_ingreso');
  assert.equal((await post('/admin/ingreso', { code: 'ZZZZ-ZZZZ-ZZZZ' }, H)).status, 404);

  let res = await (await get('/admin/resumen', H)).json();
  assert.equal(res.ingresaron, 1);
  assert.equal(res.faltanIngresar, 1);
  assert.equal(res.vendidas, 2);
  assert.equal(res.recaudadoUYU, 5200);

  assert.equal((await post('/admin/ingreso/deshacer', { code }, H)).status, 200);
  assert.equal((await post('/admin/ingreso', { code }, H)).status, 200);

  const csv = await (await get('/admin/export.csv', H)).text();
  assert.match(csv, /Lucía Gómez/);
});

test('ingresos simultáneos del mismo código: entra solo uno', async () => {
  const c = await buy({ cantidad: 1 });
  await webhook(ent.mp.addPayment({ prefId: prefIdOf(c.url) }).id);
  const { code } = (await (await get('/admin/lista', H)).json()).items[0];
  const rs = await Promise.all([1, 2, 3, 4].map(() => post('/admin/ingreso', { code }, H)));
  assert.deepEqual(rs.map((r) => r.status).sort(), [200, 409, 409, 409]);
});

test('cortesía + reenvío de email desde el panel', async () => {
  const r = await post('/admin/cortesia', { nombre: 'Invitada VIP', email: 'vip@example.com', cantidad: 2 }, H);
  assert.equal(r.status, 200);
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'vip@example.com').length, 1);
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'ico@example.com').length, 0); // sin aviso de venta

  const c = await buy({ cantidad: 1 });
  await webhook(ent.mp.addPayment({ prefId: prefIdOf(c.url) }).id);
  const before = ent.mailer.sent.filter((m) => m.to === 'ana@example.com').length;
  assert.equal((await post(`/admin/ordenes/${c.orden}/reenviar`, {}, H)).status, 200);
  assert.equal(ent.mailer.sent.filter((m) => m.to === 'ana@example.com').length, before + 1);
  const res = await (await get('/admin/resumen', H)).json();
  assert.equal(res.cortesias, 2);
  assert.equal(res.vendidas, 1);
});

test('XSS: el nombre se escapa en el email', async () => {
  const c = await buy({ nombre: '<script>alert(1)</script> Bob', cantidad: 1 });
  await webhook(ent.mp.addPayment({ prefId: prefIdOf(c.url) }).id);
  const m = ent.mailer.sent.find((x) => x.to === 'ana@example.com');
  assert.ok(!m.html.includes('<script>'));
  assert.ok(m.html.includes('&lt;script&gt;'));
});

test('simulador: /_mock/pagar dispara el webhook y entrega', async () => {
  const c = await buy({ cantidad: 1 });
  const r = await (await post('/_mock/pagar', { pref: prefIdOf(c.url) })).json();
  assert.match(r.redirect, /\/entradas\/pago\?orden=/);
  await new Promise((res) => setTimeout(res, 300));
  assert.equal((await (await get(`/orden/${c.orden}`)).json()).status, 'paid');
});

test('cortesía: el invitado confirma o rechaza la asistencia y queda en el panel', async () => {
  const r = await (await post('/admin/cortesia', { nombre: 'Laura Gómez', email: 'laura@example.com', cantidad: 1 }, H)).json();
  const code = r.entradas[0].code;
  assert.equal((await (await get(`/ticket/${code}`)).json()).rsvp, 'pending');
  assert.equal((await post(`/ticket/${code}/rsvp`, { respuesta: 'quizas' })).status, 400);
  assert.equal((await (await post(`/ticket/${code}/rsvp`, { respuesta: 'yes' })).json()).rsvp, 'yes');
  assert.equal((await (await get(`/ticket/${code}`)).json()).rsvp, 'yes');
  const res = await (await get('/admin/resumen', H)).json();
  assert.deepEqual(res.invitados, { confirmados: 1, noAsisten: 0, sinRespuesta: 0 });
  const lista = await (await get('/admin/lista?estado=yes', H)).json();
  assert.equal(lista.total, 1);
  assert.equal(lista.items[0].rsvp, 'yes');
  // una entrada vendida no se "confirma"
  const b = await buy();
  assert.ok(b.url);
  assert.ok((ent.mailer.sent.at(-1)?.html || '').includes('asistencia=si'));
});

/* ------------------------- pago con tarjeta en la web ------------------------- */
const tarjeta = (token = 'mock-ok', extra = {}) => ({
  token,
  payment_method_id: 'visa',
  installments: 1,
  issuer_id: '310',
  payer: { email: 'ana@example.com', identification: { type: 'CI', number: '1.234.567-8' } },
  ...extra,
});

test('tarjeta: pago aprobado emite las entradas en el acto y manda datos completos a MP', async () => {
  const cfg = await (await get('/config')).json();
  assert.deepEqual(cfg.tarjeta, { mock: true });
  const r = await post('/pagar-tarjeta', {
    nombre: 'Ana María Pérez',
    email: 'ana@example.com',
    telefono: '+598 99 123 456',
    cantidad: 2,
    invitados: ['Bruno Pérez'],
    tarjeta: tarjeta(),
  });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.status, 'approved');
  const o = await (await get(`/orden/${j.orden}`)).json();
  assert.equal(o.status, 'paid');
  assert.equal(o.entradas.length, 2);
  const [p] = [...ent.mp.payments.values()];
  assert.equal(p._body.transaction_amount, 5200);
  assert.equal(p._body.payer.first_name, 'Ana');
  assert.equal(p._body.payer.last_name, 'María Pérez');
  assert.deepEqual(p._body.payer.identification, { type: 'CI', number: '12345678' });
  assert.equal(p._body.additional_info.items[0].category_id, 'tickets');
  assert.equal('currency_id' in p._body.additional_info.items[0], false); // MP lo rechaza en /v1/payments
  assert.equal(p._body.additional_info.payer.phone.number, '59899123456');
  assert.equal(p._body.external_reference, j.orden);
  // el webhook posterior del mismo pago no duplica nada
  await webhook(p.id);
  assert.equal(await ent.models.Entrada.countDocuments({}), 2);
});

test('tarjeta: rechazo devuelve un mensaje claro y libera el cupo', async () => {
  const r = await post('/pagar-tarjeta', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 3, invitados: invitadosPara(3), tarjeta: tarjeta('mock-rechazar') });
  const j = await r.json();
  assert.equal(j.status, 'rejected');
  assert.match(j.mensaje, /seguridad/);
  const ord = await ent.models.Orden.findOne({ publicId: j.orden });
  assert.equal(ord.status, 'cancelled');
  assert.equal(await ent.models.Entrada.countDocuments({}), 0);
  const cfg = await (await get('/config')).json();
  assert.equal(cfg.venta.quedan, 80); // el cupo no quedó retenido
});

test('tarjeta: pago en revisión queda pendiente; datos faltantes → 400 sin crear orden', async () => {
  const j = await (await post('/pagar-tarjeta', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 1, tarjeta: tarjeta('mock-pendiente') })).json();
  assert.equal(j.status, 'pending');
  assert.equal((await ent.models.Orden.findOne({ publicId: j.orden })).status, 'pending');
  const bad = await post('/pagar-tarjeta', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 1, tarjeta: { token: '' } });
  assert.equal(bad.status, 400);
  assert.equal(await ent.models.Orden.countDocuments({}), 1);
});

/* ------------------------- venta directa (efectivo / transferencia) ------------------------- */
test('venta manual: cuenta como venta, descuenta cupo, manda la entrada y separa el medio de cobro', async () => {
  const sinToken = await post('/admin/venta-manual', { nombre: 'Juan Pérez', email: 'juan@example.com', cantidad: 2, medio: 'efectivo' });
  assert.equal(sinToken.status, 401);
  const bad = await post('/admin/venta-manual', { nombre: 'Juan Pérez', email: 'juan@example.com', cantidad: 2, medio: 'cheque' }, H);
  assert.equal(bad.status, 400);
  const emailMalo = await post('/admin/venta-manual', { nombre: 'Juan Pérez', email: 'juan@', cantidad: 1, medio: 'efectivo' }, H);
  assert.equal(emailMalo.status, 400);

  const r = await post('/admin/venta-manual', { nombre: 'Juan Pérez', email: 'juan@example.com', cantidad: 2, medio: 'efectivo' }, H);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.enviado, true);
  assert.equal(j.entradas.length, 2);
  assert.equal(ent.mailer.sent.length, 1);
  assert.equal(ent.mailer.sent[0].to, 'juan@example.com');

  const r2 = await (await post('/admin/venta-manual', { nombre: 'Ana Gómez', email: 'ana@example.com', cantidad: 1, medio: 'transferencia', totalUYU: 2500, notas: 'pagó USD 65' }, H)).json();
  assert.equal(r2.entradas.length, 1);

  const cfg = await (await get('/config')).json();
  assert.equal(cfg.venta.quedan, 77); // 80 - 3
  const res = await (await get('/admin/resumen', H)).json();
  assert.equal(res.vendidas, 3);
  assert.equal(res.recaudadoUYU, 5200 + 2500);
  assert.deepEqual(res.porMedio.efectivo, { entradas: 2, totalUYU: 5200 });
  assert.deepEqual(res.porMedio.transferencia, { entradas: 1, totalUYU: 2500 });
  const csv = await (await get('/admin/export.csv', H)).text();
  assert.match(csv, /cobro/);
  assert.match(csv, /"efectivo"/);
  assert.match(csv, /"transferencia"/);
  // la entrada sirve para ingresar como cualquier otra
  const ok = await (await post('/admin/ingreso', { code: j.entradas[0].code }, H)).json();
  assert.equal(ok.ok, true);
});

test('talonario: registra el número y el local, no deja cargar dos veces la misma entrada', async () => {
  const body = { nombre: 'Laura Díaz', email: 'laura@example.com', medio: 'talonario', talonarioNum: '027', local: 'Tienda Centro' };
  const sinNum = await post('/admin/venta-manual', { ...body, talonarioNum: '' }, H);
  assert.equal(sinNum.status, 400);
  const r = await post('/admin/venta-manual', body, H);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.entradas.length, 1);
  assert.equal(j.enviado, true);
  const dup = await post('/admin/venta-manual', { ...body, nombre: 'Otra Persona', email: 'otra@example.com' }, H);
  assert.equal(dup.status, 409);
  assert.match((await dup.json()).error, /Nº 27.*Laura Díaz/);
  const res = await (await get('/admin/resumen', H)).json();
  assert.deepEqual(res.porMedio.talonario, { entradas: 1, totalUYU: 2600 });
  const csv = await (await get('/admin/export.csv', H)).text();
  assert.match(csv, /talonario Nº 27 \(Tienda Centro\)/);
});

/* ------------------------- tandas editables desde el panel ------------------------- */
test('tandas: Ico extiende la primera tanda y cambia precio y cupo desde el panel', async () => {
  const H2 = H;
  const before = await (await get('/admin/tandas', H2)).json();
  assert.equal(before.origen, 'archivo');
  assert.equal(before.tandas[0].estado, 'vigente');
  // venta en la primera tanda
  const b = await buy({ cantidad: 2 });
  const pay = ent.mp.addPayment({ prefId: prefIdOf(b.url) });
  await webhook(pay.id);

  const rows = before.tandas.map((t) => ({ id: t.id, nombre: t.nombre, hastaFecha: t.hastaFecha, precioUSD: t.precioUSD, cupo: t.cupo }));
  // validaciones
  let r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H2, body: JSON.stringify({ tandas: [{ ...rows[0], hastaFecha: '2026-11-30' }, rows[1]] }) });
  assert.equal(r.status, 400); // termina después de la segunda / del evento
  r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H2, body: JSON.stringify({ tandas: [{ ...rows[0], cupo: 1 }, rows[1]] }) });
  assert.equal(r.status, 400); // cupo menor a lo vendido
  r = await fetch(base + '/admin/tandas', { method: 'PUT', body: JSON.stringify({ tandas: rows }), headers: { 'Content-Type': 'application/json' } });
  assert.equal(r.status, 401);

  // la primera tanda termina el 5/11: el 6/11 ya sería la segunda
  clock = new Date('2026-11-06T12:00:00-03:00');
  assert.equal((await (await get('/config')).json()).venta.tandaId, 't2');

  // Ico la extiende al 8/11, con precio 60 y cupo 100
  r = await fetch(base + '/admin/tandas', {
    method: 'PUT',
    headers: H2,
    body: JSON.stringify({ tandas: [{ ...rows[0], hastaFecha: '2026-11-08', precioUSD: 60, cupo: 100 }, rows[1]] }),
  });
  assert.equal(r.status, 200);
  const saved = await r.json();
  assert.equal(saved.origen, 'panel');
  assert.equal(saved.tandas[0].hasta, '2026-11-08T23:59:59-03:00');
  assert.equal(saved.tandas[0].vendidas, 2);
  const cfg = await (await get('/config')).json();
  assert.equal(cfg.venta.tandaId, 't1');
  assert.equal(cfg.venta.precioUSD, 60);
  assert.equal(cfg.venta.precioUYU, 2400);
  assert.equal(cfg.venta.quedan, 98);
  // pasado el 8/11 cierra a las 23:59 y sigue la segunda
  clock = new Date('2026-11-09T00:00:30-03:00');
  assert.equal((await (await get('/config')).json()).venta.tandaId, 't2');
  await ent.models.Ajuste.deleteMany({});
});

test('tandas: se agrega una tanda nueva desde el panel y la venta sigue hasta el evento', async () => {
  const before = await (await get('/admin/tandas', H)).json();
  assert.equal(before.fechaEvento, '2026-11-29');
  const rows = before.tandas.map((t) => ({ id: t.id, nombre: t.nombre, hastaFecha: t.hastaFecha, precioUSD: t.precioUSD, cupo: t.cupo }));
  const last = rows[rows.length - 1];
  // pasada la última tanda la venta online cierra
  clock = new Date(Date.parse(last.hastaFecha + 'T23:59:59-03:00') + 60 * 60 * 1000);
  assert.equal((await (await get('/config')).json()).venta.abierta, false);
  // no se puede pasar del evento ni quitar tandas existentes
  let r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H, body: JSON.stringify({ tandas: [...rows, { id: 'nueva-1', nombre: 'Tanda 3', hastaFecha: '2026-11-30', precioUSD: 75 }] }) });
  assert.equal(r.status, 400);
  r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H, body: JSON.stringify({ tandas: [rows[0], { id: 'nueva-1', nombre: 'Tanda 3', hastaFecha: '2026-11-29', precioUSD: 75 }] }) });
  assert.equal(r.status, 400);
  r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H, body: JSON.stringify({ tandas: [...rows, { id: 'nueva-1', nombre: 'Tanda 3', hastaFecha: '2026-11-29', precioUSD: 75, cupo: null }] }) });
  assert.equal(r.status, 200);
  const saved = await r.json();
  assert.equal(saved.tandas.length, rows.length + 1);
  const nueva = saved.tandas[saved.tandas.length - 1];
  assert.equal(nueva.id, `tanda-${rows.length + 1}`);
  assert.equal(nueva.estado, 'vigente');
  const cfg = await (await get('/config')).json();
  assert.equal(cfg.venta.abierta, true);
  assert.equal(cfg.venta.tandaId, nueva.id);
  assert.equal(cfg.venta.precioUSD, 75);
  assert.equal(cfg.puerta.precioUSD, 90);
  // se puede comprar en la tanda nueva
  const b = await buy({ cantidad: 1 });
  assert.ok(b.url);
  // y al volver a guardar, la tanda nueva ya es una más (no se duplica)
  r = await fetch(base + '/admin/tandas', { method: 'PUT', headers: H, body: JSON.stringify({ tandas: saved.tandas.map((t) => ({ id: t.id, nombre: t.nombre, hastaFecha: t.hastaFecha, precioUSD: t.precioUSD, cupo: t.cupo })) }) });
  assert.equal((await r.json()).tandas.length, rows.length + 1);
  await ent.models.Ajuste.deleteMany({});
});

test('terminadas las tandas, la venta cargada en el panel se cobra al precio de puerta', async () => {
  clock = new Date('2026-11-29T17:30:00-03:00');
  const cfg = await (await get('/config')).json();
  assert.equal(cfg.venta.abierta, false);
  assert.equal(cfg.puerta.precioUSD, 90);
  const r = await fetch(base + '/admin/venta-manual', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ nombre: 'Lucía Puerta', email: 'lucia@example.com', cantidad: 2, medio: 'efectivo' }),
  });
  assert.equal(r.status, 200);
  const o = await ent.models.Orden.findOne({ 'comprador.email': 'lucia@example.com' }).lean();
  assert.equal(cfg.puerta.precioUYU, 3600);
  assert.equal(o.totalUYU, 7000); // 2 personas: 3.500 c/u
});

/* ------------------------- nombres de invitados y cortesías sin email ------------------------- */
test('compra de varias entradas: cada entrada queda a nombre de su invitado', async () => {
  const falta = await post('/checkout', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 3, invitados: ['Bruno Pérez'] });
  assert.equal(falta.status, 400);
  assert.match((await falta.json()).error, /invitado 3/);
  const b = await buy({ cantidad: 3, invitados: ['Bruno Pérez', 'Carla Gómez'] });
  const pay = ent.mp.addPayment({ prefId: prefIdOf(b.url) });
  await webhook(pay.id);
  const t = await ent.models.Entrada.find({}).sort({ seq: 1 }).lean();
  assert.deepEqual(t.map((x) => x.nombre), ['Ana Pérez', 'Bruno Pérez', 'Carla Gómez']);
  assert.match(ent.mailer.sent[0].html, /Carla Gómez/);
});

test('cortesía sin enviar: queda en la lista pero no sale ningún email', async () => {
  const r = await (await post('/admin/cortesia', { nombre: 'Prensa Diario', email: 'prensa@example.com', cantidad: 2, invitados: ['Fotógrafo'], enviar: false }, H)).json();
  assert.equal(r.enviado, false);
  assert.equal(r.entradas.length, 2);
  assert.equal(ent.mailer.sent.length, 0);
  const t = await ent.models.Entrada.find({ tipo: 'cortesia' }).sort({ seq: 1 }).lean();
  assert.deepEqual(t.map((x) => x.nombre), ['Prensa Diario', 'Fotógrafo']);
  const r2 = await (await post('/admin/cortesia', { nombre: 'Sin Mail', cantidad: 2 }, H)).json();
  assert.equal(r2.enviado, false);
  const t2 = await ent.models.Entrada.find({ orderPublicId: r2.orden }).sort({ seq: 1 }).lean();
  assert.equal(t2[1].nombre, 'Invitado de Sin Mail');
  const r3 = await (await post('/admin/cortesia', { nombre: 'Con Mail', email: 'con@example.com', cantidad: 1 }, H)).json();
  assert.equal(r3.enviado, true);
  assert.equal(ent.mailer.sent.length, 1);
});

/* ------------------------- puerta: personal de puerta, promo por grupo y notas ------------------------- */
const HP = { Authorization: 'Bearer puerta-test', 'Content-Type': 'application/json' };

test('puerta: precio por persona baja 100 por cada persona del grupo, sin bajar del mínimo', () => {
  const p = (n) => ent.service.precioPuerta(n);
  assert.deepEqual(p(1), { unitUYU: 3600, totalUYU: 3600 });
  assert.deepEqual(p(2), { unitUYU: 3500, totalUYU: 7000 });
  assert.deepEqual(p(3), { unitUYU: 3400, totalUYU: 10200 });
  assert.equal(p(7).unitUYU, 3000);
  assert.equal(p(10).unitUYU, 3000);
});

test('puerta: el personal de puerta no entra al panel ni ve lo recaudado', async () => {
  for (const path of ['/admin/resumen', '/admin/tandas', '/admin/export.csv', '/admin/notas-puerta', '/admin/ordenes']) {
    assert.equal((await get(path, HP)).status, 401, path);
  }
  assert.equal((await post('/admin/venta-manual', { nombre: 'X Y Z', email: 'x@example.com', cantidad: 1, medio: 'efectivo' }, HP)).status, 401);
  assert.equal((await post('/admin/anular', { code: 'AAAA-BBBB-CCCC' }, HP)).status, 401);
  assert.equal((await get('/puerta/info')).status, 401);
  const info = await (await get('/puerta/info', HP)).json();
  assert.equal(info.usuario.rol, 'puerta');
  assert.equal(info.precios[1].unitUYU, 3500);
  const json = JSON.stringify(info);
  assert.doesNotMatch(json, /recaudado|porMedio|porTanda/);
});

test('puerta: cobra en efectivo un grupo, entran en el momento y queda registrado quién cobró', async () => {
  clock = new Date('2026-11-29T17:00:00-03:00');
  let r = await post('/puerta/cobrar', { nombre: 'Marta Díaz', telefono: '099 123 456', cantidad: 2, invitados: ['Pablo Díaz'] }, HP);
  assert.equal(r.status, 400); // falta efectivo/transferencia
  const body = { nombre: 'Marta Díaz', telefono: '099 123 456', cantidad: 2, invitados: ['Pablo Díaz'], medio: 'efectivo', idem: 'abc-1', precioUnitUYU: 1 };
  r = await post('/puerta/cobrar', body, HP);
  assert.equal(r.status, 200);
  const out = await r.json();
  assert.equal(out.totalUYU, 7000); // el precio lo pone el servidor, no el que cobra
  assert.equal(out.enviado, false); // sin email
  assert.deepEqual(out.entradas.map((e) => [e.nombre, e.status]), [['Marta Díaz', 'used'], ['Pablo Díaz', 'used']]);
  // tocar dos veces "Cobrar" no duplica la venta
  const again = await (await post('/puerta/cobrar', body, HP)).json();
  assert.equal(again.orden, out.orden);
  assert.equal(await ent.models.Orden.countDocuments({ canal: 'puerta' }), 1);
  const o = await ent.models.Orden.findOne({ publicId: out.orden }).lean();
  assert.equal(o.registradoPor, 'Puerta');
  assert.equal(o.medioPago, 'efectivo');
  // transferencia con email: le llega la entrada; "no entran todavía"
  const t = await (await post('/puerta/cobrar', { nombre: 'Juan Sosa', email: 'juan@example.com', cantidad: 1, medio: 'transferencia', ingresan: false }, HP)).json();
  assert.equal(t.totalUYU, 3600);
  assert.equal(t.enviado, true);
  assert.equal(t.entradas[0].status, 'valid');
  // la busca por celular y la marca
  const l = await (await get('/puerta/lista?q=' + encodeURIComponent('099 123'), HP)).json();
  assert.equal(l.total, 2);
  const ing = await post('/puerta/ingreso', { code: t.entradas[0].code }, HP);
  assert.equal(ing.status, 200);
  const e = await ent.models.Entrada.findOne({ code: t.entradas[0].code }).lean();
  assert.equal(e.checkedInBy, 'puerta: Puerta');
  // Ico ve lo cobrado en puerta, separado por medio y por quién cobró
  const res = await (await get('/admin/resumen', H)).json();
  assert.equal(res.puerta.entradas, 3);
  assert.equal(res.puerta.efectivo.totalUYU, 7000);
  assert.equal(res.puerta.transferencia.totalUYU, 3600);
  assert.deepEqual(res.puerta.porPersona, [{ nombre: 'Puerta', entradas: 3, efectivoUYU: 7000, transferenciaUYU: 3600 }]);
  const csv = await (await get('/admin/export.csv', H)).text();
  assert.match(csv, /puerta, efectivo \(Puerta\)/);
});

test('puerta: Ico le deja notas a quien está en la puerta', async () => {
  let r = await post('/admin/notas-puerta', { texto: 'Los de la lista de Agro entran sin cargo' }, H);
  assert.equal(r.status, 200);
  const { notas } = await r.json();
  assert.equal(notas.length, 1);
  const info = await (await get('/puerta/info', HP)).json();
  assert.equal(info.notas[0].texto, 'Los de la lista de Agro entran sin cargo');
  assert.equal((await post('/admin/notas-puerta', { texto: 'x' }, HP)).status, 401);
  r = await fetch(base + '/admin/notas-puerta/' + notas[0].id, { method: 'DELETE', headers: H });
  assert.equal((await r.json()).notas.length, 0);
  assert.equal((await (await get('/puerta/info', HP)).json()).notas.length, 0);
});

test('talonario sin email: queda en la lista y no se manda nada', async () => {
  const r = await post('/admin/venta-manual', { nombre: 'Rosa Ferreira', cantidad: 1, medio: 'talonario', talonarioNum: 41, local: 'La Faustina' }, H);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.conEmail, false);
  assert.equal(j.enviado, false);
  assert.equal(ent.mailer.sent.filter((m) => m.to === '').length, 0);
  const l = await (await get('/admin/lista?q=Rosa', H)).json();
  assert.equal(l.total, 1);
  assert.equal(l.items[0].status, 'valid');
  const o = await ent.models.Orden.findOne({ talonarioNum: 41 }).lean();
  assert.equal(o.emailStatus, 'none');
});

test('puerta: quien cobra puede poner otro monto y queda marcado para Ico', async () => {
  clock = new Date('2026-11-29T18:00:00-03:00');
  const r = await post('/puerta/cobrar', { nombre: 'Clara Núñez', cantidad: 2, medio: 'efectivo', totalUYU: 5000, notas: 'amiga de Ico' }, HP);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.totalUYU, 5000);
  assert.equal(j.precioUnitUYU, 2500);
  // sin monto: el de la tabla, sin marca
  const n = await (await post('/puerta/cobrar', { nombre: 'Luis Núñez', cantidad: 1, medio: 'efectivo' }, HP)).json();
  assert.equal(n.totalUYU, 3600);
  assert.equal((await post('/puerta/cobrar', { nombre: 'Luis Núñez', cantidad: 1, medio: 'efectivo', totalUYU: -5 }, HP)).status, 400);
  const res = await (await get('/admin/resumen', H)).json();
  assert.equal(res.puerta.otroPrecio.length, 1);
  assert.deepEqual(res.puerta.otroPrecio[0], { nombre: 'Clara Núñez', cantidad: 2, totalUYU: 5000, sugeridoUYU: 7000, medio: 'efectivo', por: 'Puerta', notas: 'amiga de Ico' });
  assert.equal(res.puerta.efectivo.totalUYU, 8600);
});
