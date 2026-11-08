// ============================================================
// ROUTER.JS — Навигация между экранами платформы
// ============================================================

import { THEMES } from './tasks.js';

let currentCleanup = null;

export async function navigate(hash) {
  if (currentCleanup) {
    try { currentCleanup(); } catch(e) {}
    currentCleanup = null;
  }

  const path = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const route = path[0] || '';

  const container = document.getElementById('app');
  container.innerHTML = '';

  if (route === 'game') {
    const gameId = path[1];
    
    if (gameId === 'composition') {
      const { mount } = await import('../../games/composition/game.js');
      const result = await mount(container);
      if (result && result.cleanup) currentCleanup = result.cleanup;
    } 
    else if (gameId === 'subtraction') {
      // Загружаем игру «Вычитание»
      const { mount } = await import('../../games/subtraction/game.js');
      const result = await mount(container);
      if (result && result.cleanup) currentCleanup = result.cleanup;
    } 
    else {
      // Неизвестная игра — редирект в меню
      renderMenu(container);
    }
  } else if (route === 'parents') {
    container.innerHTML = `
      <div class="menu-screen">
        <h1 class="menu-title">📊 Кабинет родителя</h1>
        <p class="menu-subtitle">Скоро здесь будет статистика</p>
        <a href="#/" class="menu-back">← В меню</a>
      </div>
    `;
  } else {
    renderMenu(container);
  }
}

function renderMenu(container) {
  const themeCards = Object.values(THEMES).map(theme => `
    <a href="#/game/${theme.id}" class="theme-card">
      <div class="theme-emoji">${theme.emoji}</div>
      <div class="theme-title">${theme.title}</div>
      <div class="theme-desc">${theme.description}</div>
      <div class="theme-age">${theme.ageRange}</div>
    </a>
  `).join('');

  container.innerHTML = `
    <div class="menu-screen">
      <h1 class="menu-title">🧮 Математика</h1>
      <p class="menu-subtitle">Выбери тему для тренировки</p>
      <div class="themes-grid">
        ${themeCards}
      </div>
      <a href="#/parents" class="menu-parents">📊 Кабинет родителя</a>
    </div>
  `;
}

export function initRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#/');
}
