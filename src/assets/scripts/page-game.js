(function(){
  const canvas = U.$('#game-canvas');
  let game = null;

  /* selección desde parámetros ?char=&map= (opcional) */
  const q = new URLSearchParams(location.search);
  if (q.get('char')){ Storage.get().selChar = q.get('char'); Storage.save(); }
  if (q.get('map')){ Storage.get().selMap = q.get('map'); Storage.save(); }

  UI.chrome();
  paintIcons(document);

  function start(){
    if (game) game.destroy();
    U.$('#panel-result').classList.add('hidden');
    game = new window.Game({ canvas, onEnd: showResult });
  }

  function showResult(r){
    U.$('#res-dist').textContent = U.kmFmt(r.meters);
    U.$('#res-record').classList.toggle('hidden', !r.record);
    U.$('#res-fly').textContent = U.fmt(r.collected);
    U.$('#res-base').textContent = U.fmt(r.base);
    U.$('#panel-result').classList.remove('hidden');
    /* conteo animado */
    const el = U.$('#res-total'), t0 = performance.now(), dur = 900;
    (function tick(now){
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = U.fmt(r.total * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  U.$('#btn-retry').addEventListener('click', () => { SFX.click(); start(); });
  U.$('#btn-pause').addEventListener('click', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden && game && !game.done) pause(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && game && !game.done) pause(); });

  function pause(){
    if (!game || game.paused || game.state === 'done') return;
    game.setPaused(true);
    const back = document.createElement('div'); back.className = 'mb';
    const meters = Math.max(0, Math.round((game.maxX - game.cfg.launcherX) / game.cfg.ppm));
    back.innerHTML = `
      <div class="pause-card">
        <div class="pause-head">
          <span class="ph-ic"><span class="ic" data-icon="pause"></span></span>
          <div><div class="ph-t">Pausa</div><div class="ph-s">El vuelo está en espera</div></div>
        </div>
        <div class="pause-stats">
          <div class="ps"><span class="ic" data-icon="target"></span><b>${U.kmFmt(meters)}</b><i>Distancia</i></div>
          <div class="ps"><span class="ic" data-icon="coin"></span><b>${U.fmt(game.collected)}</b><i>Monedas</i></div>
        </div>
        <button id="pv-resume" class="btn btn-primary pv-main"><span class="ic" data-icon="play"></span>Reanudar</button>
        <div class="pv-row">
          <button id="pv-retry" class="btn btn-ghost"><span class="ic" data-icon="redo"></span>Reintentar</button>
          <button id="pv-home" class="btn btn-ghost"><span class="ic" data-icon="home"></span>Salir</button>
        </div>
      </div>`;
    document.body.appendChild(back); paintIcons(back);
    const close = () => { back.remove(); game && game.setPaused(false); };
    back.addEventListener('click', e => { if (e.target === back) { SFX.click(); close(); } });
    back.querySelector('#pv-resume').addEventListener('click', () => { SFX.click(); close(); });
    back.querySelector('#pv-retry').addEventListener('click', () => { SFX.click(); close(); start(); });
    back.querySelector('#pv-home').addEventListener('click', () => { SFX.click(); location.href = 'home.html'; });
  }

  start();
})();