import './assets/css/global.css';
import { NumberHousesGame } from './games/game-number-houses/index';

// Функция генерации 3D-сферы
function createBackgroundSphere(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const examples: string[] = [];
  for (let n = 2; n <= 10; n++) {
    for (let a = 1; a < n; a++) {
      examples.push(`${a}+${n - a}=${n}`);
    }
  }

  const shuffled = examples.sort(() => Math.random() - 0.5).slice(0, 60);

  container.innerHTML = '';
  
  shuffled.forEach((text, i) => {
    const el = document.createElement('div');
    el.className = 'bg-tag';
    el.textContent = text;
    
    const phi = Math.acos(-1 + (2 * i) / shuffled.length);
    const theta = Math.sqrt(shuffled.length * Math.PI) * phi;
    const radius = 350; // Чуть меньше для меню
    
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    
    const rotY = Math.atan2(x, z);
    const rotX = -Math.atan2(y, Math.sqrt(x * x + z * z));
    
    el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}rad) rotateX(${rotX}rad)`;
    el.style.opacity = `${0.1 + (z + radius) / (2 * radius) * 0.3}`;
    
    container.appendChild(el);
  });

  let angle = 0;
  const rotate = () => {
    angle += 0.0005; 
    container.style.transform = `rotateX(${angle * 0.3}rad) rotateY(${angle}rad)`;
    requestAnimationFrame(rotate);
  };
  rotate();
}

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  const gameContainer = document.getElementById('game-container');

  if (!menuContainer || !gameContainer) return; // Защита от null

  // Восстанавливаем тему для меню
  const savedTheme = localStorage.getItem('logikids_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Генерация падающих звезд для меню
  const starsContainer = document.getElementById('menu-stars');
  if (starsContainer) {
    for (let i = 0; i < 30; i++) {
      const star = document.createElement('div');
      star.className = 'menu-star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.animationDuration = `${3 + Math.random() * 4}s`;
      starsContainer.appendChild(star);
    }
  }

  // Генерация сферы в меню
  createBackgroundSphere('menu-bg-sphere');

  const returnToMenu = () => {
    gameContainer.style.display = 'none';
    gameContainer.innerHTML = '';
    menuContainer.style.display = 'flex';
  };

  const startGame = () => {
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';

    const game = new NumberHousesGame(0, returnToMenu, 10, false);
    game.init();
  };

  document.getElementById('start-houses-all')?.addEventListener('click', startGame);
});