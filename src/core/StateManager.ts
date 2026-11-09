export class StateManager {
  private prefix = 'yaroslav_math_';

  public saveHighScore(gameId: string, score: number): boolean {
    const currentRecord = this.getHighScore(gameId);
    if (score > currentRecord) {
      localStorage.setItem(`${this.prefix}${gameId}`, score.toString());
      return true; // Рекорд побит!
    }
    return false; // Рекорд не побит
  }

  public getHighScore(gameId: string): number {
    const record = localStorage.getItem(`${this.prefix}${gameId}`);
    return record ? parseInt(record, 10) : 0;
  }
}
