import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
import confetti from 'canvas-confetti';
import './style.css';

interface ComboState {
  streak: number;
  multiplier: number;
}

export class ArithmeticGame extends BaseGame {
  protected gameId = 'arithmetic';

  private currentAnswer: number = 0;

  private problemEl!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private scoreEl!: HTMLElement;
  private timerFillEl!: HTMLElement;
  private timerBarEl!: HTMLElement;
  private timerTextEl!: HTMLElement;
  private comboEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl: HTMLElement | null = null;

  private combo: ComboState = { streak: 0, multiplier: 1 };
  private static readonly BASE_POINTS = 10;

  public init(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="game-card">
        <div class="game-header">
          <button type="button" class="btn-exit" id="btn-exit" title="В меню">✖</button>
          <div class="timer-block">
            <div class="timer-bar" id="timer-bar">
              <div class="timer-bar__fill" id="timer-fill"></div>
            </div>
            <span class="timer-text" id="timer-text">60с</span>
          </div>
          <div class="score-box">${t('game.score')}: <span id="game-score">0</span></div>
          <div class="record-box">${t('game.record')}: <span id="game-record">0</span></div>
        </div>

        <div class="combo-box" id="combo-box" aria-live="polite"></div>

        <div class="problem-display" id="problem-text">Загрузка...</div>

        <div class="input-zone">
          <input
            type="number"
            id="answer-input"
            placeholder="?"
            inputmode="numeric"
            autocomplete="off"
          />
          <button id="submit-btn" type="button">${t('game.answer')}</button>
        </div>
      </div>
    `;

    this.problemEl = document.getElementById('problem-text')!;
    this.inputEl = document.getElementById('answer-input') as HTMLInputElement;
    this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    this.scoreEl = document.getElementById('game-score')!;
    this.timerFillEl = document.getElementById('timer-fill')!;
    this.timerBarEl = document.getElementById('timer-bar')!;
    this.timerTextEl = document.getElementById('timer-text')!;
    this.comboEl = document.getElementById('combo-box')!;
    this.highScoreEl = document.getElementById('game-record')!;

    this.highScoreEl.textContent = String(this.stateManager.getHighScore(this.gameId));

    document.getElementById('btn-exit')?.addEventListener('click', () => this.exitToMenu());

    this.submitBtn.addEventListener('click', () => this.handleAnswerSubmit());
    this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') this.handleAnswerSubmit();
    });

    this.start();
  }

  protected onStart(): void {
    this.combo = { streak: 0, multiplier: 1 };
    this.updateComboUI();
    this.updateScoreUI();
    this.highScoreEl.textContent = String(this.stateManager.getHighScore(this.gameId));
  }

  protected generateTask(): void {
    const isAddition = Math.random() > 0.5;
    let a = Math.floor(Math.random() * (this.maxNumber - 1)) + 1;
    let b = Math.floor(Math.random() * (this.maxNumber - 1)) + 1;

    if (isAddition) {
      while (a + b > this.maxNumber) {
        a = Math.floor(Math.random() * (this.maxNumber - 1)) + 1;
        b = Math.floor(Math.random() * (this.maxNumber - 1)) + 1;
      }
      this.currentAnswer = a + b;
      this.problemEl.textContent = `${a} + ${b} =`;
    } else {
      if (a < b) {
        const t = a;
        a = b;
        b = t;
      }
      this.currentAnswer = a - b;
      this.problemEl.textContent = `${a} - ${b} =`;
    }

    this.inputEl.value = '';
    this.inputEl.focus();
  }

  protected checkAnswer(answer: unknown): boolean {
    if (typeof answer !== 'number' || !Number.isFinite(answer)) {
      return false;
    }

    if (answer === this.currentAnswer) {
      this.correctAnswers++;
      this.soundManager.playCorrect();
      this.handleCorrect();
      return true;
    }

    this.wrongAnswers++;
    this.soundManager.playWrong();
    this.handleWrong();
    return false;
  }

  private handleAnswerSubmit(): void {
    if (!this.isRunning) return;

    const raw = this.inputEl.value.trim();
    if (raw === '') return;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    this.checkAnswer(parsed);
  }

  private handleCorrect(): void {
    this.combo.streak += 1;
    this.combo.multiplier = this.calcMultiplier(this.combo.streak);

    const base = ArithmeticGame.BASE_POINTS;
    const awarded = Math.round(base * this.combo.multiplier);

    this.addScore(awarded);
    this.updateScoreUI();
    this.updateComboUI();
    this.onCorrect(base, awarded);

    this.generateTask();
  }

  private handleWrong(): void {
    const wasStreak = this.combo.streak;
    this.combo.streak = 0;
    this.combo.multiplier = 1;
    this.updateComboUI();
    this.onWrong();

    if (wasStreak > 0) {
      this.inputEl.value = '';
      this.inputEl.focus();
    }
  }

  private calcMultiplier(streak: number): number {
    if (streak >= 6) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  }

  private updateScoreUI(): void {
    this.scoreEl.textContent = String(this.score);
  }

  private updateComboUI(): void {
    if (this.combo.streak >= 2) {
      this.comboEl.textContent = t('game.combo', { streak: this.combo.streak, multiplier: this.combo.multiplier });
      this.comboEl.classList.add('combo-box--visible');
      this.comboEl.classList.toggle('combo-box--hot', this.combo.multiplier > 1);
    } else {
      this.comboEl.textContent = '';
      this.comboEl.classList.remove('combo-box--visible', 'combo-box--hot');
    }
  }

  protected onTick(progress: number, timeLeft: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    this.timerFillEl.style.transform = `scaleX(${clamped})`;
    this.timerTextEl.textContent = `${timeLeft}с`;

    this.timerBarEl.classList.remove('timer-bar--warn', 'timer-bar--danger');
    if (clamped <= 0.2) {
      this.timerBarEl.classList.add('timer-bar--danger');
    } else if (clamped <= 0.5) {
      this.timerBarEl.classList.add('timer-bar--warn');
    }
  }

  protected onCorrect(_basePoints: number, awarded: number): void {
    this.problemEl.classList.remove('problem-display--pop');
    void this.problemEl.offsetWidth;
    this.problemEl.classList.add('problem-display--pop');

    this.spawnFloatingPoints(awarded);

    this.submitBtn.classList.remove('btn--flash');
    void this.submitBtn.offsetWidth;
    this.submitBtn.classList.add('btn--flash');
  }

  protected onWrong(): void {
    this.inputEl.classList.remove('error-shake');
    void this.inputEl.offsetWidth;
    this.inputEl.classList.add('error-shake');
    setTimeout(() => this.inputEl.classList.remove('error-shake'), 300);
  }

  private spawnFloatingPoints(points: number): void {
    const float = document.createElement('div');
    float.className = 'floating-points';
    float.textContent = `+${points}`;
    this.problemEl.appendChild(float);
    float.addEventListener('animationend', () => float.remove());
  }

  protected showGameOverScreen(isNewRecord: boolean, stats: { correct: number, wrong: number }): void {
    const finalScore = this.score;
    const record = this.stateManager.getHighScore(this.gameId);

    if (this.overlayEl) {
      this.overlayEl.remove();
    }

    // Определяем эмодзи
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
    } else if (finalScore > 100) {
      emoji = '🌟';
      title = 'Отличная работа!';
    } else if (finalScore < 30) {
      emoji = '💪';
      title = 'Хорошая попытка!';
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
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
        
        <p class="game-overlay__record">
          ${isNewRecord ? `🎉 ${t('game.newRecord')}` : `${t('game.record')}: <strong>${record}</strong>`}
        </p>

        <div class="game-overlay__actions">
          <button type="button" class="game-overlay__btn game-overlay__btn--primary" id="overlay-restart">${t('game.playAgain')}</button>
          <button type="button" class="game-overlay__btn game-overlay__btn--secondary" id="overlay-menu">В меню</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    const restartBtn = overlay.querySelector<HTMLButtonElement>('#overlay-restart');
    restartBtn?.addEventListener('click', () => {
      if (this.overlayEl) {
        this.overlayEl.remove();
        this.overlayEl = null;
      }
      this.timer.reset();
      this.start();
    });
    restartBtn?.focus();
    
    overlay.querySelector('#overlay-menu')?.addEventListener('click', () => {
      if (this.overlayEl) {
        this.overlayEl.remove();
        this.overlayEl = null;
      }
      this.exitToMenu();
    });
  }
}