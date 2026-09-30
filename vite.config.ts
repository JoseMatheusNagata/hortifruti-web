import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite publicar no GitHub Pages (usamos HashRouter)
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
