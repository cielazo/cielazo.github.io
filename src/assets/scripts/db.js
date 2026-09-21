/* Acceso a los datos del juego */
window.DB = {
  cfg: DB_DATA.cfg,
  chars: DB_DATA.characters, maps: DB_DATA.maps,
  upgrades: DB_DATA.upgrades, packs: DB_DATA.packs,
  items: DB_DATA.items, missionPool: DB_DATA.missionPool,
  char(id){ return this.chars.find(c => c.id === id) || this.chars[0]; },
  map(id){ return this.maps.find(m => m.id === id) || this.maps[0]; },
  upg(id){ return this.upgrades.find(u => u.id === id); },
  upgCost(u, lvl){ return Math.max(10, Math.round(u.baseCost * Math.pow(u.growth, lvl) / 10) * 10); },
  img(name){ return '../assets/images/' + name; }
};