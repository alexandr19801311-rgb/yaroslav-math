import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

// Интерфейсы для данных
interface HouseData {
  [key: number]: [number, number][];
}

interface HouseState {
  score: number;
  done: number[];
  filled: { [key: string]: { a: number, b: number } };
  picked: { num: number, idx: number, a: number, b: number } | null;
  trayOrder: { num: number, idx: number, a: number, b: number }[];
  sampleOn: boolean;
}

export class NumberHousesGame extends BaseGame {
  protected gameId = 'number-houses';

  private data: HouseData = {};
  private state: HouseState = {
    score: 0,
    done: [],
    filled: {},
    picked: null,
    trayOrder: [],
    sampleOn: false
  };

  // DOM-элементы
  private housesContainerEl!: HTMLElement;
  private trayBodyEl!: HTMLElement;
  private trayCountEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private doneCountEl!: HTMLElement;
  private totalCountEl!: HTMLElement;
  private progressFillEl!: HTMLElement;
  private overlayEl: HTMLElement | null = null;

  public init(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    // Инициализация данных (2-10)
    const allNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    allNumbers.forEach(n => {
      const list: [number, number][] = [];
      list.push([0, n]);
      for (let a = 1; a < n; a++) list.push([a, n - a]);
      list.push([n, 0]);
      this.data[n] = list;
    });

    container.innerHTML = `
      <div class="houses-game-wrapper">
        <div class="topbar">
          <button type="button" class="btn-exit" id="btn-exit" title="В меню">✖</button>
          <div class="title">🏠 ${t('houses.title')}</div>
          
          <div class="progress-container">
            <div class="progress-wrapper">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
              ${t('houses.collected')}: <span id="doneCount">0</span> / <span id="totalCount">9</span>
            </div>
          </div>

          <div class="score">⭐ <span id="score">0</span></div>
        </div>

        <div class="houses" id="houses"></div>

        <div class="tray-wrap">
          <div class="tray-header">
            <div class="left">
              <span>🗂️ ${t('houses.cards')}:</span>
              <span class="count" id="trayCount">0 / 0</span>
            </div>
          </div>
          <div class="tray-body" id="trayBody"></div>
        </div>
      </div>
    `;

    this.housesContainerEl = document.getElementById('houses')!;
    this.trayBodyEl = document.getElementById('trayBody')!;
    this.trayCountEl = document.getElementById('trayCount')!;
    this.scoreEl = document.getElementById('score')!;
    this.doneCountEl = document.getElementById('doneCount')!;
    this.totalCountEl = document.getElementById('totalCount')!;
    this.progressFillEl = document.getElementById('progressFill')!;

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());

