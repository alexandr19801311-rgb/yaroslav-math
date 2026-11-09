import { StateManager } from '../../core/StateManager';
import { Timer } from '../../core/Timer';

export abstract class BaseGame {
  protected abstract gameId: string;
  protected score: number = 0;
  protected isRunning: boolean = false;
  protected timer: Timer;
  protected stateManager: StateManager;
  protected onExit?: () => void; // Колбэк для возврата в меню

  constructor(timeLimitSeconds: number = 60, onExit?: () => void) {
    this.timer = new Timer(timeLimitSeconds, () => this.onTimeUp());
    this.stateManager = new StateManager();
    this.onExit = onExit;
  }

  public abstract init(): void;
  protected abstract generateTask(): void;
  protected abstract checkAnswer(answer: unknown): boolean;
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

  protected onStart(): void {}
  protected onCorrect(_basePoints: number, _awarded: number): void {}
  protected onWrong(): void {}
  protected onTick(_progress: number, _timeLeft: number): void {}

  // Метод для безопасного выхода в меню
  protected exitToMenu(): void {
    this.isRunning = false;
    this.timer.stop();
    if (this.onExit) {
      this.onExit();
    }
  }
}