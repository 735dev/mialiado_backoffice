/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Una sola entrada (index.html): el panel ocupa la raíz de su dominio.
// En desarrollo, /api se envía a aliado_backend (uvicorn en el puerto 5010; 127.0.0.1 y no localhost, que en Windows resuelve a ::1),
// así VITE_API_BASE puede quedarse en '/api/admin' sin problemas de CORS.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` }],
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://127.0.0.1:5010',
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
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
