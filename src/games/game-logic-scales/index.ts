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
  private beamEl!: HTMLElement;
  private leftDropZoneEl!: HTMLElement;
  private rightDropZoneEl!: HTMLElement;
  private dragItemEl!: HTMLElement;
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

        <div class="seesaw-container">
          <!-- Левая зона сброса -->
          <div class="drop-zone drop-zone--left" id="drop-left">
             <div class="seesaw-label" id="left-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="left-hint"></div>
             </div>
          </div>

          <!-- Точка опоры -->
          <div class="seesaw-pivot"></div>
          
          <!-- Балка (без кружка внутри) -->
          <div class="seesaw-beam" id="seesaw-beam"></div>

          <!-- Правая зона сброса -->
          <div class="drop-zone drop-zone--right" id="drop-right">
             <div class="seesaw-label" id="right-label">?</div>
             <div class="seesaw-pan">
               <div class="seesaw-hint-area" id="right-hint"></div>
             </div>
          </div>

          <!-- Перетаскиваемый груз (теперь отдельно от балки) -->
          <div class="drag-item" id="drag-item" draggable="true">
            <span class="drag-handle">≡</span>
          </div>
        </div>
        
        <div class="scales-controls">
           <button type="button" class="scales-btn scales-btn--balance" id="btn-balance">${t('scales.balance')}</button>
        </div>
      </div>
    `;

    this.beamEl = document.getElementById('seesaw-beam')!;
    this.leftDropZoneEl = document.getElementById('drop-left')!;
    this.rightDropZoneEl = document.getElementById('drop-right')!;
    this.dragItemEl = document.getElementById('drag-item')!;
    this.leftHintEl = document.getElementById('left-hint')!;
    this.rightHintEl = document.getElementById('right-hint')!;
    this.leftLabelEl = document.getElementById('left-label')!;
    this.rightLabelEl = document.getElementById('right-label')!;
    this.scoreEl = document.getElementById('scales-score')!;
    this.hintMsgEl = document.getElementById('scales-hint-msg')!;

    this.setupDragAndDrop();
    document.getElementById('btn-balance')?.addEventListener('click', () => this.checkAnswer('='));

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

    this.currentTask = { leftValue, rightValue, leftLabel, rightLabel, hintLeft, hintRight };

    this.leftLabelEl.textContent = leftLabel;
    this.rightLabelEl.textContent = rightLabel;
    
    // Возвращаем груз на место при новом задании
    this.resetDragItem();
  }

  private setupDragAndDrop(): void {
    // 1. Обработка перетаскивания мышью (Desktop)
    this.dragItemEl.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', 'drag');
      this.dragItemEl.classList.add('dragging');
    });

    this.dragItemEl.addEventListener('dragend', () => {
      this.dragItemEl.classList.remove('dragging');
      this.resetDragItem();
    });

    [this.leftDropZoneEl, this.rightDropZoneEl].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const isLeft = zone.id === 'drop-left';
        this.handleDrop(isLeft);
      });
    });

    // 2. Обработка Touch-событий (Mobile)
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;

    this.dragItemEl.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      initialX = touch.clientX - currentX;
      initialY = touch.clientY - currentY;
      this.dragItemEl.style.transition = 'none';
    }, { passive: true });

    this.dragItemEl.addEventListener('touchmove', (e) => {
      e.preventDefault(); 
      const touch = e.touches[0];
      currentX = touch.clientX - initialX;
      currentY = touch.clientY - initialY;
      this.dragItemEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }, { passive: false });

    this.dragItemEl.addEventListener('touchend', () => {
      this.dragItemEl.style.transition = 'transform 0.3s ease';
      const touchX = initialX + currentX;
      const touchY = initialY + currentY;
      
      const leftRect = this.leftDropZoneEl.getBoundingClientRect();
      const rightRect = this.rightDropZoneEl.getBoundingClientRect();

      if (this.isPointInRect(touchX, touchY, leftRect)) {
        this.handleDrop(true);
      } else if (this.isPointInRect(touchX, touchY, rightRect)) {
        this.handleDrop(false);
      } else {
        this.resetDragItem();
      }
    });
  }

  private isPointInRect(x: number, y: number, rect: DOMRect): boolean {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  private handleDrop(isLeft: boolean): void {
    if (!this.isRunning) return;
    const answer: AnswerSymbol = isLeft ? '>' : '<';
    this.checkAnswer(answer);
  }

  private resetDragItem(): void {
    this.dragItemEl.style.transform = 'translate(0, 0)';
    this.dragItemEl.classList.remove('dragging');
  }

  protected checkAnswer(answer: unknown): boolean {
    if (!this.isRunning || !this.currentTask) return false;
    if (typeof answer !== 'string') return false;

    const correctSymbol = this.getCorrectSymbol(this.currentTask.leftValue, this.currentTask.rightValue);
    const isCorrect = answer === correctSymbol;

    if (isCorrect) {
      this.addScore(this.isHintMode ? 2 : 10);
      this.comboStreak = this.isHintMode ? 0 : this.comboStreak + 1;
      this.updateScoreUI();
      this.generateTask();
      return true;
    } else {
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

  private getCorrectSymbol(left: number, right: number): AnswerSymbol {
    if (left > right) return '>';
    if (left < right) return '<';
    return '=';
  }

  private renderVisualHint(): void {
    if (!this.currentTask) return;
    this.renderItemsToContainer(this.leftHintEl, this.currentTask.hintLeft);
    this.renderItemsToContainer(this.rightHintEl, this.currentTask.hintRight);

    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    if (this.currentTask.leftValue > this.currentTask.rightValue) {
      this.beamEl.classList.add('tilt-left');
    } else if (this.currentTask.leftValue < this.currentTask.rightValue) {
      this.beamEl.classList.add('tilt-right');
    } else {
      this.beamEl.classList.add('balanced');
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
        item.style.animationDelay = `${i * 40}ms`;
        groupEl.appendChild(item);
      }
      container.appendChild(groupEl);
    });
  }

  private resetScalesVisuals(): void {
    this.beamEl.classList.remove('tilt-left', 'tilt-right', 'balanced');
    this.leftHintEl.innerHTML = '';
    this.rightHintEl.innerHTML = '';
  }

  private updateScoreUI(): void {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
  }

  protected showGameOverScreen(isNewRecord: boolean): void {
    const finalScore = this.score;
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
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