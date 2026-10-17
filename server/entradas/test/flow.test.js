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

async function buy(extra = {}) {
  const r = await post('/checkout', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 2, ...extra });
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
      ICO_NOTIFY_EMAIL: 'ico@example.com',
      MAIL_PROVIDER: 'dev',
      PUBLIC_URL: 'http://localhost:5173',
    },
    { disableRateLimit: true, mail: { provider: 'dev', from: 'x@x.com', outboxDir: '/tmp/ico-outbox-test', smtp: {} } }
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

  const c = await buy({ nombre: 'Lucía Gómez' });
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
  assert.equal(p._body.additional_info.payer.phone.number, '59899123456');
  assert.equal(p._body.external_reference, j.orden);
  // el webhook posterior del mismo pago no duplica nada
  await webhook(p.id);
  assert.equal(await ent.models.Entrada.countDocuments({}), 2);
});

test('tarjeta: rechazo devuelve un mensaje claro y libera el cupo', async () => {
  const r = await post('/pagar-tarjeta', { nombre: 'Ana Pérez', email: 'ana@example.com', cantidad: 3, tarjeta: tarjeta('mock-rechazar') });
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
