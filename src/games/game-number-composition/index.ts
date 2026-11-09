import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

export class NumberCompositionGame extends BaseGame {
  protected gameId = 'number-composition';

  private targetValue: number = 0;
  private leftValue: number = 0;
  private rightValue: number = 0;

  private cardEl!: HTMLElement;
  private timerFillEl!: HTMLElement;
  private timerBarEl!: HTMLElement;
  private beamEl!: HTMLElement;
  private leftHintEl!: HTMLElement;
  private rightHintEl!: HTMLElement;
  private leftLabelEl!: HTMLElement;
  private rightLabelEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private targetMsgEl!: HTMLElement;
  private rightDropZoneEl!: HTMLElement;

  public init(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="scales-card" id="scales-card">
        <div class="timer-bar" id="timer-bar">
          <div class="timer-bar__fill" id="timer-fill"></div>
        </div>

        <div class="scales-header">
          <button type="button" class="btn-exit" id="btn-exit" title="В меню">✖</button>
          <div class="scales-score">${t('game.score')}: <span id="scales-score">0</span></div>
        </div>
        
        <div class="scales-hint-msg" id="scales-hint-msg" style="color: #3182ce; font-size: 1.5rem; font-weight: bold; min-height: 30px;">
          Собери число <span id="target-value">?</span>
        </div>

        <div class="seesaw-container">
          <!-- Левая чаша (фиксированная) -->
          <div class="drop-zone drop-zone--left" id="btn-left" style="cursor: default;">
             <div class="seesaw-label" id="left-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="left-hint"></div>
             </div>
          </div>

          <div class="seesaw-pivot"></div>
          <div class="seesaw-beam" id="seesaw-beam"></div>

          <!-- Правая чаша (кликабельная) -->
          <button class="drop-zone drop-zone--right" id="btn-right">
             <div class="seesaw-label" id="right-label">0</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="right-hint"></div>
             </div>
             <div class="click-hint">+1</div>
          </button>
        </div>

        <div class="scales-instruction">
          Нажимай на правую чашу, чтобы добавить кубик!
        </div>
      </div>
    `;

    this.cardEl = document.getElementById('scales-card')!;
    this.timerBarEl = document.getElementById('timer-bar')!;
    this.timerFillEl = document.getElementById('timer-fill')!;
    this.beamEl = document.getElementById('seesaw-beam')!;
    this.rightDropZoneEl = document.getElementById('btn-right')!;
    this.leftHintEl = document.getElementById('left-hint')!;
    this.rightHintEl = document.getElementById('right-hint')!;
    this.leftLabelEl = document.getElementById('left-label')!;
    this.rightLabelEl = document.getElementById('right-label')!;
    this.scoreEl = document.getElementById('scales-score')!;
    this.targetMsgEl = document.getElementById('target-value')!;

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());

    // Клик по правой чаше добавляет кубик
    this.rightDropZoneEl.addEventListener('click', () => {
      if (!this.isRunning) return;
      if (this.leftValue + this.rightValue < this.targetValue) {
        this.soundManager.playClick();
        this.rightValue++;
        this.renderItemsToContainer(this.rightHintEl, [this.rightValue], 1);
        this.rightLabelEl.textContent = String(this.rightValue);
        this.checkWinCondition();
      }
    });

    this.start();
  }
  // Заглушка для абстрактного метода, так как в этой игре нет текстового ввода
  protected checkAnswer(_answer: unknown): boolean {
    return false;
  }
  protected onStart(): void {
    this.updateScoreUI();
  }

  protected onTick(progress: number, _timeLeft: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    this.timerFillEl.style.transform = `scaleX(${clamped})`;

    this.timerBarEl.classList.remove('timer-bar--warn', 'timer-bar--danger');
    if (clamped <= 0.2) {
      this.timerBarEl.classList.add('timer-bar--danger');
    } else if (clamped <= 0.5) {
      this.timerBarEl.classList.add('timer-bar--warn');
    }
  }

  protected generateTask(): void {
    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    this.leftHintEl.innerHTML = '';
    this.rightHintEl.innerHTML = '';

    // Генерируем целевое число (от 3 до maxNumber)
    this.targetValue = Math.floor(Math.random() * (this.maxNumber - 2)) + 3;
    
    // Генерируем левое число (от 1 до targetValue - 1)
    this.leftValue = Math.floor(Math.random() * (this.targetValue - 1)) + 1;
    this.rightValue = 0;

    this.targetMsgEl.textContent = String(this.targetValue);
    this.leftLabelEl.textContent = String(this.leftValue);
    this.rightLabelEl.textContent = '0';

    // Рендерим левую башню
    this.renderItemsToContainer(this.leftHintEl, [this.leftValue], 0);
    this.renderItemsToContainer(this.rightHintEl, [0], 1);
  }

  private checkWinCondition(): void {
    if (this.leftValue + this.rightValue === this.targetValue) {
      this.soundManager.playCorrect();
      this.addScore(10);
      this.updateScoreUI();
      this.correctAnswers++;

      // Анимация победы
      this.cardEl.classList.add('card--success');
      this.beamEl.classList.add('balanced');

      const popup = document.createElement('div');
      popup.className = 'points-popup';
      popup.textContent = `+10`;
      this.cardEl.appendChild(popup);
      popup.addEventListener('animationend', () => popup.remove());

      // Задержка перед новым заданием
      setTimeout(() => {
        this.cardEl.classList.remove('card--success');
        this.generateTask();
      }, 1000);
    }
  }

  private renderItemsToContainer(container: HTMLElement, groups: number[], colorType: number): void {
    container.innerHTML = '';
    
    const towersContainer = document.createElement('div');
    towersContainer.className = 'towers-container';

    groups.forEach((count) => {
      if (count === 0) return; // Не рисуем пустую башню
      
      const tower = document.createElement('div');
      tower.className = `lego-tower lego-color-${colorType}`;
      
      for (let i = 0; i < count; i++) {
        const brick = document.createElement('div');
        brick.className = 'lego-brick';
        brick.innerHTML = '<div class="lego-studs"><span></span><span></span><span></span><span></span></div>';
        brick.style.animationDelay = `${i * 30}ms`;
        tower.appendChild(brick);
      }
      
      towersContainer.appendChild(tower);
    });

    container.appendChild(towersContainer);
  }

  private updateScoreUI(): void {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
  }

  protected showGameOverScreen(isNewRecord: boolean, stats: { correct: number, wrong: number }): void {
    const finalScore = this.score;
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    
    let emoji = '😊';
    let title = t('game.timeUp');
    if (isNewRecord) {
      emoji = '🏆';
      title = 'Новый рекорд!';
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#48bb78', '#4299e1', '#ed8936', '#e53e3e']
      });
    } else if (finalScore > 50) {
      emoji = '🌟';
      title = 'Отличная работа!';
    } else if (finalScore < 20) {
      emoji = '💪';
      title = 'Хорошая попытка!';
    }

    overlay.innerHTML = `
      <div class="game-overlay__card">
        <div class="game-overlay__emoji">${emoji}</div>
        <h2 class="game-overlay__title">${title}</h2>
        
        <div class="game-overlay__stats">
          <div class="stat-box">
            <div class="stat-value">${finalScore}</div>
            <div class="stat-label">${t('game.score')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #38a169;">${stats.correct}</div>
            <div class="stat-label">Собрано</div>
          </div>
        </div>

        <div class="game-overlay__actions">
          <button type="button" class="game-overlay__btn game-overlay__btn--primary" id="restart-btn">${t('game.playAgain')}</button>
          <button type="button" class="game-overlay__btn game-overlay__btn--secondary" id="menu-btn">В меню</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#restart-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.timer.reset();
      this.start();
    });
    
    overlay.querySelector('#menu-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.exitToMenu();
    });
  }
}