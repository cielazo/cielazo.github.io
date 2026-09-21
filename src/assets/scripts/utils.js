/* Utilidades generales */
window.U = {
  $: (s, r = document) => r.querySelector(s),
  $$: (s, r = document) => [...r.querySelectorAll(s)],
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a),
  randi: (a, b) => Math.floor(U.rand(a, b + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  fmt: n => Math.round(n).toLocaleString('es-MX'),
  kmFmt: m => m >= 1000 ? (m / 1000).toFixed(2).replace('.', '.') + ' km' : Math.round(m) + ' m',
  esc: s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  hash(n){ const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); },
  vib(ms){ try{ if (Storage.get().settings.haptics && navigator.vibrate) navigator.vibrate(ms); }catch(e){} },
  mulberry(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
};