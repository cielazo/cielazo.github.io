window.DB_DATA = window.DB_DATA || {};
DB_DATA.cfg = {
  version: '1.0.0',
  ppm: 2.5,            // píxeles de mundo por metro
  gravity: 980,        // px/s^2
  drag: 0.000075,      // resistencia del aire (cuadrática)
  minV0: 560, maxV0: 1480,
  angleMin: -82, angleMax: -12,   // grados en coordenadas de pantalla (negativo = hacia arriba)
  perfectMin: 0.82, perfectMax: 0.97,
  launcherX: 190, groundY: 612, worldH: 720,
  baseCoinRate: 7,     // 1 moneda por cada 7 m recorridos
  recordBonus: 80
};