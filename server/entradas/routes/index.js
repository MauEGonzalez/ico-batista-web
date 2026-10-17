import express from 'express';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { HttpError } from '../utils/errors.js';

export function defaultRequireAdmin(config) {
  return (req, _res, next) => {
    const token = config.adminToken;
    const header = req.headers.authorization || '';
    const given = header.startsWith('Bearer ') ? header.slice(7) : '';
    const a = Buffer.from(given);
    const b = Buffer.from(token || '');
    if (!token || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return next(new HttpError(401, 'No autorizado', 'no_autorizado'));
    }
    next();
  };
}

export function createRouter({ config, service, requireAdmin, mp }) {
  const r = express.Router();
  r.use(express.json({ limit: '20kb' }));

  const limiter = (windowMs, max) =>
    rateLimit({
      windowMs,
      limit: config.disableRateLimit ? 1_000_000 : max,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Demasiados intentos. Probá de nuevo en un rato.', code: 'rate_limit' },
    });

  /* ---------------- público ---------------- */
  r.get('/config', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.publicConfig());
  });

  r.post('/checkout', limiter(60_000, 10), async (req, res) => {
    if (req.body?.web) return res.status(400).json({ error: 'Solicitud inválida' }); // honeypot
    res.json(await service.createCheckout(req.body));
  });

  // Webhook de Mercado Pago: 200 si se procesó o se ignora; 500 si falló (MP reintenta)
  r.post('/webhook', async (req, res) => {
    try {
      const out = await service.handleNotification({ query: req.query, body: req.body, headers: req.headers });
      res.status(200).json({ ok: true, ...out });
    } catch (e) {
      if (e instanceof HttpError && e.status < 500) throw e;
      console.error('[entradas] webhook error', e);
      res.status(500).json({ ok: false });
    }
  });

  r.get('/orden/:id', limiter(60_000, 60), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.getOrderPublic(req.params.id));
  });
  r.post('/orden/:id/sync', limiter(60_000, 20), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.syncOrder(req.params.id));
  });
  r.get('/ticket/:code', limiter(60_000, 60), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.getTicketPublic(req.params.code));
  });
  r.post('/ticket/:code/rsvp', limiter(60_000, 20), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.rsvp(req.params.code, req.body?.respuesta));
  });
  r.get('/ticket/:code/qr.png', limiter(60_000, 60), async (req, res) => {
    const png = await service.getTicketQr(req.params.code);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'private, max-age=3600');
    res.send(png);
  });

  /* ---------------- panel (Ico) ---------------- */
  const admin = express.Router();
  admin.use(requireAdmin);
  admin.get('/me', (_req, res) => res.json({ ok: true }));
  admin.get('/resumen', async (_req, res) => res.json(await service.resumen()));
  admin.get('/lista', async (req, res) => res.json(await service.lista(req.query)));
  admin.get('/ordenes', async (req, res) => res.json(await service.ordenes({ status: req.query.status })));
  admin.post('/ingreso', async (req, res) => res.json(await service.checkIn(req.body?.code, 'panel')));
  admin.post('/ingreso/deshacer', async (req, res) => res.json(await service.undoCheckIn(req.body?.code)));
  admin.post('/anular', async (req, res) => res.json(await service.voidTicket(req.body?.code)));
  admin.post('/cortesia', async (req, res) => res.json(await service.createCortesia(req.body)));
  admin.post('/ordenes/:id/reenviar', async (req, res) => res.json(await service.resend(req.params.id)));
  admin.get('/export.csv', async (_req, res) => {
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="entradas.csv"');
    res.send(await service.exportCsv());
  });
  r.use('/admin', admin);

  /* ---------------- simulador de Mercado Pago ---------------- */
  if (config.isMock) {
    r.get('/_mock/pref/:id', (req, res) => {
      const pref = mp.prefs.get(req.params.id);
      if (!pref) throw new HttpError(404, 'Preferencia inexistente');
      const it = pref.items[0];
      res.json({ titulo: it.title, cantidad: it.quantity, unitario: it.unit_price, total: it.quantity * it.unit_price, back_urls: pref.back_urls });
    });
    r.post('/_mock/pagar', async (req, res) => {
      const { pref, status = 'approved' } = req.body || {};
      const p = mp.prefs.get(pref);
      if (!p) throw new HttpError(404, 'Preferencia inexistente');
      const payment = mp.addPayment({ prefId: pref, status });
      // Igual que MP: avisa por webhook de forma asíncrona
      service
        .handleNotification({ query: {}, body: { type: 'payment', data: { id: String(payment.id) } }, headers: {}, trusted: true })
        .catch((e) => console.error('[mock] webhook', e));
      const back = status === 'approved' ? p.back_urls.success : status === 'rejected' ? p.back_urls.failure : p.back_urls.pending;
      res.json({ redirect: back, paymentId: payment.id });
    });
  }

  // errores
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, code: err.code, ...(err.data ? { data: err.data } : {}) });
    }
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
    console.error('[entradas] error', err);
    res.status(500).json({ error: 'Error interno' });
  });

  return r;
}
