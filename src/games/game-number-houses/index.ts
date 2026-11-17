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
  picked: { num: number, idx: number, a: number, b: number, el: HTMLElement } | null;
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

  private hintsLeft: number = 3;
  private isSecondChance: boolean = false;
  private isSoundOn: boolean = true;
  private selectedVoiceURI: string | null = null;
  private isDarkTheme: boolean = false;

  private housesContainerEl!: HTMLElement;
  private trayBodyEl!: HTMLElement;
  private trayCountEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private doneCountEl!: HTMLElement;
  private totalCountEl!: HTMLElement;
  private progressFillEl!: HTMLElement;
  private bgSphereEl!: HTMLElement;

  public init(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const savedTheme = localStorage.getItem('logikids_theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }

    const allNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    allNumbers.forEach(n => {
      const list: [number, number][] = [];
      list.push([0, n]);
      for (let a = 1; a < n; a++) list.push([a, n - a]);
      list.push([n, 0]);
      this.data[n] = list;
    });

    container.innerHTML = `
      <div class="bg-sphere-container" id="bg-sphere"></div>
      
      <div class="houses-game-wrapper">
        <div class="topbar">
          <button type="button" class="btn-exit" id="btn-exit" title="В меню">✖</button>
          
          <div class="lives-indicator" id="lives-indicator"></div>

          <div class="progress-container">
            <div class="progress-wrapper">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
              ${t('houses.collected')}: <span id="doneCount">0</span> / <span id="totalCount">63</span>
            </div>
          </div>

          <button type="button" class="btn-theme" id="btn-theme" title="Сменить тему">
            ${this.isDarkTheme ? '☀️' : '🌙'}
          </button>
          <button type="button" class="btn-sound" id="btn-sound" title="Звук">🔊</button>
          <button type="button" class="btn-hint" id="btn-hint" title="Подсказка">🔍 <span id="hint-count">3</span></button>
          <div class="score">⭐ <span id="score">0</span></div>
        </div>

        <div class="houses" id="houses"></div>

        <div class="tray-wrap">
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
    this.bgSphereEl = document.getElementById('bg-sphere')!;

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());
    document.getElementById('btn-hint')?.addEventListener('click', () => this.useHint());
    
    document.getElementById('btn-theme')?.addEventListener('click', () => {
      this.isDarkTheme = !this.isDarkTheme;
      document.body.classList.toggle('dark-theme', this.isDarkTheme);
      localStorage.setItem('logikids_theme', this.isDarkTheme ? 'dark' : 'light');
      
      const btn = document.getElementById('btn-theme');
      if (btn) btn.textContent = this.isDarkTheme ? '☀️' : '🌙';
      
      this.soundManager.playClick();
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn?.addEventListener('click', () => {
      this.isSoundOn = !this.isSoundOn;
      soundBtn.textContent = this.isSoundOn ? '🔊' : '🔇';
      if (!this.isSoundOn) window.speechSynthesis.cancel();
    });

    const savedVoice = localStorage.getItem('logikids_voice_uri');
    if (savedVoice) this.selectedVoiceURI = savedVoice;

    this.createBackgroundSphere();
    this.start();
  }

  private createBackgroundSphere(): void {
    const examples: string[] = [];
    for (let n = 2; n <= 10; n++) {
      for (let a = 1; a < n; a++) {
        examples.push(`${a}+${n - a}=${n}`);
      }
    }

    const shuffled = examples.sort(() => Math.random() - 0.5).slice(0, 60);

    this.bgSphereEl.innerHTML = '';
    
    shuffled.forEach((text, i) => {
      const el = document.createElement('div');
      el.className = 'bg-tag';
      el.textContent = text;
      
      const phi = Math.acos(-1 + (2 * i) / shuffled.length);
      const theta = Math.sqrt(shuffled.length * Math.PI) * phi;
      const radius = 450;
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      const rotY = Math.atan2(x, z);
      const rotX = -Math.atan2(y, Math.sqrt(x * x + z * z));
      
      el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}rad) rotateX(${rotX}rad)`;
      el.style.opacity = `${0.1 + (z + radius) / (2 * radius) * 0.3}`;
      
      this.bgSphereEl.appendChild(el);
    });

    let angle = 0;
    const rotate = () => {
      angle += 0.0005; 
      this.bgSphereEl.style.transform = `rotateX(${angle * 0.3}rad) rotateY(${angle}rad)`;
      requestAnimationFrame(rotate);
    };
    rotate();
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
    this.hintsLeft = 3;
    this.isSecondChance = false;
    
    this.updateHintUI();
    this.updateLivesUI();

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
    
    const totalCards = 63;
    const filledCards = Object.keys(this.state.filled).length;
    
    this.doneCountEl.textContent = String(filledCards);
    this.totalCountEl.textContent = String(totalCards);
    
    this.updateLivesUI();
    this.updateProgressBar(filledCards, totalCards);
    this.renderHouses();
    this.renderTray();
  }

  private updateHintUI(): void {
    const countEl = document.getElementById('hint-count');
    const btnEl = document.getElementById('btn-hint');
    if (!countEl || !btnEl) return;

    if (this.isSecondChance || this.hintsLeft <= 0) {
      btnEl.setAttribute('disabled', 'true');
      btnEl.classList.add('btn-hint--disabled');
      btnEl.style.display = 'none';
    } else {
      btnEl.removeAttribute('disabled');
      btnEl.classList.remove('btn-hint--disabled');
      btnEl.style.display = 'flex';
      countEl.textContent = String(this.hintsLeft);
    }
  }

  private updateLivesUI(): void {
    const container = document.getElementById('lives-indicator');
    if (!container) return;
    
    if (this.isSecondChance) {
      container.innerHTML = '❤️';
      container.style.display = 'flex';
      return;
    }

    container.style.display = 'flex';
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += i < 3 - this.wrongAnswers ? '❤️' : '🖤';
    }
    container.innerHTML = html;
  }

  private updateProgressBar(current: number, total: number): void {
    const percent = (current / total) * 100;
    requestAnimationFrame(() => {
      this.progressFillEl.style.width = `${percent}%`;
    });
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
        slot.dataset.slotId = key;

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

    if (availableCards.length === 0) {
      this.trayBodyEl.innerHTML = `<div class="tray-empty">${t('houses.allPlaced')} ✅</div>`;
      return;
    }

    availableCards.forEach(({ num, idx, a, b }) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.dataset.cardId = `${num}-${idx}`;
      
      const randomRotate = (Math.random() - 0.5) * 4;
      const randomTranslateY = (Math.random() - 0.5) * 4;
      card.style.transform = `rotate(${randomRotate}deg) translateY(${randomTranslateY}px)`;

      if (this.state.picked && this.state.picked.num === num && this.state.picked.idx === idx) {
        card.classList.add('picked');
        card.style.transform = 'translateY(-4px) scale(1.02)';
      }
      
      const baseUnit = 20; 
      const totalWidth = num * baseUnit;
      card.style.width = `${totalWidth}px`;
      
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
      
      card.addEventListener('click', () => this.onCardClick(num, idx, a, b, card));
      this.trayBodyEl.appendChild(card);
    });
  }

  private onCardClick(num: number, idx: number, a: number, b: number, cardEl: HTMLElement): void {
    if (this.state.done.includes(num)) return;
    if (this.state.filled[`${num}-${idx}`]) return;

    this.clearHintHighlight();

    if (this.state.picked && this.state.picked.el) {
      this.state.picked.el.classList.remove('picked');
      const oldRotate = (Math.random() - 0.5) * 4;
      this.state.picked.el.style.transform = `rotate(${oldRotate}deg)`;
      this.clearValidHighlights();
    }

    if (this.state.picked && this.state.picked.num === num && this.state.picked.idx === idx) {
      this.state.picked = null;
    } else {
      this.state.picked = { num, idx, a, b, el: cardEl };
      cardEl.classList.add('picked');
      cardEl.style.transform = 'translateY(-4px) scale(1.02)';
      
      this.speakExpression(a, b);
      this.createParticles(cardEl);
      
      this.soundManager.playClick();
    }
  }

  private createParticles(cardEl: HTMLElement): void {
    const rect = cardEl.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 10,
      spread: 30,
      origin: { x, y },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
      disableForReducedMotion: true,
      zIndex: 999
    });
  }

  private highlightValidHouses(num: number): void {
    const houses = this.housesContainerEl.querySelectorAll('.house');
    houses.forEach(h => {
      const houseEl = h as HTMLElement;
      const houseNum = parseInt(houseEl.dataset.num || '0');
      if (houseNum === num && !this.state.done.includes(num)) {
        houseEl.classList.add('valid-target');
      }
    });
  }

  private clearValidHighlights(): void {
    const houses = this.housesContainerEl.querySelectorAll('.valid-target');
    houses.forEach(h => h.classList.remove('valid-target'));
  }

  private speakExpression(a: number, b: number): void {
    if (!this.isSoundOn || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const text = `${a} плюс ${b}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    
    if (this.selectedVoiceURI) {
      const savedVoice = voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (savedVoice) {
        utterance.voice = savedVoice;
        window.speechSynthesis.speak(utterance);
        return;
      }
    }

    const femaleVoice = voices.find(v => 
      v.lang.includes('ru') && (
        v.name.includes('Milena') || 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman')
      )
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
      const ruVoice = voices.find(v => v.lang.includes('ru'));
      if (ruVoice) utterance.voice = ruVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  private onHouseClick(n: number, houseEl: HTMLElement): void {
    if (!this.state.picked) return;
    if (this.state.done.includes(n)) return;

    const { a, b, num, el: cardEl } = this.state.picked;

    if (num !== n || a + b !== n) {
      this.soundManager.playWrong();
      houseEl.classList.add('flash-bad');
      setTimeout(() => houseEl.classList.remove('flash-bad'), 500);
      
      if (this.isSecondChance) {
        setTimeout(() => this.endGameWithLoss(), 500);
        return;
      } else {
        this.wrongAnswers++;
        this.updateLivesUI();

        if (this.wrongAnswers >= 3) {
          this.endGameWithLoss();
        }
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
      
      if (this.isSecondChance) {
        setTimeout(() => this.endGameWithLoss(), 500);
        return;
      } else {
        this.wrongAnswers++;
        this.updateLivesUI();

        if (this.wrongAnswers >= 3) {
          this.endGameWithLoss();
        }
      }
      return;
    }

    const key = `${n}-${targetIdx}`;
    const targetSlot = this.housesContainerEl.querySelector(`[data-slot-id="${key}"]`) as HTMLElement;

    if (!targetSlot) return;

    this.clearValidHighlights();

    this.animateCardToHouse(cardEl, targetSlot, () => {
      this.state.filled[key] = { a, b };
      this.state.score++;
      this.soundManager.playCorrect();

      if (this.state.picked && this.state.picked.el) {
        this.state.picked.el.remove();
      }
      this.state.picked = null;
      
      this.clearHintHighlight();

      targetSlot.classList.add('filled', 'pop-anim');
      const percentA = (a / n) * 100;
      const percentB = (b / n) * 100;
      targetSlot.innerHTML = `
        <div class="block-a" style="width: ${percentA}%">${a}</div>
        <div class="block-b" style="width: ${percentB}%">${b}</div>
      `;
      setTimeout(() => targetSlot.classList.remove('pop-anim'), 400);

      this.scoreEl.textContent = String(this.state.score);
      const totalCards = 63;
      const filledCards = Object.keys(this.state.filled).length;
      this.doneCountEl.textContent = String(filledCards);
      this.updateProgressBar(filledCards, totalCards);

      const availableCount = this.trayBodyEl.querySelectorAll('.card').length;
      this.trayCountEl.textContent = `${availableCount} / ${totalCards}`;

      const done = this.data[n].every((_, i) => this.state.filled[`${n}-${i}`]);
      if (done && !this.state.done.includes(n)) {
        this.state.done.push(n);
        this.soundManager.playWin();
        
        houseEl.classList.add('done', 'house-complete-anim');
        setTimeout(() => houseEl.classList.remove('house-complete-anim'), 1000);
        
        this.fireConfetti(houseEl);

        if (this.state.done.length === 9) {
          setTimeout(() => this.winGame(), 1000);
        }
      }
    });
  }

  private animateCardToHouse(cardEl: HTMLElement, targetSlot: HTMLElement, onComplete: () => void): void {
    const startRect = cardEl.getBoundingClientRect();
    const endRect = targetSlot.getBoundingClientRect();

    const clone = cardEl.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    clone.style.zIndex = '1000';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    clone.style.transform = 'rotate(0deg)';
    
    cardEl.style.opacity = '0';
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.left = `${endRect.left}px`;
        clone.style.top = `${endRect.top}px`;
        clone.style.width = `${endRect.width}px`;
        clone.style.height = `${endRect.height}px`;
        clone.style.opacity = '0.5';
        clone.style.transform = 'scale(0.9)';
      });
    });

    setTimeout(() => {
      clone.remove();
      onComplete();
    }, 400);
  }

  private fireConfetti(houseEl: HTMLElement): void {
    const rect = houseEl.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#48bb78', '#4299e1', '#ed8936'],
      disableForReducedMotion: true
    });
  }

  private useHint(): void {
    if (!this.state.picked) {
      this.soundManager.playWrong();
      return;
    }

    if (this.hintsLeft <= 0 || this.isSecondChance) return;

    this.hintsLeft--;
    this.updateHintUI();

    const targetNum = this.state.picked.num;
    const targetHouse = document.querySelector(`.house[data-num="${targetNum}"]`) as HTMLElement;

    if (!targetHouse) return;

    this.clearHintHighlight();
    targetHouse.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    targetHouse.classList.add('hint-highlight');
    this.soundManager.playClick();

    this.highlightValidHouses(targetNum);
  }

  private clearHintHighlight(): void {
    const highlighted = this.housesContainerEl.querySelector('.hint-highlight');
    if (highlighted) highlighted.classList.remove('hint-highlight');
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
    // Принудительно убираем старый оверлей
    const oldOverlay = document.querySelector('.game-overlay');
    if (oldOverlay) oldOverlay.remove();
    this.overlayEl = null;

    const title = isWin ? t('houses.winTitle') : 'Игра окончена!';
    const emoji = isWin ? '🏆' : '💔';

    const totalCards = 63;
    const filledCards = Object.keys(this.state.filled).length;
    const doneHouses = this.state.done.length;

    let actionsHtml = '';
    
    if (!isWin && !this.isSecondChance) {
      actionsHtml = `
        <button type="button" class="game-overlay__btn game-overlay__btn--primary" id="second-chance-btn">Ещё один шанс</button>
        <button type="button" class="game-overlay__btn game-overlay__btn--secondary" id="restart-btn">${t('game.playAgain')}</button>
        <button type="button" class="game-overlay__btn game-overlay__btn--text" id="menu-btn">${t('game.menu')}</button>
      `;
    } else {
      actionsHtml = `
        <button type="button" class="game-overlay__btn game-overlay__btn--primary" id="restart-btn">${t('game.playAgain')}</button>
        <button type="button" class="game-overlay__btn game-overlay__btn--secondary" id="menu-btn">${t('game.menu')}</button>
      `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    // Убеждаемся, что z-index высокий
    overlay.style.zIndex = '9999';
    overlay.innerHTML = `
      <div class="game-overlay__card">
        <div class="game-overlay__emoji">${emoji}</div>
        <h2 class="game-overlay__title">${title}</h2>
        <p class="game-overlay__score">${isWin ? t('houses.winDesc') : (this.isSecondChance ? 'Ты использовал последний шанс.' : 'Ты допустил 3 ошибки.')}</p>
        
        <div class="game-overlay__stats">
          <div class="stat-box">
            <div class="stat-value">${stats.correct}</div>
            <div class="stat-label">${t('game.score')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #3182ce;">${filledCards}/${totalCards}</div>
            <div class="stat-label">Карточек</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #38a169;">${doneHouses}/9</div>
            <div class="stat-label">Домиков</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #e53e3e;">${stats.wrong}</div>
            <div class="stat-label">Ошибки</div>
          </div>
        </div>

        <div class="game-overlay__actions">
          ${actionsHtml}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    overlay.querySelector('#second-chance-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.isSecondChance = true;
      this.updateHintUI();
      this.updateLivesUI();
      this.soundManager.playClick();
    });

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