    this.start();
  }

  protected onStart(): void {
    this.state = {
      score: 0,
      done: [],
      filled: {},
      picked: null,
      trayOrder: [],
      sampleOn: false
    };
    // В этой игре нет таймера, поэтому generateTask не нужен
  }

  // Обязательная заглушка
  protected generateTask(): void {}
  protected checkAnswer(_answer: unknown): boolean { return false; }

  // Основная отрисовка
  protected renderAll(): void {
    this.scoreEl.textContent = String(this.score);
    this.doneCountEl.textContent = String(this.state.done.length);
    this.totalCountEl.textContent = '9';
    
    this.updateProgressBar();
    this.renderHouses();
    this.renderTray();
  }

  private updateProgressBar(): void {
    const percent = (this.state.done.length / 9) * 100;
    this.progressFillEl.style.width = `${percent}%`;
  }

  private renderHouses(): void {
    this.housesContainerEl.innerHTML = '';
    const allNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];

    allNumbers.forEach(n => {
      const house = document.createElement('div');
      house.className = 'house';
      house.dataset.num = String(n);
      if (this.state.done.includes(n)) house.classList.add('done');

      house.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('house-title')) {
          this.highlightCardsForNumber(n);
        } else {
          this.onHouseClick(n, house);
        }
      });

      const title = document.createElement('div');
      title.className = 'house-title';
      title.textContent = t('houses.number') + ' ' + n;
      house.appendChild(title);

      const slotsContainer = document.createElement('div');
      slotsContainer.className = 'slots-container';

      this.data[n].forEach(([a, b], idx) => {
        const key = `${n}-${idx}`;
        const filled = this.state.filled[key];
        const slot = document.createElement('div');
        slot.className = 'slot-row';

        let formula = '';
        let bar = '';

        if (filled) {
          slot.classList.add('filled');
          formula = `<span class="num-blue">${filled.a}</span><span class="op-red">+</span><span class="num-blue">${filled.b}</span><span class="eq">=</span><span class="result">${n}</span>`;
          bar = this.renderVisualBar(filled.a, filled.b, n);
        } else if (this.state.sampleOn) {
          slot.classList.add('ghost');
          formula = `<span class="num-blue">${a}</span><span class="op-red">+</span><span class="num-blue">${b}</span><span class="eq">=</span><span class="result">${n}</span>`;
          bar = this.renderVisualBar(a, b, n);
        } else {
          formula = `<span class="num-blue">_</span><span class="op-red">+</span><span class="num-blue">_</span><span class="eq">=</span><span class="result">${n}</span>`;
          bar = this.renderVisualBar(0, 0, n);
        }

        slot.innerHTML = `<div class="formula">${formula}</div>${bar}`;
        slotsContainer.appendChild(slot);
      });

      house.appendChild(slotsContainer);
      this.housesContainerEl.appendChild(house);
    });
  }

  private renderTray(): void {
    this.trayBodyEl.innerHTML = '';
    
    // Собираем все незаполненные карточки
    const availableCards: { num: number, idx: number, a: number, b: number }[] = [];
    [2,3,4,5,6,7,8,9,10].forEach(n => {
      this.data[n].forEach(([a, b], idx) => {
        if (!this.state.filled[`${n}-${idx}`]) {
          availableCards.push({ num: n, idx, a, b });
        }
      });
    });

    const totalCards = availableCards.length + Object.keys(this.state.filled).length;
    this.trayCountEl.textContent = `${availableCards.length} / ${totalCards}`;

    if (availableCards.length === 0) {
      this.trayBodyEl.innerHTML = `<div class="tray-empty">${t('houses.allPlaced')} ✅</div>`;
      return;
    }

    // Перемешиваем для случайного порядка
    availableCards.sort(() => Math.random() - 0.5);

    availableCards.forEach(({ num, idx, a, b }) => {
      const card = document.createElement('button');
      card.className = 'card';
      if (this.state.picked && this.state.picked.num === num && this.state.picked.idx === idx) {
        card.classList.add('picked');
      }
      
      const bar = this.renderVisualBar(a, b, num);
      card.innerHTML = `<div><span>${a}</span><span class="op">+</span><span>${b}</span></div>${bar}`;
      
      card.addEventListener('click', () => this.onCardClick(num, idx, a, b));
      this.trayBodyEl.appendChild(card);
    });
  }

  private onCardClick(num: number, idx: number, a: number, b: number): void {
    if (this.state.done.includes(num)) return;
    if (this.state.filled[`${num}-${idx}`]) return;

    if (this.state.picked && this.state.picked.num === num && this.state.picked.idx === idx) {
      this.state.picked = null;
    } else {
      this.state.picked = { num, idx, a, b };
      this.soundManager.playClick();
    }
    this.renderTray();
  }

  private onHouseClick(n: number, houseEl: HTMLElement): void {
    if (!this.state.picked) return;
    if (this.state.done.includes(n)) return;

    const { a, b, num } = this.state.picked;

    if (num !== n || a + b !== n) {
      this.soundManager.playWrong();
      houseEl.classList.add('flash-bad');
      setTimeout(() => houseEl.classList.remove('flash-bad'), 500);
      return;
    }

    const targetIdx = this.data[n].findIndex(([expA, expB], i) => {
      const isFilled = !!this.state.filled[`${n}-${i}`];
      return !isFilled && expA === a && expB === b;
    });

    if (targetIdx === -1) {
      this.soundManager.playWrong();
      houseEl.classList.add('flash-bad');
      setTimeout(() => houseEl.classList.remove('flash-bad'), 500);
      return;
    }

    this.state.filled[`${n}-${targetIdx}`] = { a, b };
    this.state.score++;
    this.soundManager.playCorrect();
    this.state.picked = null;

    this.renderAll();

    // Анимация слота
    const targetSlot = document.querySelector(`.house[data-num="${n}"] .slot-row:nth-child(${targetIdx + 1})`);
    if (targetSlot) {
      targetSlot.classList.add('pop-anim');
      setTimeout(() => targetSlot.classList.remove('pop-anim'), 400);
    }

    // Проверка на завершение домика
    const done = this.data[n].every((_, i) => this.state.filled[`${n}-${i}`]);
    if (done && !this.state.done.includes(n)) {
      this.state.done.push(n);
      this.soundManager.playWin();
      
      setTimeout(() => {
        if (this.state.done.length === 9) this.winGame();
        else this.renderAll();
      }, 600);
    }
  }

  private highlightCardsForNumber(n: number): void {
    if (this.state.done.includes(n)) return;
    this.soundManager.playClick();
    
    const cards = this.trayBodyEl.querySelectorAll('.card');
    cards.forEach(card => {
      // Простая подсветка всех карточек, которые относятся к числу n
      const text = card.textContent || '';
      if (text.includes('+')) {
        // Упрощенная логика: если карточка была создана для этого числа, мы бы знали.
        // Но в нашей структуре лоток перемешан, поэтому подсветим все подходящие по сумме.
        const parts = text.split('+');
        if (parts.length === 2) {
          const sum = parseInt(parts[0]) + parseInt(parts[1].replace(/[^0-9]/g, ''));
          if (sum === n) card.classList.add('hint-highlight');
        }
      }
    });
    
    setTimeout(() => {
      cards.forEach(c => c.classList.remove('hint-highlight'));
    }, 2000);
  }

  private renderVisualBar(a: number, b: number, total: number): string {
    if (total === 0) return '';
    const percentA = (a / total) * 100;
    const percentB = (b / total) * 100;
    return `
      <div class="visual-bar-container">
        <div class="visual-bar-a" style="width: ${percentA}%;"></div>
        <div class="visual-bar-b" style="width: ${percentB}%;"></div>
      </div>
    `;
  }

  private winGame(): void {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    this.showGameOverScreen(true, { correct: this.state.score, wrong: 0 });
  }

  protected showGameOverScreen(isNewRecord: boolean, stats: { correct: number, wrong: number }): void {
    if (this.overlayEl) this.overlayEl.remove();

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.innerHTML = `
      <div class="game-overlay__card">
        <div class="game-overlay__emoji">🏆</div>
        <h2 class="game-overlay__title">${t('houses.winTitle')}</h2>
        <p class="game-overlay__score">${t('houses.winDesc')}</p>
        
        <div class="game-overlay__stats">
          <div class="stat-box">
            <div class="stat-value">${this.state.score}</div>
            <div class="stat-label">${t('game.score')}</div>
          </div>
        </div>

        <div class="game-overlay__actions">
          <button type="button" class="game-overlay__btn game-overlay__btn--primary" id="restart-btn">${t('game.playAgain')}</button>
          <button type="button" class="game-overlay__btn game-overlay__btn--secondary" id="menu-btn">${t('game.menu')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    overlay.querySelector('#restart-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.state = { score: 0, done: [], filled: {}, picked: null, trayOrder: [], sampleOn: false };
      this.score = 0;
      this.renderAll();
    });

    overlay.querySelector('#menu-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.exitToMenu();
    });
  }
}