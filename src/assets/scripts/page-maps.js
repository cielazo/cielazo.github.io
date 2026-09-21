(function(){
  UI.chrome();
  const list = U.$('#map-list');

  function render(){
    const st = Storage.get();
    list.innerHTML = '';
    DB.maps.forEach(mp => {
      const owned = st.ownedMaps.includes(mp.id), sel = st.selMap === mp.id;
      const card = document.createElement('div');
      card.className = 'pcard wide' + (sel ? ' selected' : '') + (!owned ? ' locked' : '');
      card.innerHTML = `
        <canvas class="preview" width="620" height="300"></canvas>
        <h4>${U.esc(mp.name)}</h4>
        <span class="tagchip perk">${U.esc(mp.perk)}</span>
        <div class="species">${U.esc(mp.desc)}</div>
        <div class="foot">
          ${owned ? '<span class="tagchip">Disponible</span>'
                  : `<span class="price"><span class="ic" data-icon="coin"></span>${U.fmt(mp.price)}</span>`}
          <button class="btn ${sel ? 'btn-ghost' : 'btn-primary'}" ${sel ? 'disabled' : ''}>
            ${sel ? 'En uso' : owned ? 'Usar' : 'Comprar'}
          </button>
        </div>`;
      World.mapPreview(card.querySelector('.preview'), mp);
      paintIcons(card);
      card.querySelector('.foot .btn').addEventListener('click', () => {
        SFX.click();
        if (owned){
          Storage.get().selMap = mp.id; Storage.save(); render();
          UI.toast(mp.name + ' seleccionado', 'check');
        } else {
          UI.confirm({
            title:'Desbloquear ' + mp.name,
            msg:`<b>${U.esc(mp.perk)}</b>. Cuesta <b>${U.fmt(mp.price)}</b> monedas. ¿Comprar?`,
            ok:'Comprar',
            onOk(){
              if (Storage.spend(mp.price)){
                Storage.get().ownedMaps.push(mp.id);
                Storage.get().selMap = mp.id;
                Storage.save(); SFX.buy(); refreshWallet(); render();
                UI.toast('¡' + mp.name + ' desbloqueado!', 'check');
              } else { SFX.error(); UI.needCoins(mp.price - Storage.get().coins); }
            }
          });
        }
      });
      list.appendChild(card);
    });
  }
  render();
})();