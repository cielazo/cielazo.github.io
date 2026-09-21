/* Iconos SVG, header, modales, toast y ajustes */
window.ICONS = {
  coin:'<img src="../assets/images/moneda.png" alt="" draggable="false">',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5h4v5"/></svg>',
  cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2.4l2.3 11h10l2.3-8H6.4"/></svg>',
  person:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z"/><path d="M9 4v13M15 6.5v13"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z" fill="currentColor"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M8 5v14M16 5v14"/></svg>',
  redo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4.4h-4.4"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5.5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3.2 3.2 0 0 0 3.4 3.4M17 6h3a3.2 3.2 0 0 1-3.4 3.4"/><path d="M12 14.5V18M8.5 20.5h7M10 18h4"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 2.5 5.5 13.5H11L9.5 21.5 18 10h-5.5z" fill="currentColor"/></svg>',
  magnet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3.5h4.2v7.3a1.8 1.8 0 0 0 3.6 0V3.5H18v7.3a6 6 0 0 1-12 0z"/><path d="M6 3.5h4.2v3.4H6zM13.8 3.5H18v3.4h-4.2z" fill="currentColor" stroke="none"/></svg>',
  balloon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8.5" r="5.5"/><path d="M12 14v3.5"/><rect x="10" y="17.5" width="4" height="3.2" rx="1"/></svg>',
  rocket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5c3 2 4.5 5.5 4.5 9l-1.5 4h-6l-1.5-4c0-3.5 1.5-7 4.5-9z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M9 15.5 6.5 19l3-.5M15 15.5l2.5 3.5-3-.5"/><path d="M12 17.5v3.5"/></svg>',
  spring:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 19h14"/><path d="M7 19c0-2.2 10-2.2 10 0M7 15.5c0-2 10-2 10 0M8 12c0-1.8 8-1.8 8 0"/><path d="M12 8V4M9.5 6.5 12 4l2.5 2.5"/></svg>',
  mattress:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="8" width="17" height="8" rx="3"/><path d="M8 8v8M16 8v8"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" fill="currentColor"/></svg>',
  x2:'<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="11" rx="4.5" fill="currentColor"/><text x="12" y="15.2" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="Fredoka, sans-serif">x2</text></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  sound:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3.5L12 18V6l-4.5 4z"/><path d="M15.5 9.5a4 4 0 0 1 0 5M18 7.5a7 7 0 0 1 0 9"/></svg>',
  mute:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3.5L12 18V6l-4.5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  vibrate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4.5 8.5v7M19.5 8.5v7"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r="0.7" fill="currentColor" stroke="none"/></svg>',
  rotate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="5" width="8" height="15" rx="2"/><path d="M19.5 7A8 8 0 0 0 5.6 8.2"/><path d="M5.4 4.6v3.8h3.8"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  wind:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3.5 8.5h9a2.5 2.5 0 1 0-2.5-2.5M3.5 12.5h14a2.5 2.5 0 1 1-2.5 2.5M3.5 16.5h6"/></svg>',
  feather:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 4.5c.5 5-2 9.5-6.5 12L6 19l2.5-6.5c2.5-4.5 6-7 11-8z"/><path d="M6 19 15 10"/></svg>',
  gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 16a8 8 0 1 1 15 0"/><path d="M12 16 15.5 9.5"/><circle cx="12" cy="16" r="1.5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
};

window.paintIcons = root => (root || document).querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
window.refreshWallet = () => { const el = document.getElementById('wallet-amount'); if (el) el.textContent = U.fmt(Storage.get().coins); };

