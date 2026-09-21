/* Pintor isométrico procedural: bloques 2:1 con 3 tonos, mundo low-poly */
window.World = (function(){
    function shade(hex, f){
    let r, g, b;
    if (hex[0] === '#'){
      const n = parseInt(hex.slice(1), 16);
      r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255;
    } else {
      const m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(hex);
      if (!m) return hex;
      r = +m[1]; g = +m[2]; b = +m[3];
    }
    if (f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }
  function poly(ctx, pts){
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }
  /* Bloque isométrico: cx, cy = base frontal; w ancho, d profundidad, h alto */
  function block(ctx, cx, cy, w, d, h, top, left, right){
    const w2 = w / 2, d2 = d / 2;
    ctx.fillStyle = right; poly(ctx, [[cx,cy],[cx+w2,cy-d2],[cx+w2,cy-d2-h],[cx,cy-h]]);
    ctx.fillStyle = left;  poly(ctx, [[cx,cy],[cx-w2,cy-d2],[cx-w2,cy-d2-h],[cx,cy-h]]);
    ctx.fillStyle = top;   poly(ctx, [[cx,cy-h],[cx+w2,cy-d2-h],[cx,cy-2*d2-h],[cx-w2,cy-d2-h]]);
  }
  function blockC(ctx, cx, cy, w, d, h, color){ block(ctx, cx, cy, w, d, h, shade(color, .22), color, shade(color, -.24)); }
  function rr(ctx, x, y, w, h, r){
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* Caché de sprites del usuario (con flag ok si la imagen existe) */
  const SPR = {};
  function getSprite(name){
    if (!name) return null;
    if (SPR[name]) return SPR[name];
    const rec = { el: new Image(), ok: false };
    rec.el.onload = () => rec.ok = true;
    rec.el.onerror = () => rec.ok = false;
    rec.el.src = DB.img(name);
    SPR[name] = rec; return rec;
  }

  /* ---------- Cielo y fondo ---------- */
  function drawSky(ctx, w, th){
    ctx.fillStyle = th.sky[0]; ctx.fillRect(0, 0, w, 720 * .48);
    ctx.fillStyle = th.sky[1]; ctx.fillRect(0, 720 * .48, w, 720 * .26);
    ctx.fillStyle = th.sky[2]; ctx.fillRect(0, 720 * .74, w, 720 * .26);
  }
  function drawSun(ctx, x, y, sun, th){
    ctx.globalAlpha = .28; ctx.fillStyle = sun.color;
    ctx.beginPath(); ctx.arc(x, y, sun.r * 1.75, 0, 7); ctx.fill();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, sun.r, 0, 7); ctx.fill();
    if (sun.moon){ ctx.fillStyle = th.sky[0]; ctx.beginPath(); ctx.arc(x + sun.r * .38, y - sun.r * .18, sun.r * .82, 0, 7); ctx.fill(); }
  }
  function drawStars(ctx, w, t){
    for (let i = 0; i < 46; i++){
      const x = U.hash(i * 3.3) * w, y = U.hash(i * 7.1) * 400;
      const a = .35 + .6 * Math.abs(Math.sin(t * 1.4 + i));
      ctx.globalAlpha = a; ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, 1.3 + U.hash(i * 1.7) * 1.6, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawCloud(ctx, x, y, s, th){
    ctx.fillStyle = 'rgba(0,0,0,.07)';
    ctx.beginPath(); ctx.ellipse(x, y + 6 * s, 62 * s, 10 * s, 0, 0, 7); ctx.fill();
    const c1 = th.cloud, c2 = th.cloudShade;
    block(ctx, x - 38 * s, y + 4 * s, 48 * s, 30 * s, 20 * s, c1, c1, c2);
    block(ctx, x + 32 * s, y + 3 * s, 56 * s, 34 * s, 25 * s, c1, c1, c2);
    block(ctx, x, y, 92 * s, 48 * s, 28 * s, c1, c1, c2);
    block(ctx, x - 4 * s, y - 18 * s, 52 * s, 30 * s, 24 * s, '#FFFFFF', c1, c2);
  }
  function drawMountains(ctx, camX, vw, th, camY){
    const M = th.mountains;
    /* capa lejana + niebla que rellena los valles hasta abajo */
    let par = .22, sp = 300, baseY = 552 + camY * .75;
    ctx.fillStyle = th.far;
    ctx.fillRect(camX - 60, baseY, vw + 120, 2200);
    let i0 = Math.floor((camX * par - 380) / sp), i1 = Math.ceil((camX * par + vw + 380) / sp);
    for (let i = i0; i <= i1; i++){
      const x = i * sp + camX * (1 - par), h = 140 + U.hash(i * 5.1) * 150, w2 = 200 + U.hash(i * 8.8) * 90;
      poly(ctx, [[x - w2, baseY], [x, baseY - h], [x + w2, baseY]]);
    }
    /* capa cercana con caras iluminada/sombra */
    par = .34; sp = 380; baseY = 572 + camY * .66;
    i0 = Math.floor((camX * par - 460) / sp); i1 = Math.ceil((camX * par + vw + 460) / sp);
    for (let i = i0; i <= i1; i++){
      const x = i * sp + camX * (1 - par), h = 200 + U.hash(i * 3.7) * 210, w2 = 230 + U.hash(i * 9.1) * 100;
      ctx.fillStyle = M.light; poly(ctx, [[x - w2, baseY], [x, baseY - h], [x, baseY]]);
      ctx.fillStyle = M.dark;  poly(ctx, [[x, baseY - h], [x + w2, baseY], [x, baseY]]);
      if (M.snow){
        ctx.fillStyle = '#FFFFFF';
        poly(ctx, [[x - w2 * .16, baseY - h * .72], [x, baseY - h], [x + w2 * .16, baseY - h * .72],
                   [x + w2 * .07, baseY - h * .64], [x, baseY - h * .70], [x - w2 * .07, baseY - h * .62]]);
      }
    }
  }
  function drawHills(ctx, camX, vw, th, camY){
    const par = .5, sp = 430, baseY = 604 + camY * .5;
    if (baseY > camY + 820) return;
    ctx.fillStyle = th.hills[1];
    ctx.fillRect(camX - 60, baseY, vw + 120, 1000);   /* rellena bajo las colinas: sin bandas de cielo */
    const i0 = Math.floor((camX * par - 560) / sp), i1 = Math.ceil((camX * par + vw + 560) / sp);
    for (let i = i0; i <= i1; i++){
      const x = i * sp + camX * (1 - par), rx = 150 + U.hash(i * 2.9) * 130, ry = 55 + U.hash(i * 6.6) * 70;
      ctx.fillStyle = th.hills[i & 1];
      ctx.beginPath(); ctx.ellipse(x, baseY, rx, ry, 0, Math.PI, 0); ctx.fill();
    }
  }
  function drawGround(ctx, camX, vw, th, camY){
    const g = th.ground;
    if (612 > camY + 800) return;                     /* el suelo salió por abajo de la pantalla */
    const x0 = camX - 30, x1 = camX + vw + 30;
    ctx.fillStyle = g.top;   ctx.fillRect(x0, 612, x1 - x0, 30);
    ctx.fillStyle = g.topHi; ctx.fillRect(x0, 612, x1 - x0, 8);
    ctx.fillStyle = g.dark;  ctx.fillRect(x0, 642, x1 - x0, 8);
    ctx.fillStyle = g.front; ctx.fillRect(x0, 650, x1 - x0, 900);
    /* rombitos de textura */
    let sp = 68;
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    for (let i = Math.floor(x0 / sp); i <= Math.ceil(x1 / sp); i++){
      const x = i * sp + ((i * 37) % 23), yy = 686 + ((i * 53) % 110);
      poly(ctx, [[x, yy - 7], [x + 9, yy], [x, yy + 7], [x - 9, yy]]);
    }
    /* piedritas */
    sp = 230;
    for (let i = Math.floor(x0 / sp); i <= Math.ceil(x1 / sp); i++){
      if (U.hash(i * 11.7) < .45) continue;
      const x = i * sp + U.hash(i * 4.4) * 90, yy = 672 + U.hash(i * 5.3) * 96;
      blockC(ctx, x, yy, 24, 12, 9, shade(g.dark, .3));
    }
    /* matitas de pasto */
    sp = 90;
    ctx.strokeStyle = g.dark; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = Math.floor(x0 / sp); i <= Math.ceil(x1 / sp); i++){
      if (U.hash(i * 17.3) < .45) continue;
      const x = i * sp + U.hash(i * 2.2) * 50;
      ctx.beginPath();
      ctx.moveTo(x, 636); ctx.lineTo(x - 4, 624);
      ctx.moveTo(x + 5, 636); ctx.lineTo(x + 7, 623);
      ctx.stroke();
    }
  }
  function drawSign(ctx, x, gy, meters){
    blockC(ctx, x, gy, 12, 7, 52, '#8A5A3B');
    ctx.fillStyle = '#FFF7E8'; rr(ctx, x - 46, gy - 86, 92, 36, 9); ctx.fill();
    ctx.strokeStyle = '#8A5A3B'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3E4A56'; ctx.font = '700 18px Fredoka, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(meters + ' m', x, gy - 68);
  }
  function drawDecor(ctx, camX, vw, th, camY, t){
    const sp = 120, gy = 612, P = th.plants;
    if (gy > camY + 820) return;
    const i0 = Math.floor((camX - 180) / sp), i1 = Math.ceil((camX + vw + 180) / sp);
    for (let i = i0; i <= i1; i++){
      const r = U.hash(i * 13.37); if (r < .5) continue;
      const x = i * sp + (U.hash(i * 3.1) - .5) * 56;
      const s = 1 + U.hash(i * 9.9) * .6, r2 = U.hash(i * 5.77);
      if (th.deco === 'meadow'){
        if (r2 < .55) tree(ctx, x, gy, s, P);
        else if (r2 < .75) flower(ctx, x, gy, t, s);
        else if (r2 < .9) blockC(ctx, x, gy, 30 * s, 18 * s, 16 * s, P.rock);
        else blockC(ctx, x, gy, 34 * s, 20 * s, 13 * s, P.leaf);
      } else if (th.deco === 'desert'){
        if (r2 < .5) cactus(ctx, x, gy, s, P);
        else if (r2 < .78) blockC(ctx, x, gy, 34 * s, 20 * s, 14 * s, P.rock);
        else { ctx.fillStyle = shade(th.ground.dark, -.12);
          ctx.beginPath(); ctx.ellipse(x, gy + 6, 30 * s, 8 * s, 0, 0, 7); ctx.fill(); }
      } else if (th.deco === 'snow'){
        if (r2 < .6) pine(ctx, x, gy, s, P, true);
        else if (r2 < .8) blockC(ctx, x, gy, 32 * s, 18 * s, 15 * s, P.rock);
        else snowPile(ctx, x, gy, s);
      } else {
        if (r2 < .45) lavaRock(ctx, x, gy, s);
        else if (r2 < .7) pine(ctx, x, gy, s, P, false);
        else if (r2 < .85) blockC(ctx, x, gy, 30 * s, 18 * s, 15 * s, P.rock);
        else crystal(ctx, x, gy, s);
      }
    }
  }
  function tree(ctx, x, gy, s, P){
    blockC(ctx, x, gy, 20 * s, 12 * s, 36 * s, P.trunk);
    blockC(ctx, x, gy - 28 * s, 96 * s, 56 * s, 54 * s, P.leaf);
    blockC(ctx, x, gy - 74 * s, 58 * s, 34 * s, 30 * s, shade(P.leaf, .12));
    blockC(ctx, x - 20 * s, gy - 60 * s, 26 * s, 16 * s, 18 * s, shade(P.leaf, -.08));
    blockC(ctx, x + 24 * s, gy - 66 * s, 22 * s, 14 * s, 16 * s, shade(P.leaf, .2));
  }
  function pine(ctx, x, gy, s, P, snowy){
    blockC(ctx, x, gy, 12 * s, 8 * s, 12 * s, P.trunk);
    let y0 = gy - 8 * s;
    for (let k = 0; k < 3; k++){
      const w2 = (52 - k * 13) * s / 2, h = 26 * s;
      ctx.fillStyle = P.leafLight; poly(ctx, [[x - w2, y0], [x, y0 - h], [x, y0]]);
      ctx.fillStyle = P.leafDark;  poly(ctx, [[x, y0 - h], [x + w2, y0], [x, y0]]);
      if (snowy){ ctx.fillStyle = '#FFFFFF'; poly(ctx, [[x - w2 * .45, y0 - h * .55], [x, y0 - h], [x + w2 * .45, y0 - h * .55], [x, y0 - h * .45]]); }
      y0 -= h * .62;
    }
  }
  function cactus(ctx, x, gy, s, P){
    blockC(ctx, x, gy, 16 * s, 12 * s, 48 * s, P.leaf);
    blockC(ctx, x - 15 * s, gy - 14 * s, 12 * s, 9 * s, 20 * s, shade(P.leaf, -.08));
    blockC(ctx, x + 15 * s, gy - 20 * s, 12 * s, 9 * s, 24 * s, shade(P.leaf, .08));
  }
  function flower(ctx, x, gy, t, s){
    const sway = Math.sin(t * 2 + x * .05) * 2;
    ctx.strokeStyle = shade(P_LEAF(), -.15); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.quadraticCurveTo(x + sway * .5, gy - 12 * s, x + sway, gy - 22 * s); ctx.stroke();
    ctx.fillStyle = '#FF8FAE'; ctx.beginPath(); ctx.arc(x + sway, gy - 25 * s, 6 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.arc(x + sway, gy - 25 * s, 2.6 * s, 0, 7); ctx.fill();
    function P_LEAF(){ return '#3FA873'; }
  }
  function snowPile(ctx, x, gy, s){
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x, gy + 4, 26 * s, 9 * s, 0, Math.PI, 0); ctx.fill();
  }
  function lavaRock(ctx, x, gy, s){
    blockC(ctx, x, gy, 40 * s, 24 * s, 22 * s, '#3B3560');
    ctx.strokeStyle = '#FF7A59'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 8 * s, gy - 6 * s); ctx.lineTo(x - 2 * s, gy - 12 * s); ctx.lineTo(x + 5 * s, gy - 8 * s);
    ctx.stroke();
  }
  function crystal(ctx, x, gy, s){
    blockC(ctx, x, gy, 18 * s, 12 * s, 34 * s, '#8FD8F5');
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 4 * s, gy - 26 * s); ctx.lineTo(x - 1 * s, gy - 8 * s); ctx.stroke();
  }

  /* ---------- Entidades ---------- */
  let coinSpr = null;
  function drawCoin(ctx, x, y, t, big){
    if (!coinSpr) coinSpr = getSprite('moneda.png');
    const s = big ? 58 : 42;
    const wob = .32 + .68 * Math.abs(Math.cos(t * 3.4 + x * .013));
    if (coinSpr.ok){
      if (big){
        const pu = 1 + Math.sin(t * 3) * .05;
        ctx.globalAlpha = .18; ctx.fillStyle = '#FFD94E';
        ctx.beginPath(); ctx.arc(x, y, s * .68 * pu, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.save(); ctx.translate(x, y); ctx.scale(wob, 1);
      ctx.drawImage(coinSpr.el, -s / 2, -s / 2, s, s);
      ctx.restore();
      return;
    }
    /* fallback si la imagen no existe */
    const rx = 15 * wob;
    ctx.fillStyle = big ? '#FF7BA9' : '#FFC93C';
    ctx.beginPath(); ctx.ellipse(x, y, rx, 15, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = big ? '#D9497E' : '#D98E00'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = big ? '#FFA8C6' : '#FFE08A';
    ctx.beginPath(); ctx.ellipse(x, y, rx * .55, 8, 0, 0, 7); ctx.fill();
  }
  const FB_COLOR = { rocket:'#FF6B57', balloon:'#FF9F45', magnet:'#4FB6E8', tramp:'#59C98A', mattress:'#B07CE8', star:'#FFC93C', mult:'#FF6B57' };
  function itemFallback(ctx, type, t){
    const c = FB_COLOR[type] || '#FF6B57';
    if (type === 'rocket'){
      blockC(ctx, 0, 6, 22, 14, 40, '#EDF2F7');
      ctx.fillStyle = c; poly(ctx, [[-11, -34], [0, -54], [11, -34]]);
      ctx.fillStyle = shade(c, -.2); poly(ctx, [[-11, 6], [-19, 16], [-11, 12]]);
      poly(ctx, [[11, 6], [19, 16], [11, 12]]);
      const fl = 8 + Math.sin(t * 22) * 5;
      ctx.fillStyle = '#FFC93C'; poly(ctx, [[-6, 16], [0, 16 + fl], [6, 16]]);
    } else if (type === 'balloon'){
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -18, 26, 28, 0, 0, 7); ctx.fill();
      ctx.fillStyle = shade(c, .25); ctx.beginPath(); ctx.ellipse(-8, -26, 8, 10, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#7A5A3B'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-5, 20); ctx.moveTo(8, 8); ctx.lineTo(5, 20); ctx.stroke();
      blockC(ctx, 0, 26, 18, 12, 10, '#A9743F');
    } else if (type === 'magnet'){
      ctx.strokeStyle = c; ctx.lineWidth = 13; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.arc(0, 2, 15, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#EDF2F7';
      ctx.fillRect(-21.5, 2, 13, 12); ctx.fillRect(8.5, 2, 13, 12);
      ctx.strokeStyle = shade(c, -.2); ctx.lineWidth = 2; ctx.strokeRect(-21.5, 2, 13, 12); ctx.strokeRect(8.5, 2, 13, 12);
    } else if (type === 'tramp'){
      ctx.strokeStyle = '#3E4A56'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-20, 24); ctx.lineTo(-14, 6); ctx.moveTo(20, 24); ctx.lineTo(14, 6); ctx.stroke();
      ctx.fillStyle = shade(c, -.18); ctx.beginPath(); ctx.ellipse(0, 6, 26, 8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 2, 26, 8, 0, 0, 7); ctx.fill();
      const up = (t * 40) % 24;
      ctx.strokeStyle = shade(c, -.25); ctx.lineWidth = 3.5;
      for (let k = 0; k < 2; k++){
        const yy = -8 - up - k * 22, a = 1 - ((-8 - up - k * 22 + 40) / 60);
        ctx.globalAlpha = U.clamp(a, .1, .9);
        ctx.beginPath(); ctx.moveTo(-10, yy + 6); ctx.lineTo(0, yy - 4); ctx.lineTo(10, yy + 6); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (type === 'mattress'){
      blockC(ctx, 0, 14, 66, 30, 18, c);
      ctx.strokeStyle = shade(c, -.3); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-16, 12); ctx.moveTo(16, -2); ctx.lineTo(16, 12); ctx.stroke();
    } else if (type === 'star'){
      ctx.save(); ctx.rotate(Math.sin(t * 2) * .2);
      ctx.fillStyle = c; ctx.beginPath();
      for (let k = 0; k < 10; k++){
        const r = k % 2 ? 11 : 26, a = -Math.PI / 2 + k * Math.PI / 5;
        ctx[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#D98E00'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    } else { /* mult x2 */
      ctx.fillStyle = c; rr(ctx, -24, -16, 48, 32, 12); ctx.fill();
      ctx.strokeStyle = shade(c, -.25); ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '700 22px Fredoka, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('x2', 0, 1);
    }
  }
  function drawItem(ctx, it, t){
    const yy = it.y + Math.sin(t * 2.2 + it.x * .02) * 9;
    const col = FB_COLOR[it.type] || '#FF6B57';
    ctx.save(); ctx.translate(it.x, yy);
    ctx.strokeStyle = col; ctx.globalAlpha = .4; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -t * 26;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 42, 30 + Math.sin(t * 3) * 3, 0, 7); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    if (it.spr && it.spr.ok) ctx.drawImage(it.spr.el, -44, -44, 88, 88);
    else itemFallback(ctx, it.type, t);
    ctx.restore();
  }
  /* Personaje: sprite del usuario o muñeco cúbico procedural */
  function drawCharFallback(ctx, ch){
    const c = ch.colors;
    blockC(ctx, -12, -2, 15, 10, 20, c.accent);
    blockC(ctx, 12, -2, 15, 10, 20, c.accent);
    block(ctx, 0, -20, 40, 26, 34, c.bodyLight, c.body, c.bodyDark);
    block(ctx, 0, -56, 42, 30, 36, shade(c.face, .2), c.face, shade(c.face, -.18));
    ctx.save(); ctx.translate(4, -50); ctx.transform(1, -.5, 0, 1, 0, 0);
    ctx.fillStyle = '#20242B';
    ctx.fillRect(6, -2, 5, 12); ctx.fillRect(16, -2, 5, 12);
    ctx.restore();
  }
  function drawChar(ctx, x, y, ch, opt = {}){
    const { angle = 0, spr = null, sx = 1, sy = 1 } = opt;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(sx, sy);
    if (spr && spr.ok) ctx.drawImage(spr.el, -55, -104, 110, 110);
    else drawCharFallback(ctx, ch);
    ctx.restore();
  }
  /* Cañón lanzador */
  function drawLauncher(ctx, x, gy, angle, power, charging, recoil, flash){
    /* carreta de madera con ruedas */
    blockC(ctx, x, gy, 118, 64, 30, '#C98A4B');
    blockC(ctx, x, gy - 26, 84, 46, 12, '#A9713B');
    ctx.fillStyle = '#5A4632';
    ctx.beginPath(); ctx.arc(x - 38, gy - 13, 16, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 38, gy - 13, 16, 0, 7); ctx.fill();
    ctx.fillStyle = '#8A6B47';
    ctx.beginPath(); ctx.arc(x - 38, gy - 13, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 38, gy - 13, 6, 0, 7); ctx.fill();

    const rad = angle * Math.PI / 180;
    const px = x, py = gy - 56;   /* pivote elevado: la culata nunca se hunde en el suelo */
    ctx.save();
    ctx.translate(px - Math.cos(rad) * recoil * 16, py + Math.sin(rad) * recoil * 16);
    ctx.rotate(rad);
    const sq = charging ? 1 - power * .10 : 1;
    ctx.scale(1 - recoil * .08, sq);

    /* tubo: las franjas se recortan con clip para no deformar los bordes */
    rr(ctx, -44, -24, 108, 48, 20);
    ctx.fillStyle = '#FF6B57'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#FFE1DB';
    ctx.fillRect(-16, -24, 11, 48); ctx.fillRect(13, -24, 11, 48); ctx.fillRect(42, -24, 11, 48);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-44, 12, 108, 12);
    ctx.restore();
    rr(ctx, -44, -24, 108, 48, 20);
    ctx.lineWidth = 3; ctx.strokeStyle = '#D14A38'; ctx.stroke();

    /* anillo de boca y trasera */
    ctx.fillStyle = '#D94A38'; rr(ctx, 54, -28, 17, 56, 8); ctx.fill();
    ctx.fillStyle = '#5A2B22'; ctx.beginPath(); ctx.ellipse(66, 0, 6, 21, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#D94A38'; ctx.beginPath(); ctx.arc(-40, 0, 21, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFC93C'; ctx.beginPath(); ctx.arc(-40, 0, 10, 0, 7); ctx.fill();
    ctx.restore();

    /* eje de giro */
    ctx.fillStyle = '#3E4A56'; ctx.beginPath(); ctx.arc(px, py + 8, 12, 0, 7); ctx.fill();
    ctx.fillStyle = '#9AA7B4'; ctx.beginPath(); ctx.arc(px, py + 8, 5, 0, 7); ctx.fill();

    if (flash > 0){
      ctx.globalAlpha = flash;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(px + Math.cos(rad) * 88, py + Math.sin(rad) * 88, 16 + (1 - flash) * 26, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  /* Previews para el menú */
  function charPreview(ctx, ch, size){
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(23,58,79,.10)';
    ctx.beginPath(); ctx.ellipse(size / 2, size * .88, size * .22, size * .045, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(size / 2, size * .87); ctx.scale(size / 150, size / 150);
    drawCharFallback(ctx, ch); ctx.restore();
  }
  function mapPreview(cv, map){
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height, th = map.theme;
    const k = h / 220;
    ctx.fillStyle = th.sky[0]; ctx.fillRect(0, 0, w, h * .52);
    ctx.fillStyle = th.sky[1]; ctx.fillRect(0, h * .52, w, h * .24);
    ctx.fillStyle = th.sky[2]; ctx.fillRect(0, h * .76, w, h * .24);
    if (th.stars) for (let i = 0; i < 18; i++){
      ctx.globalAlpha = .5 + .5 * Math.sin(i * 3); ctx.fillStyle = '#fff';
      ctx.fillRect(U.hash(i * 3.1) * w, U.hash(i * 7.7) * h * .5, 2, 2); ctx.globalAlpha = 1;
    }
    drawSun(ctx, w * th.sun.x, h * th.sun.y + 6, { ...th.sun, r: th.sun.r * k }, th);
    ctx.fillStyle = th.far;
    poly(ctx, [[0, h * .74], [w * .3, h * .38], [w * .62, h * .74]]);
    poly(ctx, [[w * .45, h * .74], [w * .78, h * .46], [w, h * .74]]);
    ctx.fillStyle = th.mountains.light; poly(ctx, [[w * .3, h * .38], [w * .38, h * .74], [w * .3, h * .74]]);
    for (let i = 0; i < 2; i++){
      ctx.fillStyle = th.hills[i];
      ctx.beginPath(); ctx.ellipse(w * (.22 + i * .5), h * .8, w * .3, h * .14, 0, Math.PI, 0); ctx.fill();
    }
    ctx.fillStyle = th.ground.top; ctx.fillRect(0, h * .8, w, h * .06);
    ctx.fillStyle = th.ground.topHi; ctx.fillRect(0, h * .8, w, h * .018);
    ctx.fillStyle = th.ground.front; ctx.fillRect(0, h * .86, w, h * .14);
    ctx.save(); ctx.translate(w * .5, h * .8); ctx.scale(k * 1.1, k * 1.1);
    const P = th.plants;
    if (map.theme.deco === 'desert') cactus(ctx, 0, 0, 1, P);
    else if (map.theme.deco === 'snow' || map.theme.deco === 'night') pine(ctx, 0, 0, 1, P, th.deco === 'snow');
    else tree(ctx, 0, 0, 1, P);
    ctx.restore();
    drawCloud(ctx, w * .18, h * .2, .5 * k * 1.4, th);
  }
  return { shade, poly, block, blockC, rr, getSprite,
    drawSky, drawSun, drawStars, drawCloud, drawMountains, drawHills, drawGround, drawDecor, drawSign,
    drawCoin, drawItem, drawChar, drawCharFallback, drawLauncher, charPreview, mapPreview, FB_COLOR };
})();