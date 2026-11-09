/**
 * Типы локализации LogiKids.
 * TranslationKey — строгий union всех ключей.
 * Расширяется по мере добавления строк.
 */

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
  | 'scales.hintMsg'
  | 'scales.hintMsg'
  | 'game.answer';

export type Dictionary = Record<TranslationKey, string>;

export interface TranslationVars {
  [key: string]: string | number;
}