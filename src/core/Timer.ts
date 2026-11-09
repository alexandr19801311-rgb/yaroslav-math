export class Timer {
  private duration: number;
  private timeLeft: number;
  private timerId: number | null = null;
  private onTimeUp: () => void;

  constructor(seconds: number, onTimeUpCallback: () => void) {
    this.duration = seconds;
    this.timeLeft = seconds;
    this.onTimeUp = onTimeUpCallback;
  }

  // Явно указываем типы для timeLeft и progress
  public start(onTick: (timeLeft: number, progress: number) => void): void {
    if (this.timerId !== null) return;
    
    onTick(this.timeLeft, 1.0);

    this.timerId = window.setInterval(() => {
      this.timeLeft--;
      const progress = this.timeLeft / this.duration;
      
      onTick(this.timeLeft, progress);

      if (this.timeLeft <= 0) {
        this.stop();
        this.onTimeUp();
      }
    }, 1000);
  }

  public pause(): void {
    this.stop();
  }

  public reset(): void {
    this.stop();
    this.timeLeft = this.duration;
  }

  // Сделали public, чтобы BaseGame мог останавливать таймер
  public stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}