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

  public start(onTick: (timeLeft: number) => void): void {
    if (this.timerId) return; // Таймер уже запущен

    onTick(this.timeLeft);
    this.timerId = window.setInterval(() => {
      this.timeLeft--;
      onTick(this.timeLeft);

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

  private stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
