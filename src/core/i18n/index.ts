import type { Dictionary, Locale, TranslationKey, TranslationVars } from './types';
import { ru } from './locales/ru';
import { en } from './locales/en';

const LOCALE_STORAGE_KEY = 'logikids_locale';
const DEFAULT_LOCALE: Locale = 'ru';
const SUPPORTED_LOCALES: ReadonlyArray<Locale> = ['ru', 'en'];

const DICTIONARIES: Record<Locale, Dictionary> = { ru, en };

/**
 * Определяет стартовую локаль:
 * 1. Сохранённый выбор пользователя (localStorage).
 * 2. Язык системы (navigator.language), если поддерживается.
 * 3. Fallback — ru.
 */
function detectInitialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored !== null && isSupportedLocale(stored)) {
    return stored;
  }

  const systemLang = navigator.language.toLowerCase();
  const base = systemLang.split('-')[0];
  if (isSupportedLocale(base)) {
    return base;
  }

  return DEFAULT_LOCALE;
}

function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(value);
}

let currentLocale: Locale = detectInitialLocale();

/**
 * Возвращает текущую локаль.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Устанавливает локаль вручную (например, из переключателя языка)
 * и сохраняет выбор в localStorage.
 */
export function setLocale(locale: Locale): void {
  if (!isSupportedLocale(locale)) return;
  currentLocale = locale;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/**
 * Основная функция перевода.
 * Поддерживает подстановку переменных вида {name}.
 * При отсутствии перевода возвращает сам ключ (безопасный fallback).
 */
export function t(key: TranslationKey, vars?: TranslationVars): string {
  const dict = DICTIONARIES[currentLocale];
  const template = dict[key] ?? key;
  if (vars === undefined) return template;
  return interpolate(template, vars);
}

function interpolate(template: string, vars: TranslationVars): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value !== undefined ? String(value) : match;
  });
}