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
  | 'game.menu'
  // Игра "Умные весы"
  | 'scales.hintMsg'
  | 'scales.balance'
  // Игра "Домики"
  | 'houses.title'
  | 'houses.collected'
  | 'houses.cards'
  | 'houses.number'
  | 'houses.allPlaced'
  | 'houses.winTitle'
  | 'houses.winDesc';

export type Dictionary = Record<TranslationKey, string>;

export interface TranslationVars {
  [key: string]: string | number;
}