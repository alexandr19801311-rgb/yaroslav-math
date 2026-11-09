import { StateManager } from '../../core/StateManager';
import { Timer } from '../../core/Timer';

/**
 * Абстрактный шаблон жизненного цикла игры.
 * Ядро не содержит UI-текстов и fallback-логики отображения:
 * всё, что видит игрок, реализует конкретная игра.
 */
export abstract class BaseGame {
  protected abstract gameId: string;
  protected score: number = 0;
  protected isRunning: boolean = false;
  protected timer: Timer;
  protected stateManager: StateManager;

  constructor(timeLimitSeconds: number = 60) {
    this.timer = new Timer(timeLimitSeconds, () => this.onTimeUp());
    this.stateManager = new StateManager();
  }

  public abstract init(): void;
  protected abstract generateTask(): void;
  protected abstract checkAnswer(answer: unknown): boolean;

  /**
   * Игра ОБЯЗАНА реализовать экран завершения.
   * Ядро не показывает alert/console — только сообщает факт окончания.
   */
  protected abstract showGameOverScreen(isNewRecord: boolean): void;

  public start(): void {
    this.score = 0;
    this.isRunning = true;
    this.onStart();
    this.timer.start((timeLeft, progress) => this.onTick(progress, timeLeft));
    this.generateTask();
  }

  public pause(): void {
    this.isRunning = false;
    this.timer.pause();
  }

  /**
   * Централизованное начисление очков. Работает только во время игры.
   */
  protected addScore(points: number): void {
    if (this.isRunning) {
      this.score += points;
    }
  }

  protected onTimeUp(): void {
    this.isRunning = false;
    this.timer.stop();
    const isNewRecord = this.stateManager.saveHighScore(this.gameId, this.score);
    this.showGameOverScreen(isNewRecord);
  }

  // ----- Хуки для переопределения в играх -----

  /** Вызывается в начале start(), до первого тика таймера. */
  protected onStart(): void {}

  protected onCorrect(basePoints: number, awarded: number): void {}
  protected onWrong(): void {}
  protected onTick(progress: number, timeLeft: number): void {}
}