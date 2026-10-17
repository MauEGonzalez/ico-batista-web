// /server/app.js
// API de Ico Batista. En Vercel corre como función serverless (api/index.js);
// en tu PC corre con: npm run dev:api
import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { runMigrations } from './utils/migrations.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import { publicRouter as publicProducts, adminRouter as adminProducts } from './routes/products.js';
import { publicRouter as publicRunways, adminRouter as adminRunways } from './routes/runways.js';
import { publicRouter as publicSubscribe, adminRouter as adminSubscribers } from './routes/subscribers.js';
import { publicRouter as publicContact, adminRouter as adminMessages } from './routes/contact.js';
import { entradasRouter } from './entradas/mount.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Encabezados básicos de seguridad para la API
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'same-origin');
  next();
});

// Protección CSRF: las acciones que modifican datos solo se aceptan desde nuestro propio sitio
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ message: 'Origen no permitido' });
      }
    } catch {
      return res.status(403).json({ message: 'Origen no permitido' });
    }
  }
  return next();
});

// Todas las rutas usan la base: nos conectamos (o reutilizamos la conexión) antes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    await runMigrations();
    next();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    res.status(503).json({ message: 'La base de datos no está disponible' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', publicProducts);
app.use('/api/admin/products', adminProducts);
app.use('/api/admin/uploads', uploadRoutes);
app.use('/api/runways', publicRunways);
app.use('/api/admin/runways', adminRunways);
app.use('/api/subscribe', publicSubscribe);
app.use('/api/admin/subscribers', adminSubscribers);
app.use('/api/contact', publicContact);
app.use('/api/admin/messages', adminMessages);
// Entradas del desfile (compra con Mercado Pago, QR, cortesías y lista de ingreso)
app.use('/api/entradas', entradasRouter());

app.use('/api', (req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// Manejo central de errores (Express 5 atrapa también los errores de funciones async)
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    const first = Object.values(error.errors)[0];
    return res.status(400).json({ message: first?.message || 'Datos inválidos' });
  }
  if (error.name === 'CastError') {
    return res.status(404).json({ message: 'No encontrado' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un registro con ese valor' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
