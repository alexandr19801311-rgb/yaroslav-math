import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // Корневая директория проекта
  base: './', // Относительные пути для беспроблемного деплоя на GitHub Pages
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Сюда будете добавлять точки входа для новых игр, например:
        // arithmetic: resolve(__dirname, 'src/games/game-arithmetic/index.html')
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
