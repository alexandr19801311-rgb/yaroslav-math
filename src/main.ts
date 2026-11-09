import './assets/css/global.css'; // Подключаем стили через Vite
import { ArithmeticGame } from './games/game-arithmetic/index';

document.addEventListener('DOMContentLoaded', () => {
  const startArithmeticBtn = document.getElementById('btn-start-arithmetic');
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  if (startArithmeticBtn && menuContainer && gameContainer) {
    startArithmeticBtn.addEventListener('click', () => {
      menuContainer.style.display = 'none';
      gameContainer.style.display = 'block';

      const game = new ArithmeticGame(60);
      game.init();
    });
  }
});