/* Galeri poster: kartu miring + pesawat yang terbang mengikuti scroll, lightbox, dan animasi GSAP.
   Memakai window.MOM.motionOn() agar ikut tombol "Jeda gerak" dan preferensi kurangi gerak. */
(() => {
  const M=window.MOM,$=s=>document.querySelector(s),folder='assets/promotion/';
  const wall=$('#posterGallery'),dialog=$('#posterDialog');
  if(!wall||!dialog)return;

  /* ---------- Data poster (urutan di dinding) ---------- */
  const posters=[
    {src:'poster-cemilan-oren.webp',alt:'Poster Cemilan Dapur Mom’s 4G: teman ngemil paling pas, keripik udang, keju goreng kribo, dan keripik bawang',tag:'Cemilan',title:'Teman ngemil paling pas',w:1080,h:1500,r:-4.5,mt:6,tape:-6},
    {src:'poster-kumpul-keluarga.webp',alt:'Poster Kumpul sekeluarga, makin kriuk: tiga rasa Dapur Mom’s 4G mulai Rp33.750',tag:'Kumpul sekeluarga',title:'Makin kriuk bareng keluarga',w:1440,h:1800,r:3,mt:-18,tape:5},
    {src:'WhatsApp Image 2026-10-25 at 02.31.46 (1).webp',alt:'Poster Keju Goreng Kribo',tag:'Keju Goreng Kribo',title:'Keriting, gurih, keju banget',w:1024,h:1280,r:-2,mt:54,tape:-3,grow:1.12},
    {src:'WhatsApp Image 2026-10-25 at 02.37.55 (1).webp',alt:'Poster Keripik Bawang',tag:'Keripik Bawang',title:'Gurih bawang, bikin nagih',w:1122,h:1402,r:4,mt:8,tape:6},
    {src:'WhatsApp Image 2026-10-25 at 02.37.55.webp',alt:'Poster Kribo gurih penuh keju',tag:'Kribo Keju',title:'Penuh rasa keju',w:1122,h:1402,r:-3.5,mt:46,tape:-5}
  ];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- Bangun panggung: jalur, kartu poster, pesawat ---------- */
  const stage=wall;
  stage.innerHTML=`<svg class="tv-route" aria-hidden="true" focusable="false"><defs><mask id="tvMask" maskUnits="userSpaceOnUse"><path class="tv-reveal" pathLength="1"/></mask></defs><path class="tv-dash" mask="url(#tvMask)"/></svg>`+
    posters.map((p,i)=>`<div class="tv-row" data-i="${i}" style="--r:${p.r}deg"><button type="button" class="tv-btn" data-poster="${i}" aria-label="Perbesar ${esc(p.alt)}"><span class="tv-pic"><img src="${folder+p.src}" alt="${esc(p.alt)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async"></span><span class="tv-label" aria-hidden="true">${esc(p.tag.toUpperCase())}</span><span class="tv-cap"><span>${esc(p.title)}</span><i aria-hidden="true">↗</i></span></button></div>`).join('')+
    `<span class="tv-plane" aria-hidden="true"><img class="sh" src="assets/pesawat.webp" alt="" width="502" height="520"><img class="pl" src="assets/pesawat.webp" alt="" width="502" height="520"></span>`;

  /* ---------- Lightbox ---------- */
  dialog.className='poster-dialog gl-lb';
  dialog.innerHTML=`<button type="button" class="dialog-close" aria-label="Tutup poster">×</button><div class="gl-lb-body"><button type="button" class="gl-nav prev" aria-label="Poster sebelumnya">←</button><figure><div class="gl-lb-paper"><img id="largePoster" alt=""><b id="lbTitle"></b></div><figcaption><span id="lbCount"></span><a class="gl-lb-cta" href="#kemasan">Pilih kemasannya ↗</a></figcaption></figure><button type="button" class="gl-nav next" aria-label="Poster berikutnya">→</button></div>`;
  const img=$('#largePoster'),lbTitle=$('#lbTitle'),lbCount=$('#lbCount'),paper=dialog.querySelector('.gl-lb-paper');
  let cur=0,openerCard=null;
  const animated=()=>Boolean(window.gsap)&&M.motionOn();
  function fill(i){
    const p=posters[i];img.src=folder+p.src;img.alt=p.alt;lbTitle.textContent=p.title;lbCount.textContent=`${String(i+1).padStart(2,'0')} / ${String(posters.length).padStart(2,'0')} · ${p.tag.toUpperCase()}`;
    [i-1,i+1].map(n=>(n+posters.length)%posters.length).forEach(n=>{const pre=new Image();pre.src=folder+posters[n].src;});
  }
  function go(dir){
    cur=(cur+dir+posters.length)%posters.length;
    if(!animated()){fill(cur);return;}
    gsap.timeline().to(paper,{x:-dir*70,opacity:0,rotate:-dir*4,duration:.22,ease:'power2.in',onComplete:()=>fill(cur)})
      .fromTo(paper,{x:dir*70,rotate:dir*4},{x:0,opacity:1,rotate:-1.2,duration:.5,ease:'back.out(1.6)'});
  }
  function openAt(i,card){
    cur=i;openerCard=card;fill(i);document.dispatchEvent(new Event('gl:pause'));
    dialog.showModal();M.lenis?.stop();
    if(animated()){
      const r=card?.getBoundingClientRect(),pr=paper.getBoundingClientRect();
      const dx=r?(r.left+r.width/2)-(pr.left+pr.width/2):0,dy=r?(r.top+r.height/2)-(pr.top+pr.height/2):40;
      gsap.fromTo(paper,{x:dx,y:dy,scale:.35,rotate:posters[i].r*2,opacity:0},{x:0,y:0,scale:1,rotate:-1.2,opacity:1,duration:.7,ease:'power4.out'});
      gsap.from(dialog.querySelectorAll('figcaption,.gl-nav,.dialog-close'),{opacity:0,y:16,duration:.5,delay:.25,stagger:.05,ease:'power2.out',clearProps:'all'});
    }
  }
  function closeBox(){
    if(!dialog.open)return;
    if(!animated()){dialog.close();return;}
    gsap.to(paper,{y:50,scale:.85,opacity:0,rotate:3,duration:.28,ease:'power2.in',onComplete:()=>{dialog.close();gsap.set(paper,{clearProps:'all'});}});
  }
  wall.addEventListener('click',e=>{const b=e.target.closest('[data-poster]');if(b)openAt(Number(b.dataset.poster),b.closest('.tv-row'));});
  dialog.querySelector('.dialog-close').addEventListener('click',closeBox);
  dialog.querySelector('.prev').addEventListener('click',()=>go(-1));
  dialog.querySelector('.next').addEventListener('click',()=>go(1));
  dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.classList.contains('gl-lb-body'))closeBox();});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(-1);if(e.key==='ArrowRight')go(1);});
  dialog.addEventListener('close',()=>{M.lenis?.start();openerCard?.querySelector('.tv-btn')?.focus({preventScroll:true});});
  dialog.querySelector('.gl-lb-cta').addEventListener('click',()=>dialog.close());
  let sx=null;
  dialog.querySelector('figure').addEventListener('pointerdown',e=>{sx=e.clientX;});
  dialog.querySelector('figure').addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>55)go(dx<0?1:-1);});

  /* ---------- Jalur terbang + animasi GSAP (ikut tombol Jeda gerak) ---------- */
  const NS_MASK=stage.querySelector('#tvMask'),dash=stage.querySelector('.tv-dash'),reveal=stage.querySelector('.tv-reveal'),svg=stage.querySelector('.tv-route');
  const plane=stage.querySelector('.tv-plane'),plShadow=plane.querySelector('.sh'),plBody=plane.querySelector('.pl');
  const rows=Array.from(stage.querySelectorAll('.tv-row'));
  const NOSE=48; /* arah hidung pesawat di gambar (derajat, mengarah kanan-bawah) */
  let L=1,fly=0,want=0,raf=0,movable=false;

  /* Jalur dibuat dari posisi kartu yang sebenarnya, jadi otomatis cocok di HP maupun desktop */
  function buildRoute(){
    const W=stage.offsetWidth,H=stage.offsetHeight;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    NS_MASK.setAttribute('x',-300);NS_MASK.setAttribute('y',-300);NS_MASK.setAttribute('width',W+600);NS_MASK.setAttribute('height',H+600);
    const pts=[{x:W*.94,y:-30}];
    rows.forEach((r,i)=>{
      const x=r.offsetLeft,y=r.offsetTop,w=r.offsetWidth,h=r.offsetHeight,cx=x+w/2,side=cx<W/2?1:-1;
      const px=side>0?x+w+w*.1+22:x-w*.1-22;
      pts.push({x:Math.min(W-14,Math.max(14,px)),y:y+h*(i%2?.38:.58)});
    });
    pts.push({x:W+90,y:H+10});
    let d=`M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for(let i=0;i<pts.length-1;i++){
      const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2,k=.2;
      d+=` C${(p1.x+(p2.x-p0.x)*k).toFixed(1)} ${(p1.y+(p2.y-p0.y)*k).toFixed(1)} ${(p2.x-(p3.x-p1.x)*k).toFixed(1)} ${(p2.y-(p3.y-p1.y)*k).toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    dash.setAttribute('d',d);reveal.setAttribute('d',d);L=dash.getTotalLength()||1;
  }
  function place(p){
    const len=Math.max(0,Math.min(1,p))*L,a=dash.getPointAtLength(len),b=dash.getPointAtLength(Math.min(L,len+3)),c=dash.getPointAtLength(Math.max(0,len-3));
    const ang=Math.atan2((b.y-c.y)||1,(b.x-c.x)||1)*180/Math.PI-NOSE;
    const s=.82+.3*Math.sin(Math.PI*Math.min(1,Math.max(0,p)));   /* naik lalu turun, kesan ketinggian */
    plane.style.transform=`translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
    plBody.style.transform=`translate(-50%,-50%) rotate(${ang.toFixed(1)}deg) scale(${s.toFixed(3)})`;
    plShadow.style.transform=`translate(calc(-50% + ${(12*s).toFixed(1)}px),calc(-50% + ${(30*s).toFixed(1)}px)) rotate(${ang.toFixed(1)}deg) scale(${(s*.96).toFixed(3)})`;
    reveal.style.strokeDashoffset=String(1-(movable?p:1));
  }
  function frame(){fly+=(want-fly)*.13;if(Math.abs(want-fly)<.0005)fly=want;place(fly);raf=fly===want?0:requestAnimationFrame(frame);}
  const kick=()=>{if(!raf)raf=requestAnimationFrame(frame);};

  let ctx=null,ro=null,rt=0;
  function teardown(){cancelAnimationFrame(raf);raf=0;ro?.disconnect();ro=null;ctx?.revert();ctx=null;}
  function setup(){
    teardown();
    movable=Boolean(window.gsap&&window.ScrollTrigger)&&M.motionOn();
    buildRoute();
    if(!movable){fly=want=.07;place(.07);plane.classList.add('is-parked');return;}   /* diam: pesawat parkir, jalur tampil penuh */
    plane.classList.remove('is-parked');
    ctx=gsap.context(()=>{
      /* Kartu menempel satu per satu saat terlihat */
      rows.forEach((row,i)=>gsap.from(row,{opacity:0,y:90,scale:.82,rotation:i%2?10:-10,duration:.95,ease:'back.out(1.5)',scrollTrigger:{trigger:row,start:'top 90%',once:true}}));
      /* Pesawat terbang mengikuti scroll */
      ScrollTrigger.create({trigger:stage,start:'top 72%',end:'bottom 42%',
        onUpdate:s=>{want=s.progress;kick();},
        onRefresh:s=>{want=fly=s.progress;place(fly);}});
    },stage.closest('.tv')||stage);
    if('ResizeObserver' in window){
      ro=new ResizeObserver(()=>{clearTimeout(rt);rt=setTimeout(()=>{buildRoute();window.ScrollTrigger?.refresh();place(fly);},160);});
      ro.observe(stage);
    }
  }
  document.addEventListener('motionchange',setup);
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(setup);
  setup();
})();
