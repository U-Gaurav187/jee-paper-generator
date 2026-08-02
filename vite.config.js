import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path so assets load properly on Vercel, GitHub Pages (/jee-paper-generator/), and local dev
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
