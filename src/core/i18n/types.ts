export type Locale = 'ru' | 'en';

export type TranslationKey =
  // Общие
  | 'app.title'
  | 'game.score'
  | 'game.playAgain'
  | 'game.menu'
  | 'game.timeUp'
  | 'game.newRecord'
  // Домики
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