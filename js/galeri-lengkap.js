/* Halaman Galeri Selengkapnya: filter, lightbox, menu mobile, dropdown Lainnya */
(function(){
  'use strict';
  var $=function(s,r){return(r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* ---- menu mobile ---- */
  var header=$('.header'), tgl=$('.menu-toggle'), mnav=$('#mobileNav');
  if(tgl&&mnav){
    tgl.addEventListener('click',function(){
      var open=mnav.hidden; mnav.hidden=!open;
      tgl.setAttribute('aria-expanded',open?'true':'false'); header.classList.toggle('menu-open',open);
    });
    $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){mnav.hidden=true;tgl.setAttribute('aria-expanded','false');header.classList.remove('menu-open')})});
  }

  /* ---- dropdown Lainnya ---- */
  var box=$('.nav-more');
  if(box){
    var btn=$('button',box), menu=$('.nav-more-menu',box);
    var set=function(o){box.classList.toggle('is-open',o);btn.setAttribute('aria-expanded',o?'true':'false')};
    btn.addEventListener('click',function(e){e.stopPropagation();set(!box.classList.contains('is-open'))});
    document.addEventListener('click',function(e){if(!box.contains(e.target))set(false)});
    menu.addEventListener('focusout',function(e){if(!box.contains(e.relatedTarget))set(false)});
  }

  /* ---- filter ---- */
  var cards=$$('.gl-card'), chips=$$('.gl-chip'), count=$('#glCount'), cur='all';
  function apply(f){
    cur=f; var n=0;
    cards.forEach(function(c,i){
      var show=f==='all'||c.dataset.cat===f; c.hidden=!show;
      if(show){n++; c.style.setProperty('--i',n-1); c.style.animation='none'; void c.offsetWidth; c.style.animation=''}
    });
    chips.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.filter===f?'true':'false')});
    count.textContent=n+' foto';
  }
  chips.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.filter)})});

  /* ---- lightbox ---- */
  var lb=$('#glLb'), img=$('#glLbImg'), cap=$('#glLbCap'), pos=0, last=null;
  function vis(){return cards.filter(function(c){return !c.hidden})}
  function show(k){
    var v=vis(); if(!v.length)return; pos=(k+v.length)%v.length;
    var c=v[pos], im=$('img',c);
    img.src=im.currentSrc||im.src; img.alt=im.alt;
    cap.textContent=c.dataset.cat.toUpperCase()==='KRIBO'?'Keju Goreng Kribo · '+(pos+1)+'/'+v.length:(c.querySelector('figcaption').textContent+' · '+(pos+1)+'/'+v.length);
  }
  function open(c){
    last=c; show(vis().indexOf(c)); lb.classList.add('is-open'); lb.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden'; $('#glClose').focus();
  }
  function close(){
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden','true'); document.documentElement.style.overflow='';
    if(last)last.focus({preventScroll:true});
  }
  cards.forEach(function(c){c.addEventListener('click',function(){open(c)})});
  $('#glClose').addEventListener('click',close);
  $('#glPrev').addEventListener('click',function(){show(pos-1)});
  $('#glNext').addEventListener('click',function(){show(pos+1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('gl-lb-stage'))close()});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('is-open'))return;
    if(e.key==='Escape')close(); else if(e.key==='ArrowLeft')show(pos-1); else if(e.key==='ArrowRight')show(pos+1);
  });
  var sx=null;
  lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(sx==null)return;var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50)show(pos+(d<0?1:-1));sx=null});
})();
