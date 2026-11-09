import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', 
  // Указываем базовый путь — имя вашего репозитория на GitHub
  base: '/yaroslav-math/', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, './src/core'),
      '@components': resolve(__dirname, './src/components'),
      '@assets': resolve(__dirname, './src/assets')
    }
  }
});
