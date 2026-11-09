import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

interface ScalesTask {
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  hintLeft: number[];
  hintRight: number[];
}

type AnswerSymbol = '<' | '>' | '=';

export class SmartScalesGame extends BaseGame {
  protected gameId = 'logic-scales';

  private isHintMode: boolean = false;
  private currentTask: ScalesTask | null = null;
  private comboStreak: number = 0;

  private cardEl!: HTMLElement;
  private timerFillEl!: HTMLElement;
  private timerBarEl!: HTMLElement;
  private beamEl!: HTMLElement;
  private leftDropZoneEl!: HTMLElement;
  private rightDropZoneEl!: HTMLElement;
  private leftHintEl!: HTMLElement;
  private rightHintEl!: HTMLElement;
  private leftLabelEl!: HTMLElement;
  private rightLabelEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private hintMsgEl!: HTMLElement;

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
        
        <div class="scales-hint-msg" id="scales-hint-msg"></div>

        <div class="seesaw-container">
          <button class="drop-zone drop-zone--left" id="btn-left">
             <div class="seesaw-label" id="left-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="left-hint"></div>
             </div>
          </button>

          <div class="seesaw-pivot"></div>
          <div class="seesaw-beam" id="seesaw-beam"></div>

          <button class="drop-zone drop-zone--right" id="btn-right">
             <div class="seesaw-label" id="right-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="right-hint"></div>
             </div>
          </button>
        </div>

        <div class="scales-instruction">
          Покажи, где больше!
        </div>
        
