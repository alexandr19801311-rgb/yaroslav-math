export type Locale = 'ru' | 'en';

export type TranslationKey =
  // Общие
  | 'app.title'
  // Интерфейс игры
  | 'game.time'
  | 'game.score'
  | 'game.record'
  | 'game.level'
  | 'game.answer'
  | 'game.placeholder'
  | 'game.playAgain'
  | 'game.timeUp'
  | 'game.newRecord'
  | 'game.combo'
  | 'game.comboShort'
  // Игра "Умные весы"
  | 'scales.hintMsg'
  | 'scales.balance';

export type Dictionary = Record<TranslationKey, string>;

export interface TranslationVars {
  [key: string]: string | number;
}