// ============================================================
// GAME.JS — Игра «Состав чисел» (модуль)
// ============================================================

import { THEMES } from '../../assets/js/tasks.js';
import { 
  $, shuffle, sndPlace, sndBad, sndHouseDone, sndWin, sndHint,
  saveProgress, loadProgress, clearProgress, showSavedBadge, showOverlay, hideOverlay, fireConfetti
} from '../../assets/js/core.js';

// После импортов, перед const THEME:
const styleId = 'composition-game-style';
if (!document.getElementById(styleId)) {
  const link = document.createElement('link');
  link.id = styleId;
  link.rel = 'stylesheet';
  link.href = 'games/composition/game.css';
  document.head.appendChild(link);
}

const THEME = THEMES.composition;
const STORAGE_KEY = 'composition_progress_v1';

// ===== Состояние игры =====
let state = null;
let currentLevel = null;
let NUMBERS = [];
let data = {};

export async function mount(container) {
  // Загружаем уровень из hash (#/game/composition/easy)
  const path = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const levelId = path[2] || 'all';
  currentLevel = THEME.levels.find(l => l.id === levelId) || THEME.levels[THEME.levels.length - 1];
  NUMBERS = currentLevel.numbers;

  // Генерируем данные для чисел
  data = {};
  NUMBERS.forEach(n => {
    data[n] = THEME.generateVariants(n);
  });

  // Загружаем прогресс
  const saved = loadProgress(STORAGE_KEY, null);
  state = saved || {
    score: 0,
    done: [],
    filled: {},
    picked: null,
    trayOrder: {},
    sampleOn: false
  };
  state.picked = null;
  state.sampleOn = false;

  // Рендерим экран
  container.innerHTML = `
    <div class="game-screen">
      <div class="topbar">
        <a href="#/" class="back-btn">←</a>
        <div class="title">🏠 ${THEME.title}</div>
        <div class="progress-text">Собрано: <span id="doneCount">0</span> / ${NUMBERS.length}</div>
        <div class="score">⭐ <span id="score">0</span></div>
      </div>

      <div class="houses" id="houses"></div>

      <div class="tray-wrap">
        <div class="tray-header">
          <div class="left">
            <span>🗂️ Карточки:</span>
            <span class="count" id="trayCount">0 / 0</span>
            <div class="progress-wrap">
              <div class="progress-bar" id="progressBar"></div>
            </div>
          </div>
        </div>
        <div class="tray-body" id="trayBody"></div>
      </div>

      <div class="controls">
        <button class="btn" id="sampleBtn">👁️ Показать образец</button>
        <button class="btn ghost" id="resetBtn">🔄 Начать заново</button>
      </div>
    </div>

    <div class="overlay" id="overlay">
      <h2 id="overTitle">🎉 Победа!</h2>
      <p id="overText">Ты собрал все домики!</p>
      <div class="big">⭐ <span id="finalScore">0</span></div>
      <button class="btn" id="playAgain">Играть снова</button>
    </div>

    <div class="saved-badge" id="savedBadge">💾 Прогресс сохранён</div>
  `;

  // Инициализация
  renderAll();
  attachHandlers();

  // Cleanup функция
  return {
    cleanup: () => {
      state.picked = null;
    }
  };
}

// ===== Отрисовка одного домика =====
function renderSingleHouse(n, container) {
  const doneSet = new Set(state.done);
  const house = document.createElement('div');
  house.className = 'house';
  house.dataset.num = n;
  if (doneSet.has(n)) house.classList.add('done');

  const newHouse = house.cloneNode(false);
  newHouse.addEventListener('click', (e) => {
    if (e.target.classList.contains('house-title')) {
      highlightCardsForNumber(n);
    } else {
      onHouseClick(n, newHouse);
    }
  });

  const title = document.createElement('div');
  title.className = 'house-title';
  title.innerHTML = window.innerWidth < 1100 ? n : `ЧИСЛО ${n}`;
  newHouse.appendChild(title);

  const slotsContainer = document.createElement('div');
  slotsContainer.className = 'slots-container';

  data[n].forEach(([a, b], idx) => {
    const key = `${n}-${idx}`;
    const slot = document.createElement('div');
    slot.className = 'slot-row';

    const filled = state.filled[key];
    let content = '';
    if (filled) {
      slot.classList.add('filled');
      content = `<span class="num-blue">${filled.a}</span><span class="op-red">+</span><span class="num-blue">${filled.b}</span><span class="eq">=</span><span class="result">${n}</span>`;
    } else if (state.sampleOn) {
      slot.classList.add('ghost');
      content = `<span class="num-blue">${a}</span><span class="op-red">+</span><span class="num-blue">${b}</span><span class="eq">=</span><span class="result">${n}</span>`;
    } else {
      content = `<span class="num-blue">_</span><span class="op-red">+</span><span class="num-blue">_</span><span class="eq">=</span><span class="result">${n}</span>`;
    }

    slot.innerHTML = content;
    slotsContainer.appendChild(slot);
  });

  newHouse.appendChild(slotsContainer);

  const oldHouse = container.querySelector(`.house[data-num="${n}"]`);
  if (oldHouse) container.replaceChild(newHouse, oldHouse);
  else container.appendChild(newHouse);
}

