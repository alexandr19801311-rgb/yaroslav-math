import { StateManager } from '../../core/StateManager';
import { Timer } from '../../core/Timer';

export abstract class BaseGame {
  protected abstract gameId: string;       // Уникальный ID игры для сохранения рекордов
  protected score: number = 0;              // Текущие очки игрока
  protected isRunning: boolean = false;     // Статус игры (идет или на паузе)
  protected addScore(points: number): void {
  if (this.isRunning) {
    this.score += points;
  }
}

  // Общие инструменты для всех игр
  protected timer: Timer;
  protected stateManager: StateManager;

  constructor(timeLimitSeconds: number = 60) {
    this.timer = new Timer(timeLimitSeconds, () => this.onTimeUp());
    this.stateManager = new StateManager();
  }

  // Методы жизненного цикла игры, которые DeepSeek ОБЯЗАН реализовать внутри каждой игры
  public abstract init(): void;             // Первичная отрисовка и подготовка игрового поля
  protected abstract generateTask(): void;   // Генерация нового математического примера
  protected abstract checkAnswer(answer: any): boolean; // Проверка ответа игрока

  // Универсальные встроенные методы (DeepSeek не должен переписывать их заново)
  public start(): void {
    this.score = 0;
    this.isRunning = true;
    this.timer.start((timeLeft) => this.updateTimerUI(timeLeft));
    this.generateTask();
    console.log(`Игра ${this.gameId} началась!`);
  }

  public pause(): void {
    this.isRunning = false;
    this.timer.pause();
  }

  protected onTimeUp(): void {
    this.isRunning = false;
    this.stateManager.saveHighScore(this.gameId, this.score);
    this.showGameOverScreen();
  }

  // Вспомогательные UI методы (будут переопределяться или наследоваться)
  protected updateTimerUI(timeLeft: number): void {
    const timerEl = document.getElementById('game-timer');
    if (timerEl) timerEl.textContent = `Время: ${timeLeft}с`;
  }

  protected showGameOverScreen(): void {
    alert(`Время вышло! Ваш результат: ${this.score}. Рекорд сохранен!`);
  }
}
