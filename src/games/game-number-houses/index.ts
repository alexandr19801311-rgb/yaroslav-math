import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

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
          
          <div class="lives-indicator" id="lives-indicator"></div>

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
    this.wrongAnswers = 0;

    const initialOrder: { num: number, idx: number, a: number, b: number }[] = [];
    [2,3,4,5,6,7,8,9,10].forEach(n => {
      this.data[n].forEach(([a, b], idx) => {
        initialOrder.push({ num: n, idx, a, b });
      });
    });
    initialOrder.sort(() => Math.random() - 0.5);
    this.state.trayOrder = initialOrder;

    this.renderAll();
  }

  protected generateTask(): void {}
  protected checkAnswer(_answer: unknown): boolean { return false; }

  protected renderAll(): void {
    this.scoreEl.textContent = String(this.score);
    this.doneCountEl.textContent = String(this.state.done.length);
    this.totalCountEl.textContent = '9';
    
    this.updateLivesUI();
    this.updateProgressBar();
    this.renderHouses();
    this.renderTray();
  }

  private updateLivesUI(): void {
    const container = document.getElementById('lives-indicator');
    if (!container) return;
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += i < 3 - this.wrongAnswers ? '❤️' : '🖤';
    }
    container.innerHTML = html;
  }

  private updateProgressBar(): void {
    const percent = (this.state.done.length / 9) * 100;
    this.progressFillEl.style.width = `${percent}%`;
  }

  private renderHouses(): void {
    this.housesContainerEl.innerHTML = '';
    const allNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const MAX_NUMBER = 10;

    allNumbers.forEach(n => {
      const house = document.createElement('div');
      house.className = 'house';
      house.dataset.num = String(n);
      if (this.state.done.includes(n)) house.classList.add('done');

      house.addEventListener('click', () => this.onHouseClick(n, house));

      const title = document.createElement('div');
      title.className = 'house-title';
      
      let segmentsHtml = '';
      for (let i = 0; i < MAX_NUMBER; i++) {
        if (i < n) {
          segmentsHtml += '<div class="house-segment house-segment--filled"></div>';
        } else {
          segmentsHtml += '<div class="house-segment"></div>';
        }
      }
      
      title.innerHTML = `
        <div class="house-badge">${n}</div>
        <div class="house-bar">
          <div class="house-bar-fill" style="width: ${(n / MAX_NUMBER) * 100}%; background: var(--house-color);"></div>
          <div class="house-segments-overlay">
            ${segmentsHtml}
          </div>
        </div>
      `;
      house.appendChild(title);

      const slotsContainer = document.createElement('div');
      slotsContainer.className = 'slots-container';

      this.data[n].forEach((_, idx) => {
        const key = `${n}-${idx}`;
        const filled = this.state.filled[key];
        const slot = document.createElement('div');
        slot.className = 'slot-row';

        if (filled) {
          slot.classList.add('filled');
          const percentA = (filled.a / n) * 100;
          const percentB = (filled.b / n) * 100;
          slot.innerHTML = `
            <div class="block-a" style="width: ${percentA}%">${filled.a}</div>
            <div class="block-b" style="width: ${percentB}%">${filled.b}</div>
          `;
        } else {
          slot.innerHTML = `<div class="empty-slot"><div class="ruler-bg"></div></div>`;
        }

        slotsContainer.appendChild(slot);
      });

      house.appendChild(slotsContainer);
      this.housesContainerEl.appendChild(house);
    });
  }

  private renderTray(): void {
    this.trayBodyEl.innerHTML = '';
    
    const availableCards = this.state.trayOrder.filter(card => {
      return !this.state.filled[`${card.num}-${card.idx}`];
    });

    const totalCards = Object.keys(this.state.filled).length + availableCards.length;
    this.trayCountEl.textContent = `${availableCards.length} / ${totalCards}`;

    if (availableCards.length === 0) {
      this.trayBodyEl.innerHTML = `<div class="tray-empty">${t('houses.allPlaced')} ✅</div>`;
      return;
    }

    availableCards.forEach(({ num, idx, a, b }) => {
      const card = document.createElement('button');
      card.className = 'card';
      
      // Базовый размер: 10 = 200px, значит 1 = 20px
      const baseUnit = 20; 
      const totalWidth = num * baseUnit;
      card.style.width = `${totalWidth}px`;
      
      if (this.state.picked && this.state.picked.num === num && this.state.picked.idx === idx) {
        card.classList.add('picked');
      }
      
      // Создаем блоки с точной шириной в пикселях
      let html = '';
      
      if (a > 0) {
        let segs = '';
        for (let i = 0; i < a; i++) {
          segs += '<div class="card-segment" style="width: ' + baseUnit + 'px;"></div>';
        }
        html += `<div class="block-a" style="width: ${a * baseUnit}px;">${segs}<span class="card-number">${a}</span></div>`;
      }
      
      if (b > 0) {
        let segs = '';
        for (let i = 0; i < b; i++) {
          segs += '<div class="card-segment" style="width: ' + baseUnit + 'px;"></div>';
        }
        html += `<div class="block-b" style="width: ${b * baseUnit}px;">${segs}<span class="card-number">${b}</span></div>`;
      }

      card.innerHTML = html;
      
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
      
      this.wrongAnswers++;
      this.updateLivesUI();

      if (this.wrongAnswers >= 3) {
        this.endGameWithLoss();
      }
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
      
      this.wrongAnswers++;
      this.updateLivesUI();

      if (this.wrongAnswers >= 3) {
        this.endGameWithLoss();
      }
      return;
    }

    this.state.filled[`${n}-${targetIdx}`] = { a, b };
    this.state.score++;
    this.soundManager.playCorrect();
    this.state.picked = null;

    this.renderAll();

    const targetSlot = document.querySelector(`.house[data-num="${n}"] .slot-row:nth-child(${targetIdx + 1})`);
    if (targetSlot) {
      targetSlot.classList.add('pop-anim');
      setTimeout(() => targetSlot.classList.remove('pop-anim'), 400);
    }

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

  private winGame(): void {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    this.showGameOverScreen(true, { correct: this.state.score, wrong: this.wrongAnswers });
  }

  private endGameWithLoss(): void {
    setTimeout(() => {
      this.showGameOverScreen(false, { correct: this.state.score, wrong: this.wrongAnswers });
    }, 800);
  }

  protected showGameOverScreen(isWin: boolean, stats: { correct: number, wrong: number }): void {
    if (this.overlayEl) this.overlayEl.remove();

    const title = isWin ? t('houses.winTitle') : 'Игра окончена!';
    const emoji = isWin ? '🏆' : '💔';

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.innerHTML = `
      <div class="game-overlay__card">
        <div class="game-overlay__emoji">${emoji}</div>
        <h2 class="game-overlay__title">${title}</h2>
        <p class="game-overlay__score">${isWin ? t('houses.winDesc') : 'Ты допустил 3 ошибки.'}</p>
        
        <div class="game-overlay__stats">
          <div class="stat-box">
            <div class="stat-value">${stats.correct}</div>
            <div class="stat-label">${t('game.score')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #e53e3e;">${stats.wrong}</div>
            <div class="stat-label">Ошибки</div>
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
      this.start();
    });

    overlay.querySelector('#menu-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.exitToMenu();
    });
  }
}