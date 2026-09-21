window.DB_DATA = window.DB_DATA || {};

/* Mejoras comprables con monedas (5 niveles cada una) */
DB_DATA.upgrades = [
  { id:'rocket', name:'Cohete', icon:'rocket', color:'#FF6B57', desc:'Al tocarlo te impulsa en la dirección en la que vas.', max:5, baseCost:150, growth:1.85,
    eff: l => `${(1.6 + l * 0.5).toFixed(1)} s de empuje` },
  { id:'balloon', name:'Globo', icon:'balloon', color:'#FF9F45', desc:'Frena tu caída por unos segundos.', max:5, baseCost:130, growth:1.8,
    eff: l => `${(2 + l * 0.6).toFixed(1)} s flotando` },
  { id:'magnet', name:'Imán', icon:'magnet', color:'#4FB6E8', desc:'Atrae monedas cercanas al recogerse.', max:5, baseCost:120, growth:1.8,
    eff: l => `${4 + l} s de atracción` },
  { id:'jump', name:'Trampolín', icon:'spring', color:'#59C98A', desc:'Te lanza hacia arriba al tocarlo.', max:5, baseCost:140, growth:1.8,
    eff: l => `impulso ${700 + l * 90}` },
  { id:'bouncy', name:'Colchoneta de cañón', icon:'mattress', color:'#B07CE8', desc:'Rebotes automáticos al aterrizar.', max:5, baseCost:200, growth:1.9,
    eff: l => l === 0 ? 'sin rebotes automáticos' : `${l} rebote${l > 1 ? 's' : ''} automático${l > 1 ? 's' : ''}` },
  { id:'launch', name:'Turbolanzador', icon:'gauge', color:'#FFC93C', desc:'Más potencia base en cada disparo del cañón.', max:5, baseCost:250, growth:2.0,
    eff: l => `+${l * 6}% potencia` },
  { id:'mult', name:'Suerte Dorada', icon:'coin', color:'#E8A200', desc:'Multiplica las monedas ganadas al final del vuelo.', max:5, baseCost:300, growth:2.0,
    eff: l => `+${l * 10}% monedas` }
];

/* Paquetes de monedas con dinero real (SOLO VISUAL en esta demo) */
DB_DATA.packs = [
  { id:'pk1', name:'Puñado de monedas', coins:120,  price:'$17.00 MXN', img:'coins-small.png' },
  { id:'pk2', name:'Bolsa de monedas',  coins:350,  price:'$39.00 MXN', img:'coins-medium.png', tag:'Popular' },
  { id:'pk3', name:'Cofre de monedas',  coins:750,  price:'$79.00 MXN', img:'coins-large.png', tag:'-10%' },
  { id:'pk4', name:'Tesoro de monedas', coins:2000, price:'$189.00 MXN', img:'coins-mega.png', tag:'Mejor valor' }
];

/* Objetos de ayuda que aparecen en el mapa (img = tu PNG, si existe) */
DB_DATA.items = [
  { id:'rocket',   w:22, img:'item_cohete.png',    color:'#FF6B57', label:'¡COHETE!' },
  { id:'balloon',  w:18, img:'item_globo.png',     color:'#FF9F45', label:'¡GLOBO!' },
  { id:'magnet',   w:16, img:'item_iman.png',      color:'#4FB6E8', label:'¡IMÁN!' },
  { id:'tramp',    w:16, img:'item_trampolin.png', color:'#59C98A', label:'¡TRAMPOLÍN!' },
  { id:'mattress', w:10, img:'item_colchoneta.png',color:'#B07CE8', label:'+2 REBOTES' },
  { id:'star',     w:12, img:'item_estrella.png',  color:'#FFC93C', label:'+25' },
  { id:'mult',     w:6,  img:'item_x2.png',        color:'#FF6B57', label:'¡x2!' }
];

/* Banco de misiones diarias */
DB_DATA.missionPool = [
  { id:'d1', type:'runDist', goal:350, reward:60, text:'Llega a {g} m en una partida' },
  { id:'d2', type:'runDist', goal:700, reward:120, text:'Llega a {g} m en una partida' },
  { id:'c1', type:'coins', goal:40, reward:60, text:'Recoge {g} monedas hoy' },
  { id:'c2', type:'coins', goal:90, reward:110, text:'Recoge {g} monedas hoy' },
  { id:'i1', type:'items', goal:3, reward:70, text:'Usa {g} objetos en vuelo' },
  { id:'b1', type:'bounces', goal:5, reward:50, text:'Rebota {g} veces' },
  { id:'p1', type:'perfect', goal:1, reward:80, text:'Logra 1 lanzamiento PERFECTO' },
  { id:'m1', type:'meters_total', goal:1500, reward:90, text:'Acumula {g} m hoy' }
];