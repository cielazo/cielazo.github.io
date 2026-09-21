/* Motor del juego: estados ready → aim → fly → done */
window.Game = (function(){
  const { clamp, lerp, rand, randi } = U;

  class Game{
    constructor(opts){
      this.canvas = opts.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.onEnd = opts.onEnd || null;

      const st = Storage.get();
      this.char = DB.char(st.selChar);
      this.map = DB.map(st.selMap);
      this.th = this.map.theme;
      this.cfg = DB.cfg;
      this.spr = World.getSprite(this.char.img);

      this.resize();
      this.state = 'ready';
      this.charR = 34;
      this.p = { x: this.cfg.launcherX, y: this.groundY0() - 90, vx:0, vy:0, ang:0 };
      this.aim = { active:false, power:0, angle:-52, sx:0, sy:0 };
      this.T = { rocket:0, balloon:0, magnet:0, x2:0, glide:0, wind:0, windCd: rand(4, 7) };
      this.rocketDir = { x:1, y:0 }; this.rocketAcc = 0;
      this.coins = []; this.items = []; this.parts = []; this.trail = [];
      this.collected = 0; this.itemsUsed = 0; this.bounceCount = 0; this.perfect = false;
      this.maxX = this.p.x; this.grounded = false; this.slideT = 0; this.doneT = 0;
      this.recoil = 0; this.flash = 0; this.squash = 0;
      this.cam = { x:-40, y:0, shake:0 };
      this.spawnX = 950; this.t = 0; this.last = performance.now();
      this.paused = false; this.done = false;
      this.fx = null; this.fxMax = 1; this.magnetR = 150;

      this.clouds = Array.from({ length:7 }, () => ({ x:rand(0, 2400), y:rand(40, 300), s:rand(.5, 1.15), spd:rand(6, 16) }));

      this.hud = {
        dist: U.$('#hud-dist'), coins: U.$('#hud-coins b'),
        boost: U.$('#boost-chip'), boostFill: U.$('#boost-fill'), boostIcon: U.$('#boost-chip .ic'),
        ab: U.$('#btn-ability'), abUses: U.$('#ab-uses'), abIcon: U.$('#btn-ability .ic')
      };
      this.setupAbility();

      /* Tutorial la primera vez */
      if (!st.tutorial) U.$('#tut').classList.remove('hidden');

      this.bindInput();
      this.raf = requestAnimationFrame(t => this.loop(t));
    }
    groundY0(){ return this.cfg.groundY; }
    computeBounces(){ return (Storage.get().upgrades.bouncy || 0) + (this.char.ability.type === 'bounce' ? 1 : 0); }

    resize(){
      const c = this.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      this.scale = h / 720 * dpr;
      this.vw = w / (h / 720);
    }
    bindInput(){
      const c = this.canvas;
      this._pd = e => {
        if (this.paused) return;
        e.preventDefault();
        if (this.state === 'ready'){
          this.state = 'aim'; this.aim.active = true;
          this.aim.sx = e.clientX; this.aim.sy = e.clientY;
          const tut = U.$('#tut');
          if (tut && !tut.classList.contains('hidden')){ tut.classList.add('hidden'); Storage.get().tutorial = true; Storage.save(); }
        }
      };
      this._pm = e => {
        if (!this.aim.active || this.paused) return;
        const dx = this.aim.sx - e.clientX, dy = this.aim.sy - e.clientY;
        this.aim.power = clamp(Math.hypot(dx, dy) / (this.canvas.clientHeight * .42), 0, 1);
        this.aim.angle = clamp(Math.atan2(dy, dx) * 180 / Math.PI, this.cfg.angleMin, this.cfg.angleMax);
      };
      this._pu = () => {
        if (!this.aim.active) return;
        this.aim.active = false;
        if (this.aim.power > .1) this.launch();
        else { this.state = 'ready'; this.aim.power = 0; }
      };
      this._rs = () => this.resize();
      c.addEventListener('pointerdown', this._pd);
      window.addEventListener('pointermove', this._pm);
      window.addEventListener('pointerup', this._pu);
      window.addEventListener('resize', this._rs);
      c.addEventListener('contextmenu', e => e.preventDefault());
    }
    destroy(){
      cancelAnimationFrame(this.raf);
      const c = this.canvas;
      c.removeEventListener('pointerdown', this._pd);
      window.removeEventListener('pointermove', this._pm);
      window.removeEventListener('pointerup', this._pu);
      window.removeEventListener('resize', this._rs);
    }
    setPaused(v){ this.paused = v; if (v) this.aim.active = false; }

    setupAbility(){
      const ab = this.char.ability;
      if (ab.auto || !ab.uses){ this.hud.ab.classList.add('hidden'); this.uses = 0; return; }
      this.uses = ab.uses;
      this.hud.ab.classList.remove('hidden');
      this.hud.abIcon.innerHTML = ICONS[ab.icon] || ICONS.bolt;
      this.hud.abUses.textContent = ab.uses;
      this.hud.ab.disabled = false;
      this.hud.ab.onclick = () => { if (this.state === 'fly' && this.uses > 0 && !this.paused) this.useAbility(); };
    }
    useAbility(){
      const ab = this.char.ability, p = this.p;
      this.uses--; this.hud.abUses.textContent = this.uses;
      SFX.ability(); U.vib(25);
      if (ab.type === 'dash'){
        const sp = Math.hypot(p.vx, p.vy) || 1;
        p.vx += (p.vx / sp || 1) * 560; p.vy += (p.vy / sp) * 560 - 120;
        this.float('¡BALAR TURBO!', '#FFC93C');
        this.burst(p.x, p.y, '#FFFFFF', 16, 'spark');
      } else if (ab.type === 'magnet'){
        this.T.magnet = 5; this.magnetR = 190;
        this.float('NARIZ DORADA', '#4FB6E8');
      } else if (ab.type === 'glide'){
        this.T.glide = 3;
        this.float('¡PLANEANDO!', '#FFFFFF');
      }
      if (this.uses <= 0) this.hud.ab.disabled = true;
    }

    /* ---------- Lanzamiento ---------- */
    launch(){
      const up = Storage.get().upgrades;
      let pw = this.aim.power * (1 + (up.launch || 0) * .06);
      const perfect = this.aim.power >= this.cfg.perfectMin && this.aim.power <= this.cfg.perfectMax;
      if (perfect){ pw *= 1.08; this.perfect = true; }
      if (this.char.ability.type === 'power') pw *= 1.15;
      const v0 = this.cfg.minV0 + (this.cfg.maxV0 - this.cfg.minV0) * pw;
      const rad = this.aim.angle * Math.PI / 180;
      this.p.vx = v0 * Math.cos(rad); this.p.vy = v0 * Math.sin(rad);
      this.state = 'fly'; this.bounces = this.computeBounces();
      SFX.launch(); U.vib(30);
      this.recoil = 1; this.flash = 1;
      this.cam.shake = Math.min(14, 4 + pw * 10);
      this.burst(this.p.x, this.p.y, '#FFFFFF', 18, 'spark');
      this.burst(this.p.x, this.p.y, World.FB_COLOR.mult, 10, 'cube');
      if (perfect){ SFX.perfect(); this.float('¡PERFECTO!', '#FFC93C'); M.progress('perfect', 1); }
    }

    /* ---------- Spawner de monedas e ítems ---------- */
    pickItemType(){
      const total = DB.items.reduce((a, i) => a + i.w, 0);
      let r = Math.random() * total;
      for (const it of DB.items){ r -= it.w; if (r <= 0) return it; }
      return DB.items[0];
    }
    spawnUntil(xLimit){
      const G = this.cfg.groundY;
      const hBase = () => G - rand(150, 470);
      while (this.spawnX < xLimit){
        const r = Math.random();
        if (r < .40){
          const n = randi(4, 7), y0 = hBase(), slope = rand(-40, 40);
          for (let i = 0; i < n; i++)
            this.coins.push({ x:this.spawnX + i * 52, y:clamp(y0 + slope * i, 120, G - 60), big:false, dead:false });
          this.spawnX += n * 52 + rand(240, 420);
        } else if (r < .60){
          const n = 7, cx = this.spawnX, y0 = hBase();
          for (let i = 0; i < n; i++){
            const t = i / (n - 1);
            this.coins.push({ x:cx + (t - .5) * 300, y:clamp(y0 - Math.sin(t * Math.PI) * 110, 120, G - 60), big:false, dead:false });
          }
          this.spawnX += 340 + rand(260, 420);
        } else if (r < .85){
          const def = this.pickItemType();
          this.items.push({ type:def.id, def, x:this.spawnX, y:hBase(), dead:false, spr:World.getSprite(def.img) });
          if (Math.random() < .5){
            this.coins.push({ x:this.spawnX - 60, y:hBase() - 30, big:false, dead:false });
            this.coins.push({ x:this.spawnX + 60, y:hBase() - 30, big:false, dead:false });
          }
          this.spawnX += rand(320, 520);
        } else if (r < .91){
          this.coins.push({ x:this.spawnX, y:hBase(), big:true, dead:false });
          this.spawnX += rand(300, 450);
        } else this.spawnX += rand(200, 400);
      }
    }

    /* ---------- Efectos de ítems ---------- */
    applyItem(def){
      const lvl = Storage.get().upgrades;
      const p = this.p;
      switch (def.id){
        case 'rocket': {
          const sp = Math.hypot(p.vx, p.vy);
          this.rocketDir = sp > 60 ? { x:p.vx / sp, y:p.vy / sp } : { x:.75, y:-.66 };
          this.rocketAcc = 900 + (lvl.rocket || 0) * 110;
          this.T.rocket = 1.6 + (lvl.rocket || 0) * .5;
          this.fx = 'rocket'; this.fxMax = this.T.rocket;
          SFX.boost(); break;
        }
        case 'balloon': this.T.balloon = 2 + (lvl.balloon || 0) * .6; this.fx = 'balloon'; this.fxMax = this.T.balloon; SFX.balloon(); break;
        case 'magnet': this.T.magnet = 4 + (lvl.magnet || 0); this.magnetR = 150 + (lvl.magnet || 0) * 30; this.fx = 'magnet'; this.fxMax = this.T.magnet; SFX.ability(); break;
        case 'tramp': this.p.vy = -(700 + (lvl.jump || 0) * 90); this.grounded = false; SFX.bounce(); this.cam.shake = 6; break;
        case 'mattress': this.bounces = (this.bounces || 0) + 2; SFX.ability(); break;
        case 'star': this.collected += this.T.x2 > 0 ? 50 : 25; SFX.gem(); break;
        case 'mult': this.T.x2 = 10; this.fx = 'mult'; this.fxMax = 10; SFX.gem(); break;
      }
    }

    /* ---------- Partículas ---------- */
    burst(x, y, color, n, type = 'cube'){
      for (let i = 0; i < n; i++){
        const a = rand(0, Math.PI * 2), sp = rand(60, 340);
        this.parts.push({ type, x, y, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp - 120,
          life:rand(.4, .9), max:.9, s:rand(5, 11), color, rot:rand(0, 6) });
      }
      if (this.parts.length > 260) this.parts.splice(0, this.parts.length - 260);
    }
    dust(n){
      const G = this.cfg.groundY;
      for (let i = 0; i < n; i++)
        this.parts.push({ type:'spark', x:this.p.x + rand(-24, 24), y:G - rand(0, 10),
          vx:rand(-120, 120), vy:rand(-160, -30), life:rand(.3, .7), max:.7, s:rand(4, 9), color:'rgba(255,255,255,.85)', rot:0 });
    }
    textPart(text, x, y, color, size = 22){
      this.parts.push({ type:'text', x, y, vx:0, vy:-70, life:1, max:1, text, color, size });
    }
    float(text, color){ this.textPart(text, this.p.x, this.p.y - 70, color, 24); }
    updateParts(dt){
      for (const p of this.parts){
        p.life -= dt;
        if (p.type !== 'text'){ p.vy += 700 * dt; p.rot += dt * 5; }
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      this.parts = this.parts.filter(p => p.life > 0);
      for (const t of this.trail) t.life -= dt;
      this.trail = this.trail.filter(t => t.life > 0);
    }

    /* ---------- Bucle ---------- */
    loop(now){
      this.raf = requestAnimationFrame(t => this.loop(t));
      let dt = Math.min((now - this.last) / 1000, .033);
      this.last = now;
      if (!this.paused){ this.t += dt; this.update(dt); }
      this.render();
    }
    update(dt){
      this.clouds.forEach(c => c.x -= c.spd * dt);
      this.recoil = Math.max(0, this.recoil - dt * 3);
      this.flash = Math.max(0, this.flash - dt * 4);
      this.squash = Math.max(0, this.squash - dt * 4);
      this.updateParts(dt);

      if (this.state === 'ready' || this.state === 'aim'){
        const rad = this.aim.angle * Math.PI / 180;
        this.p.x = this.cfg.launcherX + Math.cos(rad) * 118;
        this.p.y = this.cfg.groundY - 56 + Math.sin(rad) * 118;
        this.p.ang = rad * .3;
        this.cam.x = lerp(this.cam.x, this.cfg.launcherX - 160, 6 * dt);
        this.cam.y = lerp(this.cam.y, 0, 6 * dt);
        return;
      }
      if (this.state !== 'fly') return;

      const p = this.p, cfg = this.cfg, T = this.T;

      if (this.grounded){
        p.y = cfg.groundY; p.vy = 0;
        const fr = this.th.slippery ? .55 : 1.9;
        p.vx -= p.vx * fr * dt;
        this.slideT += dt;
        if (Math.abs(p.vx) > 140 && Math.random() < dt * 18) this.dust(1);
        p.ang = lerp(p.ang, 0, 8 * dt);
        if (Math.abs(p.vx) < 45 || this.slideT > 2.4) return this.finish();
      } else {
        for (const k of ['rocket','balloon','magnet','x2','glide']) if (T[k] > 0) T[k] -= dt;
        if (this.th.wind){
          T.windCd -= dt;
          if (T.windCd <= 0){ T.wind = 2.4; T.windCd = rand(5, 9); this.float('¡VIENTO DE COLA!', '#8ADCF5'); }
          if (T.wind > 0){ T.wind -= dt; p.vx += 240 * dt; }
        }
        let g = cfg.gravity * (this.char.ability.type === 'lowgrav' ? .9 : 1);
        if (T.glide > 0) g *= .22;
        if (T.balloon > 0) g *= .15;
        if (T.rocket > 0) g *= .5;
        p.vy += g * dt;
        if (T.rocket > 0){
          p.vx += this.rocketDir.x * this.rocketAcc * dt;
          p.vy += this.rocketDir.y * this.rocketAcc * dt;
          if (Math.random() < dt * 40) this.parts.push({ type:'spark', x:p.x - this.rocketDir.x * 30, y:p.y - this.rocketDir.y * 30,
            vx:-this.rocketDir.x * 200 + rand(-40, 40), vy:-this.rocketDir.y * 200 + rand(-40, 40),
            life:.35, max:.35, s:rand(4, 8), color:Math.random() < .5 ? '#FFC93C' : '#FF6B57', rot:0 });
        }
        const sp = Math.hypot(p.vx, p.vy);
        p.vx -= p.vx * cfg.drag * sp * dt;
        p.vy -= p.vy * cfg.drag * sp * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        this.maxX = Math.max(this.maxX, p.x);
        this.trailT = (this.trailT || 0) - dt;
        if (this.trailT <= 0 && sp > 220){
          this.trail.push({ x:p.x, y:p.y, life:.45, max:.45 });
          this.trailT = .035;
        }
        const targ = Math.atan2(p.vy, Math.max(120, p.vx)) * .55;
        p.ang = lerp(p.ang, clamp(targ, -.7, .9), 10 * dt);
        if (p.y < -1300){ p.y = -1300; p.vy = Math.max(p.vy, 0); }
        if (p.y >= cfg.groundY) this.touchGround();
      }

      /* cámara */
      const tx = p.x - 280 - (p.vx > 900 ? 120 : 0);
      this.cam.x = lerp(this.cam.x, Math.max(-60, tx), 5 * dt);
      const ty = p.y < 330 ? p.y - 300 : 0;
      this.cam.y = lerp(this.cam.y, Math.min(0, ty), 5 * dt);

      /* spawn y limpieza */
      this.spawnUntil(this.cam.x + this.vw + 700);
      this.coins = this.coins.filter(c => !c.dead && c.x > this.cam.x - 180);
      this.items = this.items.filter(i => !i.dead && i.x > this.cam.x - 180);

      /* imán */
      if (T.magnet > 0){
        for (const c of this.coins){
          const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
          if (d < this.magnetR){ c.x += dx * 8 * dt; c.y += dy * 8 * dt; }
        }
      }
      /* recolección */
      for (const c of this.coins){
        if (c.dead) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < 52){
          c.dead = true;
          const v = (c.big ? 5 : 1) * (T.x2 > 0 ? 2 : 1);
          this.collected += v;
          SFX.coin();
          this.textPart('+' + v, c.x, c.y - 14, c.big ? '#FFEB86' : '#FFD94E', 18);
          this.burst(c.x, c.y, '#FFE08A', c.big ? 8 : 5, 'spark');
        }
      }
      for (const it of this.items){
        if (it.dead) continue;
        if (Math.hypot(p.x - it.x, p.y - it.y) < 64){
          it.dead = true; this.itemsUsed++;
          this.applyItem(it.def);
          this.float(it.def.label, it.def.color);
          this.burst(it.x, it.y, it.def.color, 14, 'cube');
          M.progress('items', 1);
        }
      }

      /* HUD */
      this.hud.dist.textContent = U.kmFmt(Math.max(0, Math.round((this.maxX - cfg.launcherX) / cfg.ppm)));
      this.hud.coins.textContent = this.collected;
      const fxOn = T.rocket > 0 ? ['rocket', T.rocket] : T.glide > 0 ? ['wind', T.glide] : T.balloon > 0 ? ['balloon', T.balloon] : T.magnet > 0 ? ['magnet', T.magnet] : T.x2 > 0 ? ['x2', T.x2] : null;
      if (fxOn){
        this.hud.boost.classList.remove('hidden');
        this.hud.boostIcon.innerHTML = ICONS[fxOn[0]];
        this.hud.boostFill.style.width = (fxOn[1] / this.fxMax * 100) + '%';
      } else this.hud.boost.classList.add('hidden');
    }
    touchGround(){
      const p = this.p;
      p.y = this.cfg.groundY;
      if (this.bounces > 0 && Math.abs(p.vy) > 190){
        p.vy = -p.vy * (this.th.slippery ? .63 : .58);
        p.vx *= .94;
        this.bounces--; this.bounceCount++;
        this.grounded = false;
        SFX.bounce(); U.vib(20);
        this.float('¡REBOTE!', '#FFFFFF');
        this.dust(10); this.cam.shake = 6; this.squash = .18;
        M.progress('bounces', 1);
      } else {
        if (!this.grounded){
          SFX.land(); U.vib(40);
          this.dust(16);
          this.cam.shake = Math.min(12, Math.abs(p.vy) / 60);
          this.squash = .25;
        }
        this.grounded = true; this.slideT = 0; p.vy = 0;
      }
    }
    finish(){
      if (this.done) return;
      this.done = true; this.state = 'done'; this.doneT = 0;
      const meters = Math.max(0, Math.round((this.maxX - this.cfg.launcherX) / this.cfg.ppm));
      const up = Storage.get().upgrades;
      const base = Math.floor(meters / this.cfg.baseCoinRate);
      let total = Math.round((this.collected + base) * (1 + (up.mult || 0) * .10) * (this.th.coinMult || 1));
      const st = Storage.get();
      const isRecord = meters > (st.best.byMap[this.map.id] || 0);
      if (isRecord){ st.best.byMap[this.map.id] = meters; total += this.cfg.recordBonus; }
      if (meters > st.best.global) st.best.global = meters;
      st.coins += total;
      st.stats.games++; st.stats.meters += meters; st.stats.coins += total; st.stats.items += this.itemsUsed;
      M.progress('coins', this.collected);
      M.progress('meters_total', meters, true);
      M.progress('runDist', meters, true);
      Storage.save();
      if (isRecord) SFX.record();
      this.burst(this.p.x, this.p.y - 40, '#FFC93C', 16, 'cube');
      this.burst(this.p.x, this.p.y - 40, '#FF6B57', 12, 'cube');
      setTimeout(() => this.onEnd && this.onEnd({
        meters, collected:this.collected, base, total, record:isRecord, perfect:this.perfect
      }), 750);
    }

    /* ---------- Render ---------- */
    render(){
      const ctx = this.ctx, vw = this.vw, t = this.t;
      ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
      const shx = (Math.random() - .5) * this.cam.shake, shy = (Math.random() - .5) * this.cam.shake;
      this.cam.shake *= .9;

      World.drawSky(ctx, vw, this.th);
      World.drawSun(ctx, vw * this.th.sun.x, this.th.sun.y * 720 - this.cam.y * .12, this.th.sun, this.th);
      if (this.th.stars) World.drawStars(ctx, vw, t);

      const cx = this.cam.x, cy = this.cam.y, G = this.cfg.groundY;
      ctx.save(); ctx.translate(-cx + shx, -cy + shy);

      for (const c of this.clouds){
        const sx = ((c.x - cx * .12) % (vw + 500) + vw + 500) % (vw + 500) - 250;
        World.drawCloud(ctx, sx + cx, c.y + cy * .7, c.s, this.th);
      }
      World.drawMountains(ctx, cx, vw, this.th, cy);
      World.drawHills(ctx, cx, vw, this.th, cy);
      World.drawGround(ctx, cx, vw, this.th, cy);

      /* letreros cada 250 m (posición de mundo exacta) */
      {
        const sp = 250 * this.cfg.ppm, LX = this.cfg.launcherX;
        const i0 = Math.max(1, Math.floor((cx - LX - 140) / sp)), i1 = Math.ceil((cx + vw + 140 - LX) / sp);
        for (let i = i0; i <= i1; i++) World.drawSign(ctx, i * sp + LX, G, i * 250);
      }
      World.drawDecor(ctx, cx, vw, this.th, cy, t);

      /* viento */
      if (this.T.wind > 0){
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++){
          const y = 120 + i * 80 + Math.sin(t * 3 + i) * 10;
          const x = ((t * 900 + i * 260) % (vw + 300)) - 150 + cx;
          ctx.beginPath(); ctx.moveTo(x, y + cy); ctx.lineTo(x + 70, y + cy); ctx.stroke();
        }
      }

      /* monedas e ítems */
      for (const c of this.coins) World.drawCoin(ctx, c.x, c.y, t, c.big);
      for (const it of this.items) World.drawItem(ctx, it, t);

      /* estela */
      for (const tr of this.trail){
        ctx.globalAlpha = tr.life / tr.max * .5;
        World.blockC(ctx, tr.x, tr.y + 14, 16, 10, 16, '#FFFFFF');
      }
      ctx.globalAlpha = 1;

      /* globo del ítem globo */
      if (this.T.balloon > 0){
        const p = this.p;
        ctx.fillStyle = '#FF9F45';
        ctx.beginPath(); ctx.ellipse(p.x - 34, p.y - 110, 26, 30, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#7A5A3B'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x - 34, p.y - 80); ctx.lineTo(p.x - 18, p.y - 30); ctx.stroke();
      }

      /* personaje */
      const p = this.p;
      if (p.y < G - 4){
        const k = clamp(1 - (G - p.y) / 520, .25, 1);
        ctx.fillStyle = `rgba(23,58,79,${.16 * k})`;
        ctx.beginPath(); ctx.ellipse(p.x, G + 12, 34 * k, 9 * k, 0, 0, 7); ctx.fill();
      }
      let wob = 0;
      if (this.state === 'done'){ this.doneT += 1 / 60; wob = Math.max(0, .25 - this.doneT * .3) * Math.sin(this.t * 22); }
      World.drawChar(ctx, p.x, p.y, this.char, {
        angle:p.ang + wob, spr:this.spr,
        sy:1 - this.squash * 1.1, sx:1 + this.squash * .5
      });
      if (this.state === 'done'){
        for (let k = 0; k < 3; k++){
          const a = this.t * 3 + k * 2.1;
          World.drawCoin(ctx, p.x + Math.cos(a) * 40, p.y - 70 + Math.sin(a) * 14, t, false);
        }
      }

      /* partículas */
      for (const pt of this.parts){
        const a = clamp(pt.life / pt.max, 0, 1);
        if (pt.type === 'text'){
          ctx.globalAlpha = a;
          ctx.font = `700 ${pt.size}px Fredoka, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.9)';
          ctx.strokeText(pt.text, pt.x, pt.y);
          ctx.fillStyle = pt.color; ctx.fillText(pt.text, pt.x, pt.y);
        } else if (pt.type === 'spark'){
          ctx.globalAlpha = a; ctx.fillStyle = pt.color;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.s * a, 0, 7); ctx.fill();
        } else {
          ctx.globalAlpha = a;
          World.blockC(ctx, pt.x, pt.y, pt.s, pt.s * .6, pt.s, pt.color);
        }
      }
      ctx.globalAlpha = 1;

      /* cañón y apuntado */
      if (this.state !== 'done'){
        World.drawLauncher(ctx, this.cfg.launcherX, G, this.aim.angle, this.aim.power,
          this.state === 'aim', this.recoil, this.flash);
        if (this.state === 'aim' && this.aim.power > .02){
          const up = Storage.get().upgrades;
          let pw = this.aim.power * (1 + (up.launch || 0) * .06);
          if (this.perfect) pw *= 1.08;
          if (this.char.ability.type === 'power') pw *= 1.15;
          const v0 = this.cfg.minV0 + (this.cfg.maxV0 - this.cfg.minV0) * pw;
          const rad = this.aim.angle * Math.PI / 180;
          let sx = this.p.x, sy = this.p.y, vx = v0 * Math.cos(rad), vy = v0 * Math.sin(rad);
          for (let i = 0; i < 17; i++){
            vy += this.cfg.gravity * .055; sx += vx * .055; sy += vy * .055;
            if (sy > G) break;
            ctx.globalAlpha = .85 - i * .045;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(sx, sy, 7 - i * .3, 0, 7); ctx.fill();
          }
          ctx.globalAlpha = 1;
          const mx = this.cfg.launcherX, my = G - 96;
          ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(255,255,255,.4)';
          ctx.beginPath(); ctx.arc(mx, my, 54, -Math.PI, 0); ctx.stroke();
          ctx.strokeStyle = '#FFC93C';
          const a0 = -Math.PI + Math.PI * this.cfg.perfectMin, a1 = -Math.PI + Math.PI * this.cfg.perfectMax;
          ctx.beginPath(); ctx.arc(mx, my, 54, a0, a1); ctx.stroke();
          const col = this.aim.power >= this.cfg.perfectMin && this.aim.power <= this.cfg.perfectMax ? '#FFC93C' : '#FFFFFF';
          ctx.strokeStyle = col;
          ctx.beginPath(); ctx.arc(mx, my, 54, -Math.PI, -Math.PI + Math.PI * this.aim.power); ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 24px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.strokeText(Math.round(this.aim.power * 100) + '%', mx, my - 74);
          ctx.fillText(Math.round(this.aim.power * 100) + '%', mx, my - 74);
        } else if (this.state === 'ready'){
          const pu = .5 + .5 * Math.sin(t * 4);
          ctx.strokeStyle = `rgba(255,255,255,${.5 + pu * .4})`; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(this.p.x, this.p.y - 46, 40 + pu * 8, 0, 7); ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  return Game;
})();