import './assets/css/global.css';
import { ArithmeticGame } from './games/game-arithmetic/index';
import { SmartScalesGame } from './games/game-logic-scales/index';

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  const startArithmeticBtn = document.getElementById('btn-start-arithmetic');
  const startScalesBtn = document.getElementById('btn-start-scales');

  // Функция для возврата в меню
  const returnToMenu = () => {
    if (gameContainer) {
      gameContainer.style.display = 'none';
      gameContainer.innerHTML = ''; // Очищаем DOM игры
    }
    if (menuContainer) {
      // Если у тебя меню на flex, замени 'block' на 'flex'
      menuContainer.style.display = 'block'; 
    }
  };

  if (startArithmeticBtn) {
    startArithmeticBtn.addEventListener('click', () => {
      if (menuContainer && gameContainer) {
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        const game = new ArithmeticGame(60, returnToMenu);
        game.init();
      }
    });
  }

  if (startScalesBtn) {
    startScalesBtn.addEventListener('click', () => {
      if (menuContainer && gameContainer) {
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        const game = new SmartScalesGame(60, returnToMenu);
        game.init();
      }
    });
  }
});