        <div class="scales-controls">
           <button type="button" class="scales-btn scales-btn--balance" id="btn-balance">${t('scales.balance')}</button>
        </div>
      </div>
    `;

    this.cardEl = document.getElementById('scales-card')!;
    this.timerBarEl = document.getElementById('timer-bar')!;
    this.timerFillEl = document.getElementById('timer-fill')!;
    this.beamEl = document.getElementById('seesaw-beam')!;
    this.leftDropZoneEl = document.getElementById('btn-left')!;
    this.rightDropZoneEl = document.getElementById('btn-right')!;
    this.leftHintEl = document.getElementById('left-hint')!;
    this.rightHintEl = document.getElementById('right-hint')!;
    this.leftLabelEl = document.getElementById('left-label')!;
    this.rightLabelEl = document.getElementById('right-label')!;
    this.scoreEl = document.getElementById('scales-score')!;
    this.hintMsgEl = document.getElementById('scales-hint-msg')!;

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());
    
    this.leftDropZoneEl.addEventListener('click', () => {
      this.soundManager.playClick();
      this.handleDrop(true);
    });
    
    this.rightDropZoneEl.addEventListener('click', () => {
      this.soundManager.playClick();
      this.handleDrop(false);
    });
    
    document.getElementById('btn-balance')?.addEventListener('click', () => {
      this.soundManager.playClick();
      this.checkAnswer('=');
    });

    this.start();
  }

  protected onStart(): void {
    this.isHintMode = false;
    this.comboStreak = 0;
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
    this.isHintMode = false;
    this.resetScalesVisuals();
    this.hintMsgEl.textContent = '';
    this.hintMsgEl.classList.remove('visible');

    const leftIsSum = Math.random() > 0.5;
    let leftValue: number;
    let leftLabel: string;
    let hintLeft: number[];

    if (leftIsSum) {
      const a = Math.floor(Math.random() * (this.maxNumber / 2)) + 1;
      const b = Math.floor(Math.random() * (this.maxNumber / 2)) + 1;
      leftValue = a + b;
      leftLabel = `${a} + ${b}`;
      hintLeft = [a, b];
    } else {
      leftValue = Math.floor(Math.random() * this.maxNumber) + 1;
      leftLabel = leftValue.toString();
      hintLeft = [leftValue];
    }

    const rightValue = Math.floor(Math.random() * this.maxNumber) + 1;
    const rightLabel = rightValue.toString();
    const hintRight = [rightValue];

    this.currentTask = { leftValue, rightValue, leftLabel, rightLabel, hintLeft, hintRight };

    this.leftLabelEl.textContent = leftLabel;
    this.rightLabelEl.textContent = rightLabel;

    this.renderItemsToContainer(this.leftHintEl, hintLeft, 0);
    this.renderItemsToContainer(this.rightHintEl, hintRight, 1);
  }

  private handleDrop(isLeft: boolean): void {
    if (!this.isRunning) return;
    const answer: AnswerSymbol = isLeft ? '>' : '<';
    this.checkAnswer(answer);
  }

  protected checkAnswer(answer: unknown): boolean {
    if (!this.isRunning || !this.currentTask) return false;
    if (typeof answer !== 'string') return false;

    const correctSymbol = this.getCorrectSymbol(this.currentTask.leftValue, this.currentTask.rightValue);
    const isCorrect = answer === correctSymbol;

    if (isCorrect) {
      this.correctAnswers++; // Считаем правильные
      this.soundManager.playCorrect();
      
      const points = this.isHintMode ? 2 : 10;
      this.addScore(points);
      this.comboStreak = this.isHintMode ? 0 : this.comboStreak + 1;
      this.updateScoreUI();
      
      this.showSuccessFeedback(points);
      setTimeout(() => this.generateTask(), 400);
      return true;
    } else {
      this.wrongAnswers++; // Считаем неправильные
      this.soundManager.playWrong();

      if (!this.isHintMode) {
        this.isHintMode = true;
        this.renderVisualHint();
        this.onWrong();
        this.hintMsgEl.textContent = t('scales.hintMsg');
        this.hintMsgEl.classList.add('visible');
        return false;
      } else {
        this.isHintMode = false;
        this.onWrong();
        this.hintMsgEl.textContent = `${t('game.answer')}: ${correctSymbol}`;
        this.hintMsgEl.classList.add('visible');
        setTimeout(() => this.generateTask(), 1500);
        return false;
      }
    }
  }

  private showSuccessFeedback(points: number): void {
    this.cardEl.classList.add('card--success');
    setTimeout(() => this.cardEl.classList.remove('card--success'), 300);

    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    this.cardEl.appendChild(popup);

    popup.addEventListener('animationend', () => popup.remove());
  }

  private getCorrectSymbol(left: number, right: number): AnswerSymbol {
    if (left > right) return '>';
    if (left < right) return '<';
    return '=';
  }

  private renderVisualHint(): void {
    if (!this.currentTask) return;

    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    if (this.currentTask.leftValue > this.currentTask.rightValue) {
      this.beamEl.classList.add('tilt-left');
    } else if (this.currentTask.leftValue < this.currentTask.rightValue) {
      this.beamEl.classList.add('tilt-right');
    } else {
      this.beamEl.classList.add('balanced');
    }
  }

  private renderItemsToContainer(container: HTMLElement, groups: number[], colorType: number): void {
    container.innerHTML = '';
    
    const towersContainer = document.createElement('div');
    towersContainer.className = 'towers-container';

    groups.forEach((count) => {
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

  private resetScalesVisuals(): void {
    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    this.leftHintEl.innerHTML = '';
    this.rightHintEl.innerHTML = '';
  }

  private updateScoreUI(): void {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
  }

  protected showGameOverScreen(isNewRecord: boolean, stats: { correct: number, wrong: number }): void {
    const finalScore = this.score;
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    
    // Определяем эмодзи по результату
    let emoji = '😊';
    let title = t('game.timeUp');
    if (isNewRecord) {
      emoji = '🏆';
      title = 'Новый рекорд!';
      // Запускаем салют!
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
            <div class="stat-label">Верно</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: #e53e3e;">${stats.wrong}</div>
            <div class="stat-label">Ошибки</div>
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