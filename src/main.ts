import './assets/css/global.css';
import { ArithmeticGame } from './games/game-arithmetic/index';
import { SmartScalesGame } from './games/game-logic-scales/index';

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  const startArithmeticBtn = document.getElementById('btn-start-arithmetic');
  const startScalesBtn = document.getElementById('btn-start-scales');

  function launchGame(gameInstance: { init: () => void }) {
    if (menuContainer && gameContainer) {
      menuContainer.style.display = 'none';
      gameContainer.style.display = 'block';
      gameInstance.init();
    }
  }

  if (startArithmeticBtn) {
    startArithmeticBtn.addEventListener('click', () => {
      launchGame(new ArithmeticGame(60));
    });
  }

  if (startScalesBtn) {
    startScalesBtn.addEventListener('click', () => {
      launchGame(new SmartScalesGame(60));
    });
  }
});