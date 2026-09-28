import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, las llamadas a /api van al servidor local (npm run dev:api)
    proxy: {
      // changeOrigin: false mantiene el host original (lo usa la protección CSRF de la API)
      '/api': { target: 'http://localhost:3001', changeOrigin: false },
    },
  },
})
