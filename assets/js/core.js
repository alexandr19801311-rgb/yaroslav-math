// ============================================================
// CORE.JS — Ядро платформы: звуки, сохранение, утилиты
// ============================================================

export const $ = id => document.getElementById(id);

// ===== Звуки (Web Audio API) =====
let audioCtx = null;

export function tone(freq, dur = 0.12, type = 'sine') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

export const sndPlace = () => { 
  tone(1200, 0.05, 'triangle'); 
  setTimeout(() => tone(1500, 0.05, 'sine'), 40);
};
export const sndBad = () => tone(220, 0.18, 'square');
export const sndHouseDone = () => { [523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,0.12),i*100)); };
export const sndWin = () => { [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,0.15),i*120)); };
export const sndHint = () => tone(800, 0.1, 'sine');

// ===== Утилиты =====
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Сохранение прогресса =====
const STORAGE_PREFIX = 'math_platform_';

export function saveProgress(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch(e) {}
}

export function loadProgress(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch(e) { return fallback; }
}

export function clearProgress(key) {
  try { localStorage.removeItem(STORAGE_PREFIX + key); } catch(e) {}
}

// ===== Бейдж «Прогресс сохранён» =====
let savedBadgeTimer = null;
export function showSavedBadge(text = '💾 Прогресс сохранён') {
  const b = $('savedBadge');
  if (!b) return;
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(savedBadgeTimer);
  savedBadgeTimer = setTimeout(() => b.classList.remove('show'), 1200);
}

// ===== Оверлей =====
export function showOverlay(title, text, score) {
  const ov = $('overlay');
  if (!ov) return;
  $('overTitle').textContent = title;
  $('overText').textContent = text;
  $('finalScore').textContent = score;
  ov.classList.add('show');
}

export function hideOverlay() {
  const ov = $('overlay');
  if (ov) ov.classList.remove('show');
}

// ===== Конфетти =====
export function fireConfetti() {
  const colors = ['#e53935','#fb8c00','#fdd835','#7cb342','#1e88e5','#5e35b1','#d81b60'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = (Math.random() * 0.6) + 's';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
