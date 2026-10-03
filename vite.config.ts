/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Una sola entrada (index.html): el panel ocupa la raíz de su dominio.
// En desarrollo, /api se envía a aliado_backend (uvicorn en el puerto 5010),
// así VITE_API_BASE puede quedarse en '/api/admin' sin problemas de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:5010',
    },
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
