(function(){
  UI.chrome();
  const up = U.$('#shop-up'), packs = U.$('#shop-coins');

  if (new URLSearchParams(location.search).get('tab') === 'coins') setTab('coins'); else setTab('up');
  U.$('#tab-up').addEventListener('click', () => { SFX.click(); setTab('up'); });
  U.$('#tab-coins').addEventListener('click', () => { SFX.click(); setTab('coins'); });
  function setTab(t){
    U.$('#tab-up').classList.toggle('active', t === 'up');
    U.$('#tab-coins').classList.toggle('active', t === 'coins');
    up.classList.toggle('hidden', t !== 'up');
    packs.classList.toggle('hidden', t !== 'coins');
  }

  function renderUp(){
    const st = Storage.get();
    up.innerHTML = '';
    DB.upgrades.forEach(u => {
      const lvl = st.upgrades[u.id] || 0, maxed = lvl >= u.max;
      const cost = DB.upgCost(u, lvl);
      const row = document.createElement('div');
      row.className = 'up-row';
      row.innerHTML = `
        <div class="up-ico" style="background:${u.color}"><span class="ic" data-icon="${u.icon}"></span></div>
        <div class="up-info">
          <h4>${U.esc(u.name)}</h4>
          <p>${U.esc(u.desc)}</p>
          <div class="pips">${Array.from({ length:u.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
          <div class="up-eff">${lvl === 0 ? 'Siguiente: ' + u.eff(1) : 'Ahora: ' + u.eff(lvl) + ' · Siguiente: ' + u.eff(lvl + 1)}</div>
        </div>
        <div class="up-buy">
          ${maxed ? '<span class="tagchip">Nivel máximo</span>'
                  : `<span class="price"><span class="ic" data-icon="coin"></span>${U.fmt(cost)}</span>`}
          <button class="btn btn-primary" ${maxed ? 'disabled' : ''}>${maxed ? 'MAX' : 'Mejorar'}</button>
        </div>`;
      paintIcons(row);
      row.querySelector('button').addEventListener('click', () => {
        SFX.click();
        if (Storage.spend(cost)){
          st.upgrades[u.id] = lvl + 1; Storage.save();
          SFX.buy(); refreshWallet(); renderUp();
          UI.toast(u.name + ' → nivel ' + (lvl + 1), 'check');
        } else { SFX.error(); UI.needCoins(cost - st.coins); }
      });
      up.appendChild(row);
    });
  }

  function renderPacks(){
    packs.innerHTML = '';
    DB.packs.forEach(pk => {
      const el = document.createElement('div');
      el.className = 'pack';
      el.innerHTML = `
        ${pk.tag ? `<span class="tagchip">${U.esc(pk.tag)}</span>` : ''}
        <div class="pack-art"><img src="../assets/images/${pk.img}" alt="" draggable="false"
          onerror="this.onerror=null;this.src='../assets/images/moneda.png'"></div>
        <div class="pname">${U.esc(pk.name)}</div>
        <div class="contenedor-precios-monedas">
          <div class="amount"><span class="ic" data-icon="coin"></span>${U.fmt(pk.coins)}</div>
          <div class="fiat">${U.esc(pk.price)}</div>
        </div>
        <button class="btn btn-coral">Comprar</button>`;
      paintIcons(el);
      el.querySelector('button').addEventListener('click', () => {
        SFX.click();
        UI.modal({ title:'Tienda en construcción', icon:'info',
          body:`<p>La compra con dinero real (<b>${U.esc(pk.price)}</b>) estará disponible muy pronto. ¡Esta demo es solo visual!</p>`,
          actions:[{ label:'Entendido', kind:'btn-primary' }] });
      });
      packs.appendChild(el);
    });
  }

  renderUp();
  renderPacks();
})();