import './assets/css/global.css';
import { ArithmeticGame } from './games/game-arithmetic/index';
import { SmartScalesGame } from './games/game-logic-scales/index';
import { NumberCompositionGame } from './games/game-number-composition/index';
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

  const startGame = (gameType: 'arith' | 'scales' | 'comp' | 'houses', maxNumber: number) => {
    if (!menuContainer || !gameContainer) return;
    
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';

    if (gameType === 'arith') {
      const game = new ArithmeticGame(60, returnToMenu, maxNumber);
      game.init();
    } else if (gameType === 'scales') {
      const game = new SmartScalesGame(60, returnToMenu, maxNumber);
      game.init();
    } else if (gameType === 'houses') {
      const game = new NumberHousesGame(0, returnToMenu, 10, false);
      game.init();
    } else {
      const game = new NumberCompositionGame(60, returnToMenu, maxNumber);
      game.init();
    }
  };

  // Арифметика
  document.getElementById('start-arith-easy')?.addEventListener('click', () => startGame('arith', 10));
  document.getElementById('start-arith-medium')?.addEventListener('click', () => startGame('arith', 20));
  document.getElementById('start-arith-hard')?.addEventListener('click', () => startGame('arith', 100));

  // Весы
  document.getElementById('start-scales-easy')?.addEventListener('click', () => startGame('scales', 10));
  document.getElementById('start-scales-medium')?.addEventListener('click', () => startGame('scales', 20));
  document.getElementById('start-scales-hard')?.addEventListener('click', () => startGame('scales', 100));

  // Состав числа
  document.getElementById('start-comp-easy')?.addEventListener('click', () => startGame('comp', 10));
  document.getElementById('start-comp-medium')?.addEventListener('click', () => startGame('comp', 20));
  document.getElementById('start-comp-hard')?.addEventListener('click', () => startGame('comp', 30));

  // Домики
  document.getElementById('start-houses')?.addEventListener('click', () => startGame('houses', 10));
});