// ===== Отрисовка всех домиков =====
function renderHouses() {
  const container = $('houses');
  if (!container) return;
  if (container.children.length === 0) {
    container.innerHTML = '';
    NUMBERS.forEach(n => renderSingleHouse(n, container));
  } else {
    NUMBERS.forEach(n => {
      const house = container.querySelector(`.house[data-num="${n}"]`);
      if (house) {
        if (state.done.includes(n)) house.classList.add('done');
        else house.classList.remove('done');
      }
    });
  }
}

// ===== Отрисовка банка карточек =====
function renderTray() {
  const body = $('trayBody');
  if (!body) return;
  body.innerHTML = '';

  const TOTAL_CARDS = NUMBERS.reduce((s, n) => s + data[n].length, 0);
  let totalUsed = 0;
  const allCards = [];

  NUMBERS.forEach(n => {
    data[n].forEach(([a, b], idx) => {
      if (!state.filled[`${n}-${idx}`]) {
        allCards.push({ n, idx, a, b });
      } else {
        totalUsed++;
      }
    });
  });

  const percent = Math.round((totalUsed / TOTAL_CARDS) * 100);
  const pb = $('progressBar');
  if (pb) pb.style.width = percent + '%';

  if (!state.trayOrder || Object.keys(state.trayOrder).length === 0) {
    state.trayOrder = shuffle(allCards);
  }

  const currentTray = state.trayOrder.filter(c => allCards.some(ac => ac.n === c.n && ac.idx === c.idx));
  const missing = allCards.filter(c => !currentTray.some(tc => tc.n === c.n && tc.idx === c.idx));
  state.trayOrder = [...currentTray, ...missing];

  state.trayOrder.forEach(({ n, idx, a, b }) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.dataset.num = n;
    card.dataset.idx = idx;
    card.innerHTML = `<span>${a}</span><span class="op">+</span><span>${b}</span>`;
    if (state.picked && state.picked.num === n && state.picked.idx === idx) {
      card.classList.add('picked');
    }
    card.addEventListener('click', () => onCardClick(n, idx, a, b));
    body.appendChild(card);
  });

  if (body.children.length === 0) {
    body.innerHTML = '<div class="tray-empty">Все карточки расставлены ✅</div>';
  }
  $('trayCount').textContent = `${TOTAL_CARDS - totalUsed} / ${TOTAL_CARDS}`;
}

// ===== Подсветка карточек =====
function highlightCardsForNumber(n) {
  if (state.done.includes(n)) return;
  sndHint();

  document.querySelectorAll('.card').forEach(card => card.classList.remove('hint-highlight'));

  document.querySelectorAll('.card').forEach(card => {
    if (+card.dataset.num === n) card.classList.add('hint-highlight');
  });

  clearTimeout(highlightCardsForNumber.timer);
  highlightCardsForNumber.timer = setTimeout(() => {
    document.querySelectorAll('.hint-highlight').forEach(c => c.classList.remove('hint-highlight'));
  }, 2000);
}

