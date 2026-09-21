(function(){
  UI.chrome();
  M.ensure();
  const st = Storage.get();

  U.$('#best').textContent = U.kmFmt(st.best.global || 0);

  const ch = DB.char(st.selChar), mp = DB.map(st.selMap);
  UI.charVisual(U.$('#eq-char'), ch);
  U.$('#eq-char-name').textContent = ch.name;
  World.mapPreview(U.$('#eq-map'), mp);
  U.$('#eq-map-name').textContent = mp.name;

  U.$('#btn-play').addEventListener('click', async () => {
    SFX.click();
    try{ await document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }catch(e){}
    try{ await screen.orientation.lock('landscape'); }catch(e){}
    location.href = 'game.html';
  });

  U.$('#btn-settings').addEventListener('click', () => { SFX.click(); UI.settings(); });

  function refreshDot(){
    U.$('#miss-dot').classList.toggle('hidden', M.readyToClaim() === 0);
  }
  U.$('#btn-missions').addEventListener('click', () => {
    SFX.click();
    const back = UI.modal({ title:'Misiones de hoy', icon:'target', body: st.missions.list.map(m => `
      <div class="mis">
        <div class="mis-t"><span>${U.esc(m.text)}</span><b class="mis-r">${m.reward}</b></div>
        <div class="bar"><i style="width:${Math.min(100, m.progress / m.goal * 100)}%"></i></div>
        ${m.claimed
          ? '<div class="mis-ok">Reclamada</div>'
          : m.done
            ? `<button class="btn btn-primary mis-claim" data-id="${m.id}">Reclamar</button>`
            : `<div class="mis-p">${U.fmt(m.progress)} / ${U.fmt(m.goal)}</div>`}
      </div>`).join(''),
      actions:[{ label:'Listo', kind:'btn-primary' }] });
    back.classList.add('missions-modal');
    back.querySelectorAll('.mis-claim').forEach(b => b.addEventListener('click', () => {
      const r = M.claim(b.dataset.id);
      if (r){ SFX.buy(); UI.toast('+' + r + ' monedas', 'coin'); refreshWallet(); refreshDot(); b.closest('.mis').querySelector('.mis-p, .mis-claim')?.replaceWith(Object.assign(document.createElement('div'), { className:'mis-ok', textContent:'Reclamada' })); }
    }));
  });
  refreshDot();
})();