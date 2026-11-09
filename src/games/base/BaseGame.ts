import { StateManager } from '../../core/StateManager';
import { Timer } from '../../core/Timer';
import { SoundManager } from '../../core/SoundManager';

export abstract class BaseGame {
  protected abstract gameId: string;
  protected score: number = 0;
  protected isRunning: boolean = false;
  protected timer: Timer;
  protected stateManager: StateManager;
  protected soundManager: SoundManager;
  protected onExit?: () => void;
  protected maxNumber: number;
  protected hasTimer: boolean; // <--- НОВОЕ

  protected correctAnswers: number = 0;
  protected wrongAnswers: number = 0;

  constructor(
    timeLimitSeconds: number = 60,
    onExit?: () => void,
    maxNumber: number = 10,
    hasTimer: boolean = true // По умолчанию таймер есть
  ) {
    this.timer = new Timer(timeLimitSeconds, () => this.onTimeUp());
    this.stateManager = new StateManager();
    this.soundManager = SoundManager.getInstance();
    this.onExit = onExit;
    this.maxNumber = maxNumber;
    this.hasTimer = hasTimer;
  }

  public abstract init(): void;
  protected abstract generateTask(): void;
  protected abstract checkAnswer(answer: unknown): boolean;
  protected abstract showGameOverScreen(isNewRecord: boolean, stats: { correct: number, wrong: number }): void;

  public start(): void {
    this.score = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.isRunning = true;
    this.onStart();
    
    if (this.hasTimer) {
      this.timer.start((timeLeft, progress) => this.onTick(progress, timeLeft));
    }
    
    this.generateTask();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.hasTimer) this.timer.pause();
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
    if (isNewRecord) {
      this.soundManager.playWin();
    }
    this.showGameOverScreen(isNewRecord, {
      correct: this.correctAnswers,
      wrong: this.wrongAnswers
    });
  }

  protected onStart(): void {}
  protected onCorrect(_basePoints: number, _awarded: number): void {}
  protected onWrong(): void {}
  protected onTick(_progress: number, _timeLeft: number): void {}

  protected exitToMenu(): void {
    this.isRunning = false;
    if (this.hasTimer) this.timer.stop();
    if (this.onExit) {
      this.onExit();
    }
  }
}