// ===== Клик по карточке =====
function onCardClick(n, idx, a, b) {
  if (state.done.includes(n)) return;
  if (state.filled[`${n}-${idx}`]) return;
  if (state.picked && state.picked.num === n && state.picked.idx === idx) {
    state.picked = null;
  } else {
    state.picked = { num: n, idx, a, b };
  }
  document.querySelectorAll('.hint-highlight').forEach(c => c.classList.remove('hint-highlight'));
  renderTray();
  document.querySelectorAll('.card').forEach(card => {
    if (state.picked && +card.dataset.num === state.picked.num && +card.dataset.idx === state.picked.idx) {
      card.classList.add('picked');
    } else {
      card.classList.remove('picked');
    }
  });
}

// ===== Клик по домику =====
function onHouseClick(n, houseEl) {
  if (!state.picked) return;
  if (state.done.includes(n)) return;

  const { a, b, num } = state.picked;

  if (num !== n || a + b !== n) {
    sndBad();
    houseEl.classList.add('flash-bad');
    setTimeout(() => houseEl.classList.remove('flash-bad'), 500);
    return;
  }

  const targetIdx = data[n].findIndex(([expA, expB], i) => {
    return !state.filled[`${n}-${i}`] && expA === a && expB === b;
  });

  if (targetIdx === -1) {
    sndBad();
    houseEl.classList.add('flash-bad');
    setTimeout(() => houseEl.classList.remove('flash-bad'), 500);
    return;
  }

  state.filled[`${n}-${targetIdx}`] = { a, b };
  state.score++;
  sndPlace();
  state.picked = null;

  $('score').textContent = state.score;
  $('doneCount').textContent = state.done.length;

  renderSingleHouse(n, $('houses'));
  renderTray();
  saveCurrentProgress();

  const targetSlot = document.querySelector(`.house[data-num="${n}"] .slot-row:nth-child(${targetIdx + 1})`);
  if (targetSlot) {
    targetSlot.classList.add('pop-anim');
    setTimeout(() => targetSlot.classList.remove('pop-anim'), 400);
  }

  const done = data[n].every((_, i) => state.filled[`${n}-${i}`]);
  if (done && !state.done.includes(n)) {
    state.done.push(n);
    sndHouseDone();
    $('doneCount').textContent = state.done.length;

    setTimeout(() => {
      if (state.done.length === NUMBERS.length) {
        winGame();
      } else {
        saveCurrentProgress();
        renderSingleHouse(n, $('houses'));
      }
    }, 600);
  }
}

// ===== Сохранение =====
function saveCurrentProgress() {
  saveProgress(STORAGE_KEY, {
    score: state.score,
    done: [...state.done],
    filled: state.filled,
    trayOrder: state.trayOrder
  });
  showSavedBadge();
}

// ===== Победа =====
function winGame() {
  sndWin();
  showOverlay('🎉 Победа!', `Ты собрал все ${NUMBERS.length} домиков!`, state.score);
  fireConfetti();
  clearProgress(STORAGE_KEY);
}

// ===== Общая отрисовка =====
function renderAll() {
  const scoreEl = $('score');
  const doneEl = $('doneCount');
  if (scoreEl) scoreEl.textContent = state.score;
  if (doneEl) doneEl.textContent = state.done.length;
  renderHouses();
  renderTray();
  const sb = $('sampleBtn');
  if (sb) {
    sb.textContent = state.sampleOn ? '🙈 Скрыть образец' : '👁️ Показать образец';
    sb.classList.toggle('active', state.sampleOn);
  }
}

function toggleSample() {
  state.sampleOn = !state.sampleOn;
  renderHouses();
  const sb = $('sampleBtn');
  if (sb) {
    sb.textContent = state.sampleOn ? '🙈 Скрыть образец' : '👁️ Показать образец';
    sb.classList.toggle('active', state.sampleOn);
  }
}

function resetGame() {
  state = {
    score: 0,
    done: [],
    filled: {},
    picked: null,
    trayOrder: {},
    sampleOn: false
  };
  clearProgress(STORAGE_KEY);
  hideOverlay();
  const houses = $('houses');
  if (houses) houses.innerHTML = '';
  renderAll();
}

// ===== Обработчики =====
function attachHandlers() {
  const sb = $('sampleBtn');
  if (sb) sb.addEventListener('click', toggleSample);
  const rb = $('resetBtn');
  if (rb) rb.addEventListener('click', () => {
    if (confirm('Начать заново? Все успехи сбросятся.')) resetGame();
  });
  const pa = $('playAgain');
  if (pa) pa.addEventListener('click', resetGame);
}
