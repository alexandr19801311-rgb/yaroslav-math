/**
 * Менеджер звуков LogiKids.
 * Использует Web Audio API для синтеза звуков "на лету".
 * Не требует загрузки внешних mp3-файлов.
 */
export class SoundManager {
  private static instance: SoundManager;
  private audioCtx: AudioContext | null = null;

  private constructor() {
    // Инициализация контекста произойдет при первом клике
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Инициализирует или возобновляет аудио-контекст.
   */
  private initContext(): AudioContext {
    if (!this.audioCtx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // Тихо игнорируем ошибку, если браузер блокирует звук
      });
    }
    
    return this.audioCtx;
  }

  /**
   * Короткий звук успеха (восходящая гамма).
   * @param combo - количество правильных ответов подряд (для повышения тона).
   */
  public playCorrect(combo: number = 1): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Базовая частота (C5), повышается на полтона с каждым комбо
      // Максимум поднимаемся на 12 полутонов (октава), чтобы не было писка
      const semitoneShift = Math.min(combo - 1, 12);
      const baseFreq = 523.25 * Math.pow(2, semitoneShift / 12);

      // Два восходящих тона
      this.playTone(ctx, baseFreq, now, 0.1, 'sine');
      this.playTone(ctx, baseFreq * 1.2599, now + 0.08, 0.15, 'sine'); // Мажорная терция вверх
    } catch {
      // ignore
    }
  }

  /**
   * Звук ошибки (низкий "бзз", нисходящий).
   */
  public playWrong(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Нисходящий звук (от 200 до 100 Гц)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
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
   * Голос робота: любопытный восходящий "бип" при выборе карточки.
   */
  public playRobotSelect(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      
      // Быстрый подъем частоты (трель)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(400, now + 0.05);
      osc.frequency.setValueAtTime(500, now + 0.1);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // ignore
    }
  }

  /**
   * Голос робота: мощный аккорд при закрытии домика.
   */
  public playRobotHouseDone(): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      
      // Мажорный аккорд
      this.playTone(ctx, 523.25, now, 0.4, 'sine'); // C5
      this.playTone(ctx, 659.25, now, 0.4, 'sine'); // E5
      this.playTone(ctx, 783.99, now, 0.4, 'sine'); // G5
      this.playTone(ctx, 1046.50, now + 0.2, 0.6, 'triangle'); // C6 (добивка)
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