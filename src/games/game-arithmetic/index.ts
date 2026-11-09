import { BaseGame } from '../base/BaseGame';

export class ArithmeticGame extends BaseGame {
  protected gameId = 'arithmetic';
  private currentAnswer: number = 0;

  // DOM элементы игрового интерфейса
  private problemEl!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;

  public init(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    // Отрисовываем интерфейс игры внутри контейнера
    container.innerHTML = `
      <div class="game-card">
        <h2 id="game-timer">Время: 60с</h2>
        <div class="score-box">Очки: <span id="game-score">0</span></div>
        <div class="problem-display" id="problem-text">Загрузка...</div>
        <div class="input-zone">
          <input type="number" id="answer-input" placeholder="?" autofocus />
          <button id="submit-btn">Ответить</button>
        </div>
      </div>
    `;

    // Кэшируем элементы
    this.problemEl = document.getElementById('problem-text')!;
    this.inputEl = document.getElementById('answer-input') as HTMLInputElement;
    this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

    // Навешиваем события
    this.submitBtn.addEventListener('click', () => this.handleAnswerSubmit());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleAnswerSubmit();
    });

    // Запускаем игровой цикл из родительского класса
    this.start();
  }

  protected generateTask(): void {
    const isAddition = Math.random() > 0.5;
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;

    if (isAddition) {
      // Сумма не должна превышать 20
      while (a + b > 20) {
        a = Math.floor(Math.random() * 15) + 1;
        b = Math.floor(Math.random() * 15) + 1;
      }
      this.currentAnswer = a + b;
      this.problemEl.textContent = `${a} + ${b} =`;
    } else {
      // Чтобы не было отрицательных чисел
      if (a < b) {
        const temp = a;
        a = b;
        b = temp;
      }
      this.currentAnswer = a - b;
      this.problemEl.textContent = `${a} - ${b} =`;
    }

    this.inputEl.value = '';
    this.inputEl.focus();
  }

  private handleAnswerSubmit(): void {
    if (!this.isRunning) return;

    const userAnswer = parseInt(this.inputEl.value, 10);
    if (isNaN(userAnswer)) return;

    this.checkAnswer(userAnswer);
  }

  protected checkAnswer(answer: number): boolean {
    if (answer === this.currentAnswer) {
      this.score += 10; // Увеличиваем очки в BaseGame
      document.getElementById('game-score')!.textContent = this.score.toString();
      this.generateTask();
      return true;
    } else {
      // Небольшое визуальное покачивание при ошибке
      this.inputEl.classList.add('error-shake');
      setTimeout(() => this.inputEl.classList.remove('error-shake'), 300);
      return false;
    }
  }
}
