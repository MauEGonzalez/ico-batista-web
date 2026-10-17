import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // entradas.html = la misma app con la vista previa para compartir del evento (ver vercel.json)
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        entradas: fileURLToPath(new URL('./entradas.html', import.meta.url)),
      },
    },
  },
  server: {
    // En desarrollo, las llamadas a /api van al servidor local (npm run dev:api)
    proxy: {
      // changeOrigin: false mantiene el host original (lo usa la protección CSRF de la API)
      '/api': { target: 'http://localhost:3001', changeOrigin: false },
    },
  },
})
