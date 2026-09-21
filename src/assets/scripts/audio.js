/* Efectos de sonido sintetizados con WebAudio (sin archivos) */
window.SFX = (function(){
  let ctx = null, master = null;
  function ensure(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.26; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  const on = () => { try{ return Storage.get().settings.sound; }catch(e){ return true; } };
  function tone({ type='sine', f0=440, f1=0, t=0.15, vol=0.5, delay=0 }){
    if (!on() || !ensure()) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + t);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + t);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + t + 0.05);
  }
  function noise({ t=0.2, vol=0.3, f=1000, sweep=0, q=1, type='bandpass', delay=0 }){
    if (!on() || !ensure()) return;
    const len = Math.floor(ctx.sampleRate * t), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    const t0 = ctx.currentTime + delay;
    fl.frequency.setValueAtTime(f, t0);
    if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t0 + t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + t);
    src.connect(fl); fl.connect(g); g.connect(master); src.start(t0);
  }
  return {
    warm(){ if (on()) ensure(); },
    click(){ tone({ type:'triangle', f0:540, f1:330, t:0.07, vol:0.22 }); },
    launch(){ noise({ t:0.4, vol:0.5, f:320, sweep:2600, q:0.8 }); tone({ type:'sawtooth', f0:130, f1:45, t:0.3, vol:0.5 }); },
    perfect(){ [660, 880, 1180].forEach((f, i) => tone({ type:'triangle', f0:f, t:0.12, vol:0.28, delay:i * 0.07 })); },
    coin(){ tone({ type:'sine', f0:990, f1:1500, t:0.09, vol:0.26 }); tone({ type:'sine', f0:1320, f1:1780, t:0.12, vol:0.18, delay:0.05 }); },
    gem(){ [880, 1100, 1460].forEach((f, i) => tone({ type:'sine', f0:f, t:0.11, vol:0.24, delay:i * 0.05 })); },
    boost(){ noise({ t:0.5, vol:0.35, f:420, sweep:3200 }); tone({ type:'sawtooth', f0:180, f1:740, t:0.45, vol:0.24 }); },
    balloon(){ tone({ type:'sine', f0:300, f1:620, t:0.3, vol:0.28 }); },
    bounce(){ tone({ type:'sine', f0:230, f1:90, t:0.18, vol:0.5 }); },
    land(){ noise({ t:0.25, vol:0.45, f:220, type:'lowpass' }); tone({ type:'sine', f0:110, f1:55, t:0.25, vol:0.5 }); },
    ability(){ tone({ type:'square', f0:520, f1:1040, t:0.14, vol:0.18 }); tone({ type:'square', f0:760, f1:1520, t:0.14, vol:0.14, delay:0.08 }); },
    buy(){ tone({ type:'triangle', f0:700, t:0.1, vol:0.28 }); tone({ type:'triangle', f0:1050, t:0.16, vol:0.28, delay:0.09 }); },
    error(){ tone({ type:'square', f0:150, f1:100, t:0.25, vol:0.26 }); },
    record(){ [523, 659, 784, 1046].forEach((f, i) => tone({ type:'triangle', f0:f, t:0.16, vol:0.28, delay:i * 0.11 })); }
  };
})();