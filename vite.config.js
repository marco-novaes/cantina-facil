import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
  server: {
    port: 5173,
    host: true, // Listen on all network addresses for LAN/phone testing
  },
  preview: {
    port: 4173,
    host: true,
  }
});
