/* Loading intro — Dapur Mom’s 4G (versi simpel & mewah: "Cemilan, kasih sayang dari Ibu").
   Progres asli: aset hero (gambar produk + remah + logo) dan font. Ada durasi minimum supaya animasinya
   sempat terlihat, dan batas maksimum supaya pengunjung tidak menunggu terlalu lama.
   Saat tirai terangkat, event 'loader:done' dikirim → animasi hero (js/hero.js) baru dimulai. */
(function(){
  'use strict';
  var root=document.documentElement,el=document.getElementById('mom-loader');
  var state=window.__momLoader={done:false};

  /* ── Pengaturan gampang diubah ── */
  var CFG={
    minMs:2800,          // lama tampil minimum (ms)
    maxMs:6500,          // batas paling lama menunggu aset (ms)
    oncePerSession:false // true = hanya muncul sekali per sesi tab (kunjungan pertama saja)
  };

  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){CFG.minMs=900;CFG.maxMs=3000;}

  function release(){
    if(state.done)return;
    state.done=true;
    root.classList.remove('is-loading');
    window.removeEventListener('wheel',block,{capture:true});
    window.removeEventListener('touchmove',block,{capture:true});
    document.dispatchEvent(new Event('loader:done'));
    if(window.ScrollTrigger){try{ScrollTrigger.refresh();}catch(e){}}
  }
  function block(e){e.preventDefault();e.stopImmediatePropagation();}

  if(!el){release();return;}

  try{
    if(CFG.oncePerSession&&sessionStorage.getItem('mom4g-intro')==='1'){
      el.parentNode&&el.parentNode.removeChild(el);release();return;
    }
  }catch(e){}

  /* kunci scroll selama loading (Lenis ikut diam karena event diblok lebih dulu) */
  window.addEventListener('wheel',block,{passive:false,capture:true});
  window.addEventListener('touchmove',block,{passive:false,capture:true});

  /* ── Pecah judul jadi huruf-huruf ── */
  var title=el.querySelector('.ld-title');
  if(title){
    var txt=title.getAttribute('data-text')||title.textContent;
    title.setAttribute('aria-label',txt);title.textContent='';
    Array.prototype.forEach.call(txt,function(ch,i){
      var s=document.createElement('span');s.className='c'+(ch===' '?' sp':'');s.style.setProperty('--i',i);
      s.setAttribute('aria-hidden','true');s.textContent=ch===' '?'\u00a0':ch;title.appendChild(s);
    });
  }

  /* judul baru dianimasikan setelah font display siap (maks 0,9 dtk) supaya tidak "loncat" font */
  var fontsFast=(document.fonts&&document.fonts.load)?Promise.race([
    Promise.all([document.fonts.load('600 40px "Cormorant Garamond"'),document.fonts.load('italic 600 24px "Cormorant Garamond"')]),
    new Promise(function(r){setTimeout(r,900);})
  ]):Promise.resolve();
  fontsFast.then(function(){el.classList.add('ld-go');},function(){el.classList.add('ld-go');});

  /* ── Progres asli ── */
  var ASSETS=[
    'assets/logo/logo-mom4g.webp',
    'assets/products/keju-goreng-kribo.webp','assets/products/keripik-bawang.webp','assets/products/keripik-udang.webp',
    'assets/pieces/keju/keju1.webp','assets/pieces/keju/keju3.webp','assets/pieces/keju/keju5.webp',
    'assets/pieces/bawang/bawang2.webp','assets/pieces/bawang/bawang4.webp','assets/pieces/bawang/bawang5.webp',
    'assets/pieces/udang/udang1.webp','assets/pieces/udang/udang3.webp','assets/pieces/udang/udang4.webp'
  ];
  var loaded=0,fontsReady=false;
  ASSETS.forEach(function(src){
    var im=new Image();im.onload=im.onerror=function(){loaded++;};im.src=src;
  });
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){fontsReady=true;},function(){fontsReady=true;});
  function real(){return (loaded/ASSETS.length)*.82+(fontsReady?.18:0);}

  /* ── Tampilan progres ── */
  var C=452.4,ring=el.querySelector('.ld-ring .bar'),bar=el.querySelector('.ld-bar i'),
      pct=el.querySelector('.ld-pct'),msg=el.querySelector('.ld-msg'),bar0=el.querySelector('.ld-bar');
  var MSGS=[
    [0,'Dari dapur ibu, dengan sepenuh hati…'],
    [22,'Dipilih dan diolah penuh sayang…'],
    [48,'Setiap kriuk menyimpan doa seorang ibu…'],
    [74,'Dikemas hangat, seperti pelukannya…'],
    [97,'Selamat menikmati, kasih ibu tiba di mejamu.']
  ];
  var msgIdx=-1;
  function setMsg(p){
    var i=0;for(var k=0;k<MSGS.length;k++)if(p>=MSGS[k][0])i=k;
    if(i===msgIdx)return;msgIdx=i;
    if(!msg)return;
    if(reduce){msg.textContent=MSGS[i][1];return;}
    msg.classList.add('swap');
    setTimeout(function(){msg.textContent=MSGS[i][1];msg.classList.remove('swap');},220);
  }
  function paint(v){
    var p=Math.round(v*100);
    if(ring)ring.style.strokeDashoffset=(C*(1-v)).toFixed(1);
    if(bar)bar.style.width=(v*100).toFixed(1)+'%';
    if(pct)pct.textContent=p+'%';
    if(bar0)bar0.setAttribute('aria-valuenow',p);
    setMsg(p);
  }
  paint(0);

  /* ── Loop utama ── */
  var t0=performance.now(),shown=0,finishing=false;
  function ease(x){return 1-Math.pow(1-x,2.2);}
  function tick(now){
    var el_=now-t0,timeP=Math.min(1,ease(Math.min(1,el_/CFG.minMs)));
    var r=el_>=CFG.maxMs?1:real();
    var target=Math.min(r,timeP);
    shown+=(target-shown)*.14;
    if(target-shown<.002)shown=target;          // rapatkan di akhir
    paint(Math.min(1,shown));
    if(shown>=1&&!finishing){finishing=true;complete();return;}
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ── Selesai: pop 100% → isi memudar → tirai terangkat → hero mulai ── */
  function complete(){
    el.classList.add('is-ready');
    setTimeout(function(){
      el.classList.add('is-out');
      setTimeout(release,reduce?0:330);     // hero mulai jatuh saat tirai mulai naik
      setTimeout(function(){
        if(el.parentNode)el.parentNode.removeChild(el);
        try{sessionStorage.setItem('mom4g-intro','1');}catch(e){}
      },reduce?600:1700);
    },reduce?150:560);
  }

  /* pengaman: apa pun yang terjadi, jangan sampai pengunjung tertahan */
  setTimeout(function(){if(!finishing){finishing=true;paint(1);complete();}},CFG.maxMs+1500);
})();
