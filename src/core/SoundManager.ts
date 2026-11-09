/**
 * Менеджер звуков LogiKids.
 * Использует Web Audio API для синтеза звуков "на лету".
 * Не требует загрузки внешних mp3-файлов.
 */
export class SoundManager {
  private static instance: SoundManager;
  private audioCtx: AudioContext | null = null;

  private constructor() {
    // Инициализация контекста произойдет при первом клике, чтобы обойти блокировки браузера
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initContext(): AudioContext {
    if (!this.audioCtx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Короткий звук успеха (два восходящих тона).
   */
  public playCorrect(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      this.playTone(ctx, 523.25, now, 0.1, 'sine'); // C5
      this.playTone(ctx, 659.25, now + 0.1, 0.15, 'sine'); // E5
    } catch {
      // Тихо игнорируем ошибки аудио
    }
  }

  /**
   * Звук ошибки (низкий, короткий "бзз").
   */
  public playWrong(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      this.playTone(ctx, 150, now, 0.2, 'sawtooth');
    } catch {
      // ignore
    }
  }

  /**
   * Звук клика (короткий щелчок).
   */
  public playClick(): void {
    try {
      const ctx = this.initContext();
      this.playTone(ctx, 800, ctx.currentTime, 0.05, 'sine');
    } catch {
      // ignore
    }
  }

  /**
   * Фанфары на экране победы.
   */
  public playWin(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      
      this.playTone(ctx, 523.25, now, 0.15, 'triangle'); // C5
      this.playTone(ctx, 659.25, now + 0.15, 0.15, 'triangle'); // E5
      this.playTone(ctx, 783.99, now + 0.3, 0.4, 'triangle'); // G5
    } catch {
      // ignore
    }
  }

  /**
   * Вспомогательный метод для генерации одного тона.
   */
  private playTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType
  ): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Плавное затухание (Envelope)
    gainNode.gain.setValueAtTime(0.1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}