// /server/dev.js
// Servidor local para desarrollo. Uso: npm run dev:api  (lee las claves de .env)
import app from './app.js';

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API de Ico Batista en http://localhost:${PORT}/api`);
});
