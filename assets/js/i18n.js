// ============================================================
// I18N.JS — Движок мультиязычности (рабочая версия)
// ============================================================

let currentLang = 'ru';
let translations = {};

export async function loadLocale(lang) {
  try {
    const response = await fetch(`assets/locales/${lang}.json`);
    if (!response.ok) throw new Error('not found');
    translations = await response.json();
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem('math_platform_lang', lang); } catch(e) {}
    return true;
  } catch(e) {
    console.warn('Locale load failed:', lang, e);
    return false;
  }
}

export function t(key) {
  if (!translations || Object.keys(translations).length === 0) {
    return key;
  }
  const parts = key.split('.');
  let value = translations;
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return key;
    }
  }
  return value || key;
}

export function getLang() {
  return currentLang;
}

export async function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('math_platform_lang'); } catch(e) {}
  const browserLang = (navigator.language || 'ru').split('-')[0];
  const lang = saved || browserLang || 'ru';
  const loaded = await loadLocale(lang);
  if (!loaded) await loadLocale('ru');
}
