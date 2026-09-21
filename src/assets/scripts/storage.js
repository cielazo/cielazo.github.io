/* Perfil, economía y misiones diarias — persistencia en localStorage */
const SKEY = 'cielazo_v1';

window.Storage = {
  _c: null,
  key: SKEY,
  defaults(){
    return {
      coins: 250,
      ownedChars: ['oveja', 'abuelito'],
      ownedMaps: ['pradera'],
      selChar: 'oveja', selMap: 'pradera',
      upgrades: { rocket:0, balloon:0, magnet:0, jump:0, bouncy:0, launch:0, mult:0 },
      best: { global: 0, byMap: {} },
      stats: { games:0, meters:0, coins:0, items:0 },
      settings: { sound:true, haptics:true },
      tutorial: false,
      missions: { day:'', list: [] }
    };
  },
  get(){
    if (this._c) return this._c;
    try{
      const raw = localStorage.getItem(SKEY);
      this._c = raw ? Object.assign(this.defaults(), JSON.parse(raw)) : this.defaults();
      this._c.upgrades = Object.assign(this.defaults().upgrades, this._c.upgrades);
      this._c.settings = Object.assign(this.defaults().settings, this._c.settings);
    }catch(e){ this._c = this.defaults(); }
    return this._c;
  },
  save(){ try{ localStorage.setItem(SKEY, JSON.stringify(this._c)); }catch(e){} },
  addCoins(n){ this.get().coins = Math.max(0, this.get().coins + n); this.save(); },
  spend(n){ const c = this.get(); if (c.coins < n) return false; c.coins -= n; this.save(); return true; }
};

/* Misiones diarias: 3 por día, elegidas con semilla de la fecha */
window.M = {
  ensure(){
    const st = Storage.get();
    const day = new Date().toISOString().slice(0, 10);
    if (st.missions.day === day && st.missions.list.length) return;
    const rnd = U.mulberry([...day].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7));
    const pool = [...DB.missionPool];
    const list = [];
    while (list.length < 3 && pool.length){
      const i = Math.floor(rnd() * pool.length);
      const m = pool.splice(i, 1)[0];
      list.push({ id:m.id, type:m.type, goal:m.goal, reward:m.reward, text:m.text.replace('{g}', U.fmt(m.goal)), progress:0, done:false, claimed:false });
    }
    st.missions = { day, list };
    Storage.save();
  },
  progress(type, val, absolute = false){
    const st = Storage.get(); let ch = false;
    st.missions.list.forEach(m => {
      if (m.type !== type || m.claimed || m.done) return;
      m.progress = absolute ? Math.max(m.progress, val) : m.progress + val;
      if (m.progress >= m.goal){ m.done = true; m.progress = m.goal; }
      ch = true;
    });
    if (ch) Storage.save();
  },
  claim(id){
    const st = Storage.get();
    const m = st.missions.list.find(x => x.id === id);
    if (!m || m.claimed || !m.done) return 0;
    m.claimed = true; st.coins += m.reward; Storage.save();
    return m.reward;
  },
  readyToClaim(){ return Storage.get().missions.list.filter(m => m.done && !m.claimed).length; }
};