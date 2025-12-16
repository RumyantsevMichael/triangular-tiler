import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [mkcert(),],
  root: '.',
  publicDir: 'demo',
  server: {
    port: 3000,
    open: true,
    https: true, // Required for WebGPU support in Safari
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});