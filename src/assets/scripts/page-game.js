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
    if (!game || game.paused) return;
    game.setPaused(true);
    UI.modal({
      title:'Pausa', icon:'pause', body:'<p>El vuelo está en espera.</p>',
      onClose(){ game && game.setPaused(false); },
      actions:[
        { label:'Reanudar', kind:'btn-primary', icon:'play' },
        { label:'Reintentar', icon:'redo', onClick: close => { close(); start(); } },
        { label:'Salir', icon:'home', onClick: () => location.href = 'home.html' }
      ]
    });
  }

  start();
})();