window.UI = {
  chrome({ back = false } = {}){
    paintIcons(document); refreshWallet();
    const b = U.$('#btn-back');
    if (b) b.addEventListener('click', () => { SFX.click(); location.href = 'home.html'; });
    const add = U.$('#btn-add-coins');
    if (add) add.addEventListener('click', () => { SFX.click(); location.href = 'shop.html?tab=coins'; });
    document.addEventListener('pointerdown', () => SFX.warm(), { once:true });
  },
  toast(msg, icon = 'info'){
    let t = U.$('.toast');
    if (!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = `<span class="ic">${ICONS[icon] || ''}</span><span>${U.esc(msg)}</span>`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
  },
  modal({ title, icon = 'info', body = '', actions = [], onClose }){
    const back = document.createElement('div'); back.className = 'mb';
    const acts = actions.map((a, i) =>
      `<button class="btn ${a.kind || 'btn-ghost'}" data-i="${i}">${a.icon ? `<span class="ic" data-icon="${a.icon}"></span>` : ''}${U.esc(a.label)}</button>`).join('');
    back.innerHTML = `<div class="modal"><h3><span class="ic" data-icon="${icon}"></span>${U.esc(title)}</h3><div class="m-body">${body}</div><div class="m-actions">${acts}</div></div>`;
    document.body.appendChild(back); paintIcons(back);
    const close = () => { back.remove(); onClose && onClose(); };
    back.addEventListener('click', e => { if (e.target === back) close(); });
    back.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
      const a = actions[+b.dataset.i]; SFX.click();
      if (a.onClick) a.onClick(close); else close();
    }));
    return back;
  },
  confirm({ title, msg, ok = 'Aceptar', kind = 'btn-primary', onOk }){
    UI.modal({ title, body:`<p>${msg}</p>`, actions:[
      { label:'Cancelar' },
      { label:ok, kind, onClick: close => { close(); onOk && onOk(); } }
    ]});
  },
  needCoins(missing){
    UI.modal({ title:'Te faltan monedas', icon:'coin',
      body:`<p>Necesitas <b>${U.fmt(missing)}</b> monedas más. ¿Quieres ver los paquetes de monedas?</p>`,
      actions:[ { label:'Ahora no' }, { label:'Ver paquetes', kind:'btn-primary', icon:'cart', onClick:() => location.href = 'shop.html?tab=coins' } ]
    });
  },
    settings(){
    const st = Storage.get();
    const back = UI.modal({ title:'Tu perfil', icon:'person', body:`
      <div class="prof-stats">
        <div class="pf"><b>${U.kmFmt(st.best.global || 0)}</b><i>Récord</i></div>
        <div class="pf"><b>${U.fmt(st.stats.games || 0)}</b><i>Partidas</i></div>
        <div class="pf"><b>${U.fmt(st.stats.meters || 0)} m</b><i>Distancia</i></div>
      </div>
      <label class="row-set"><span class="ic" data-icon="sound"></span> Sonido <input type="checkbox" id="set-sound" class="sw" ${st.settings.sound ? 'checked' : ''}></label>
      <label class="row-set"><span class="ic" data-icon="vibrate"></span> Vibración <input type="checkbox" id="set-hap" class="sw" ${st.settings.haptics ? 'checked' : ''}></label>
      <div class="set-ver">Cielazo v${DB.cfg.version} — demo</div>`,
      actions:[
        { label:'Restablecer progreso', kind:'btn-danger', onClick: close => { close(); UI.confirm({
            title:'¿Borrar todo?', msg:'Perderás monedas, compras y récords. No se puede deshacer.', ok:'Borrar', kind:'btn-danger',
            onOk(){ try{ localStorage.removeItem(Storage.key); }catch(e){} location.reload(); } }); } },
        { label:'Listo', kind:'btn-primary' }
      ]});
    U.$('#set-sound', back).addEventListener('change', e => { Storage.get().settings.sound = e.target.checked; Storage.save(); });
    U.$('#set-hap', back).addEventListener('change', e => { Storage.get().settings.haptics = e.target.checked; Storage.save(); });
  },
  charVisual(container, char){
    container.innerHTML = '';
    const img = new Image();
    img.onload = () => { container.innerHTML = ''; container.appendChild(img); };
    img.onerror = () => {
      const cv = document.createElement('canvas'); cv.width = 220; cv.height = 220;
      World.charPreview(cv.getContext('2d'), char, 220);
      container.innerHTML = ''; container.appendChild(cv);
    };
    img.src = DB.img(char.img);
  }
};