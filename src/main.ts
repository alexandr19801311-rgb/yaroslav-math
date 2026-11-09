import { ArithmeticGame } from './games/game-arithmetic/index';

document.addEventListener('DOMContentLoaded', () => {
  const startArithmeticBtn = document.getElementById('btn-start-arithmetic');
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  if (startArithmeticBtn && menuContainer && gameContainer) {
    startArithmeticBtn.addEventListener('click', () => {
      // Прячем меню, показываем игровое поле
      menuContainer.style.display = 'none';
      gameContainer.style.display = 'block';

      // Запускаем игру через наше архитектурное ядро
      const game = new ArithmeticGame(60); // 60 секунд на игру
      game.init();
    });
  }
});
