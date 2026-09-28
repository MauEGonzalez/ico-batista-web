# Ico Batista — Web + Panel

Catálogo web del diseñador Ico Batista. Las prendas se consultan y se compran por WhatsApp.
Las prendas se cargan desde un panel propio en `/admin`.

- **Frontend:** React 19 + Vite (`src/`)
- **Panel de administración:** `src/admin/` (se descarga solo al entrar a `/admin`)
- **API:** Node + Express 5 + MongoDB (`server/`), corre en Vercel como función serverless (`api/index.js`)
- **Fotos:** Cloudinary (se suben directo desde el panel; la web las pide en el tamaño y formato justo)

## Estructura

```
api/index.js            Entrada de la API en Vercel
server/
  app.js                Express: middlewares y rutas
  dev.js                Servidor local (npm run dev:api)
  config/               Conexión a MongoDB y Cloudinary
  models/               Product, User
  routes/               auth, products (público + admin), uploads
  middleware/auth.js    Sesión con JWT en cookie httpOnly
scripts/
  create-admin.mjs      Crea usuarios del panel
  import-media.mjs      Importación masiva de fotos por carpetas
src/
  admin/                Panel (login, listado, formulario, subida de fotos)
  categories.js         Categorías válidas (salen de menuData.js)
  context/              Productos, moneda, "Mi selección"
  config/contact.js     WhatsApp e Instagram
```

## Puesta en marcha (una sola vez)

1. **Instalar dependencias:** `npm install`
2. **Crear el `.env`:** copiar `.env.example` como `.env` y completar:
   - `MONGODB_URI`: Atlas → proyecto "Ico Batista" → cluster → *Connect* → *Drivers*.
     En *Network Access* agregar `0.0.0.0/0` (Vercel no tiene IP fija).
   - `CLOUDINARY_*`: Cloudinary → *Settings* → *API Keys*.
   - `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. **Crear los usuarios del panel:** `npm run create-admin` (pide email, nombre y contraseña).
   Correrlo una vez para cada persona (Mauro, Ico). Si el email ya existe, cambia la contraseña.
4. **En Vercel:** *Settings → Environment Variables* → cargar las mismas variables del `.env`
   y volver a desplegar.

## Desarrollo

En dos terminales:

```bash
npm run dev:api   # API en http://localhost:3001 (usa el .env)
npm run dev       # Web en http://localhost:5173  → panel en /admin
```

Si la API no está corriendo, en desarrollo la web muestra los productos de ejemplo de `src/productsData.js`
(en producción no).

## Importación masiva de fotos

Una carpeta por prenda; la ruta de carpetas es la categoría del menú; el nombre de la carpeta es el
nombre de la prenda. La primera foto (por orden alfabético) es la portada.

```
fotos-ico/
  mujer/formal/fiesta/vestidos/vestido-aurora/1.jpg 2.jpg 3.jpg
  hombre/casual/camperas/bomber-aviator/...
  videos/portada.mp4 formal.mp4 ...
```

```bash
npm run import-media -- "C:\ruta\fotos-ico" --dry   # Simulación: muestra qué haría, no sube nada
npm run import-media -- "C:\ruta\fotos-ico"         # Importa
```

- Las prendas se crean como **borrador** (ocultas). Desde el panel se completa precio, talles,
  medidas y descripción, y se publican.
- Se puede correr varias veces: lo ya importado se saltea.
- Las fotos de más de 3000 px o 9 MB se achican antes de subir (límite del plan gratis: 10 MB).
- Los videos (máx. 100 MB en el plan gratis) se suben a Cloudinary; las URLs optimizadas quedan
  en `import-report.json`.
- Las carpetas cuya categoría no existe en el menú se informan y no se importan.

## Seguridad

- Sesión del panel en cookie `httpOnly` + `SameSite=Strict` (7 días).
- Las acciones que modifican datos solo se aceptan desde el propio sitio (chequeo de `Origin`).
- Límite de intentos de login por IP.
- Las fotos se suben con firma generada por el servidor: sin sesión no se puede subir nada.
- `/admin` no se indexa en buscadores.
