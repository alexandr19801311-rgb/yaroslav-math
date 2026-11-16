import './assets/css/global.css';
import { NumberHousesGame } from './games/game-number-houses/index';

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  const returnToMenu = () => {
    if (gameContainer) {
      gameContainer.style.display = 'none';
      gameContainer.innerHTML = '';
    }
    if (menuContainer) {
      menuContainer.style.display = 'flex';
    }
  };

  const startGame = () => {
    if (!menuContainer || !gameContainer) return;
    
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';

    const game = new NumberHousesGame(0, returnToMenu, 10, false);
    game.init();
  };

  // Кнопка запуска
  document.getElementById('start-houses-all')?.addEventListener('click', startGame);
});