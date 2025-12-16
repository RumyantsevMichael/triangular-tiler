import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [mkcert()],
  root: '.',
  publicDir: false, // Don't copy demo folder as static
  server: {
    port: 3000,
    open: true,
    https: true, // Required for WebGPU support in Safari
  },
  build: {
    outDir: 'build', // Use 'build' to avoid conflict with tsc output 'dist'
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});