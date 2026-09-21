(function(){
  UI.chrome();
  const list = U.$('#char-list');

  function render(){
    const st = Storage.get();
    list.innerHTML = '';
    DB.chars.forEach(ch => {
      const owned = st.ownedChars.includes(ch.id), sel = st.selChar === ch.id;
      const card = document.createElement('div');
      card.className = 'pcard' + (sel ? ' selected' : '') + (!owned ? ' locked' : '');
      card.innerHTML = `
        <div class="visual"></div>
        <h4>${U.esc(ch.name)}</h4>
        <div class="species">${U.esc(ch.species)} — ${U.esc(ch.phrase)}</div>
        <div class="ability"><span class="ic" data-icon="${ch.ability.icon}"></span>
          <span><b>${U.esc(ch.ability.name)}</b>${U.esc(ch.ability.desc)}
          <span class="mode">${ch.ability.auto ? 'AUTOMÁTICA' : 'TOCA EL BOTÓN EN VUELO · ' + ch.ability.uses + ' USO' + (ch.ability.uses > 1 ? 'S' : '')}</span></span></div>
        <div class="foot">
          ${owned
            ? '<span class="tagchip">Disponible</span>'
            : `<span class="price"><span class="ic" data-icon="coin"></span>${U.fmt(ch.price)}</span>`}
          <button class="btn ${sel ? 'btn-ghost' : 'btn-primary'}" ${sel ? 'disabled' : ''}>
            ${sel ? 'Equipado' : owned ? 'Elegir' : 'Comprar'}
          </button>
        </div>`;
      if (!owned){
        const lb = document.createElement('div');
        lb.className = 'lock-badge'; lb.innerHTML = ICONS.lock;
        card.querySelector('.visual').appendChild(lb);
      }
      UI.charVisual(card.querySelector('.visual'), ch);
      paintIcons(card);

      card.querySelector('.foot .btn').addEventListener('click', () => {
        SFX.click();
        if (owned){
          Storage.get().selChar = ch.id; Storage.save(); render();
          UI.toast(ch.name + ' listo para volar', 'check');
        } else {
          UI.confirm({
            title:'Comprar a ' + ch.name,
            msg:`Su habilidad <b>${U.esc(ch.ability.name)}</b> cuesta <b>${U.fmt(ch.price)}</b> monedas. ¿Comprar?`,
            ok:'Comprar',
            onOk(){
              if (Storage.spend(ch.price)){
                Storage.get().ownedChars.push(ch.id);
                Storage.get().selChar = ch.id;
                Storage.save(); SFX.buy(); refreshWallet(); render();
                UI.toast('¡' + ch.name + ' es tuyo!', 'check');
              } else { SFX.error(); UI.needCoins(ch.price - Storage.get().coins); }
            }
          });
        }
      });
      list.appendChild(card);
    });
  }
  render();
})();