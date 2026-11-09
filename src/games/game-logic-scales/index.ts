import { BaseGame } from '../base/BaseGame';
import { t } from '../../core/i18n';
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

  // DOM-элементы
  private leftPanEl!: HTMLElement;
  private rightPanEl!: HTMLElement;
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
      <div class="scales-card">
        <div class="scales-header">
          <div class="scales-score">${t('game.score')}: <span id="scales-score">0</span></div>
        </div>
        
        <div class="scales-hint-msg" id="scales-hint-msg"></div>

        <div class="scales-board">
          <div class="scale-side" id="left-side">
            <div class="scale-label" id="left-label">?</div>
            <div class="scale-pan" id="left-pan">
              <div class="scale-hint-area" id="left-hint"></div>
            </div>
          </div>
          
          <div class="scale-center">⚖️</div>
          
          <div class="scale-side" id="right-side">
            <div class="scale-label" id="right-label">?</div>
            <div class="scale-pan" id="right-pan">
              <div class="scale-hint-area" id="right-hint"></div>
            </div>
          </div>
        </div>

        <div class="scales-controls">
          <button type="button" class="scales-btn" data-answer="<">&lt;</button>
          <button type="button" class="scales-btn" data-answer="=">=</button>
          <button type="button" class="scales-btn" data-answer=">">&gt;</button>
        </div>
      </div>
    `;

    // Получаем ссылки на элементы
    this.leftPanEl = document.getElementById('left-side')!;
    this.rightPanEl = document.getElementById('right-side')!;
    this.leftHintEl = document.getElementById('left-hint')!;
    this.rightHintEl = document.getElementById('right-hint')!;
    this.leftLabelEl = document.getElementById('left-label')!;
    this.rightLabelEl = document.getElementById('right-label')!;
    this.scoreEl = document.getElementById('scales-score')!;
    this.hintMsgEl = document.getElementById('scales-hint-msg')!;

    // Вешаем обработчики на кнопки
    container.querySelectorAll('.scales-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        this.handleAnswerSubmit(target.dataset.answer);
      });
    });

    this.start();
  }

  protected onStart(): void {
    this.isHintMode = false;
    this.comboStreak = 0;
    this.updateScoreUI();
  }

  protected generateTask(): void {
    this.isHintMode = false;
    this.resetScalesVisuals();
    this.hintMsgEl.textContent = '';
    this.hintMsgEl.classList.remove('visible');

    // Простая генерация: числа от 1 до 10. 
    // Левая часть может быть суммой (например, 3 + 4), чтобы было интереснее.
    const leftIsSum = Math.random() > 0.5;
    let leftValue: number;
    let leftLabel: string;
    let hintLeft: number[];

    if (leftIsSum) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      leftValue = a + b;
      leftLabel = `${a} + ${b}`;
      hintLeft = [a, b];
    } else {
      leftValue = Math.floor(Math.random() * 10) + 1;
      leftLabel = leftValue.toString();
      hintLeft = [leftValue];
    }

    const rightValue = Math.floor(Math.random() * 10) + 1;
    const rightLabel = rightValue.toString();
    const hintRight = [rightValue];

    this.currentTask = {
      leftValue,
      rightValue,
      leftLabel,
      rightLabel,
      hintLeft,
      hintRight
    };

    this.leftLabelEl.textContent = leftLabel;
    this.rightLabelEl.textContent = rightLabel;
  }

  private handleAnswerSubmit(answer: string | undefined): void {
    if (!this.isRunning) return;
    this.checkAnswer(answer);
  }

  protected checkAnswer(answer: unknown): boolean {
    if (!this.isRunning || !this.currentTask) return false;
    if (typeof answer !== 'string') return false;

    const correctSymbol = this.getCorrectSymbol(this.currentTask.leftValue, this.currentTask.rightValue);
    const isCorrect = answer === correctSymbol;

    if (isCorrect) {
      if (this.isHintMode) {
        this.addScore(2); // Сниженные очки
        this.comboStreak = 0;
      } else {
        this.addScore(10);
        this.comboStreak++;
      }
      this.updateScoreUI();
      this.generateTask();
      return true;
    } else {
      if (!this.isHintMode) {
        this.isHintMode = true;
        this.renderVisualHint();
        this.onWrong(); // Тряска из BaseGame
        this.hintMsgEl.textContent = t('scales.hintMsg');
        this.hintMsgEl.classList.add('visible');
        return false; // Ждем вторую попытку
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

  private getCorrectSymbol(left: number, right: number): AnswerSymbol {
    if (left > right) return '>';
    if (left < right) return '<';
    return '=';
  }

  private renderVisualHint(): void {
    if (!this.currentTask) return;

    this.renderItemsToContainer(this.leftHintEl, this.currentTask.hintLeft);
    this.renderItemsToContainer(this.rightHintEl, this.currentTask.hintRight);

    // Анимация наклона
    this.leftPanEl.classList.remove('tip-down', 'tip-up');
    this.rightPanEl.classList.remove('tip-down', 'tip-up');

    if (this.currentTask.leftValue > this.currentTask.rightValue) {
      this.leftPanEl.classList.add('tip-down');
      this.rightPanEl.classList.add('tip-up');
    } else if (this.currentTask.leftValue < this.currentTask.rightValue) {
      this.leftPanEl.classList.add('tip-up');
      this.rightPanEl.classList.add('tip-down');
    }
  }

  private renderItemsToContainer(container: HTMLElement, groups: number[]): void {
    container.innerHTML = '';
    groups.forEach((count, groupIndex) => {
      const groupEl = document.createElement('div');
      groupEl.className = `hint-group hint-color-${groupIndex % 2}`;
      
      for (let i = 0; i < count; i++) {
        const item = document.createElement('span');
        item.className = 'hint-item';
        item.style.animationDelay = `${i * 50}ms`;
        groupEl.appendChild(item);
      }
      container.appendChild(groupEl);
    });
  }

  private resetScalesVisuals(): void {
    this.leftPanEl.classList.remove('tip-down', 'tip-up');
    this.rightPanEl.classList.remove('tip-down', 'tip-up');
    this.leftHintEl.innerHTML = '';
    this.rightHintEl.innerHTML = '';
  }

  private updateScoreUI(): void {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
  }

  protected showGameOverScreen(isNewRecord: boolean): void {
    const finalScore = this.score;
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay'; // Используем глобальные стили оверлея
    overlay.innerHTML = `
      <div class="game-overlay__card">
        <h2 class="game-overlay__title">${t('game.timeUp')}</h2>
        <p class="game-overlay__score">${t('game.score')}: <strong>${finalScore}</strong></p>
        <p class="game-overlay__record">
          ${isNewRecord ? `🎉 ${t('game.newRecord')}` : ''}
        </p>
        <button type="button" class="game-overlay__btn" id="restart-btn">${t('game.playAgain')}</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#restart-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.timer.reset();
      this.start();
    });
  }
}