import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

export class NumberCompositionGame extends BaseGame {
  protected gameId = 'number-composition';

  private targetValue: number = 0;
  private currentLeftValue: number = 0;
  private currentRightValue: number = 0;
  private combinationsFound: number = 0;
  private maxCombinations: number = 0;

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
  private progressEl!: HTMLElement;

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
        
        <div class="progress-info" id="progress-info"></div>

        <div class="seesaw-container">
          <div class="drop-zone drop-zone--left" id="btn-left" style="cursor: default;">
             <div class="seesaw-label" id="left-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="left-hint"></div>
             </div>
          </div>

          <div class="seesaw-pivot"></div>
          <div class="seesaw-beam" id="seesaw-beam"></div>

          <button class="drop-zone drop-zone--right" id="btn-right">
             <div class="seesaw-label" id="right-label">0</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="right-hint"></div>
             </div>
             <div class="click-hint">+1</div>
          </button>
        </div>

        <div class="scales-instruction" id="instruction-text">
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
    this.progressEl = document.getElementById('progress-info')!;

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());

    this.rightDropZoneEl.addEventListener('click', () => {
      if (!this.isRunning) return;
      if (this.currentLeftValue + this.currentRightValue < this.targetValue) {
        this.soundManager.playClick();
        this.currentRightValue++;
        this.renderItemsToContainer(this.rightHintEl, [this.currentRightValue], 1);
        this.rightLabelEl.textContent = String(this.currentRightValue);
        this.checkWinCondition();
      }
    });

    this.start();
  }

  protected onStart(): void {
    this.updateScoreUI();
  }

  // Заглушка для абстрактного метода
  protected checkAnswer(_answer: unknown): boolean {
    return false;
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
    // Выбираем число от 4 до maxNumber (обычно до 10)
    this.targetValue = Math.floor(Math.random() * (this.maxNumber - 3)) + 4;
    
    // Начинаем с 1
    this.currentLeftValue = 1;
    this.currentRightValue = 0;
    this.combinationsFound = 0;
    
    // Всего вариантов: от 1 до target-1 (например, для 6: 1+5, 2+4, 3+3, 4+2, 5+1)
    this.maxCombinations = this.targetValue - 1;

    this.targetMsgEl.textContent = String(this.targetValue);
    this.updateProgressUI();
    this.setupRound();
  }

  private setupRound(): void {
    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    this.currentRightValue = 0;

    this.leftLabelEl.textContent = String(this.currentLeftValue);
    this.rightLabelEl.textContent = '0';

    this.renderItemsToContainer(this.leftHintEl, [this.currentLeftValue], 0);
    this.renderItemsToContainer(this.rightHintEl, [0], 1);
  }

  private updateProgressUI(): void {
    this.progressEl.textContent = `Найдено вариантов: ${this.combinationsFound} из ${this.maxCombinations}`;
  }

  private checkWinCondition(): void {
    if (this.currentLeftValue + this.currentRightValue === this.targetValue) {
      this.soundManager.playCorrect();
      this.addScore(5);
      this.updateScoreUI();
      this.correctAnswers++;
      this.combinationsFound++;

      // Анимация
      this.cardEl.classList.add('card--success');
      this.beamEl.classList.add('balanced');

      const popup = document.createElement('div');
      popup.className = 'points-popup';
      popup.textContent = `+5`;
      this.cardEl.appendChild(popup);
      popup.addEventListener('animationend', () => popup.remove());

      setTimeout(() => {
        this.cardEl.classList.remove('card--success');
        
        // Проверяем, все ли варианты найдены
        if (this.currentLeftValue >= this.targetValue - 1) {
          // Все собрано! Празднуем и переходим к новому числу
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 }
          });
          this.generateTask();
        } else {
          // Переходим к следующему варианту
          this.currentLeftValue++;
          this.setupRound();
          this.updateProgressUI();
        }
      }, 1000);
    }
  }

  private renderItemsToContainer(container: HTMLElement, groups: number[], colorType: number): void {
    container.innerHTML = '';
    
    const towersContainer = document.createElement('div');
    towersContainer.className = 'towers-container';

    groups.forEach((count) => {
      if (count === 0) return;
      
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
    } else if (finalScore > 30) {
      emoji = '🌟';
      title = 'Отличная работа!';
    } else if (finalScore < 10) {
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