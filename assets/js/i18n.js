// ============================================================
// I18N.JS — Заглушка для мультиязычности (пока только RU)
// ============================================================

export function getLang() {
  return 'ru';
}

export function t(key) {
  return key;
}

export function loadLocale(lang) {
  return Promise.resolve(true);
}

export function initLang() {
  return Promise.resolve();
}
