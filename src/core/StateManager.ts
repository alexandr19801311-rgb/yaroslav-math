/**
 * Менеджер состояния и рекордов LogiKids.
 * Единая точка работы с localStorage. Все ключи — с префиксом logikids_.
 */

const STORAGE_PREFIX = 'logikids_';

export class StateManager {
  /**
   * Сохраняет рекорд, если он побит.
   * @returns true, если установлен новый рекорд, иначе false.
   */
  public saveHighScore(gameId: string, score: number): boolean {
    const currentRecord = this.getHighScore(gameId);
    if (score > currentRecord) {
      localStorage.setItem(this.buildKey(gameId), score.toString());
      return true;
    }
    return false;
  }

  /**
   * Возвращает текущий рекорд для игры (0, если рекордов ещё нет).
   */
  public getHighScore(gameId: string): number {
    const raw = localStorage.getItem(this.buildKey(gameId));
    if (raw === null) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  /**
   * Формирует ключ localStorage с единым префиксом платформы.
   */
  private buildKey(gameId: string): string {
    return `${STORAGE_PREFIX}${gameId}`;
  }
}