import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Relative base path so assets load properly on Vercel, GitHub Pages, and local dev
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
