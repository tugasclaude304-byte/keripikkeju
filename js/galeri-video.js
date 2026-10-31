/* Galeri video "Layar Cerita": tiap video dibagi jadi bagian (rasa/adegan). Teks, warna, tombol pesan & timeline
   berganti otomatis mengikuti detik video. Data bagian: array VID di bawah → [detik mulai, judul, deskripsi, warna, id rasa]. */
(() => {
  const root = document.getElementById('vx'); if (!root) return;
  const $ = id => document.getElementById(id), M = window.MOM;
  const stage = $('vxStage'), v = $('vxVideo'), track = $('vxTrack'), chaps = $('vxChaps'), now = $('vxNow'), list = $('vxList'), cta = $('vxCta'), pl = $('vxPlayer');
  const D = 'assets/promotion/WhatsApp Video 2026-10-25 at ', T = 'assets/video/';
  const K = '#f5a300', U = '#e8481c', B = '#8a45c4', G = '#1f9d55';
  const NAME = { keju: 'Kribo', udang: 'Udang', bawang: 'Bawang' };
  const VID = [
    { src: D + '02.31.46.mp4', t: 'Tiga rasa, satu cerita', d: 'Kribo, Udang, Bawang tampil bergantian. Klik bagian favoritmu.', len: 27.4, ch: [
      [0, 'Keju Goreng Kribo', 'Keju goreng yang renyah dan gurih, pembuka cerita.', K, 'keju'],
      [9.5, 'Keripik Udang', 'Kriuk udang yang gurih, sekali gigit langsung ketagihan.', U, 'udang'],
      [15.5, 'Keripik Bawang', 'Renyah, harum bawang, dan gurih. Susah berhenti.', B, 'bawang'],
      [23.5, 'Dari dapur Mom’s 4G', 'Kasih sayang dari cemilan ibu: tiga rasa, satu dapur.', G, null]] },
    { src: D + '02.31.47.mp4', t: 'Kribo dari dekat', d: 'Dari kemasan sampai remah keju yang jatuh.', len: 7.9, ch: [
      [0, 'Kenalan dulu', 'Keju Goreng Kribo, dikelilingi kribo yang melayang.', K, 'keju'],
      [2.5, 'Patahkan, remahnya jatuh', 'Renyahnya sudah terasa sebelum digigit.', K, 'keju'],
      [5.8, 'Semangkuk kriuk', 'Keju asli dan halal, siap disantap kapan saja.', K, 'keju']] },
    { src: D + '02.31.47 (1).mp4', t: 'Teman kerja & hari raya', d: 'Tiga rasa yang cocok buat meja kerja dan meja tamu.', len: 9, ch: [
      [0, 'Si Kribo duluan', 'Kemasan Keju Goreng Kribo tampil paling depan.', K, 'keju'],
      [2, 'Tiga rasa, satu meja', 'Kribo, Udang, Bawang: cemilan teman kerja dan hari raya.', U, null],
      [7, 'Pesan sekarang', 'Chat WhatsApp Dapur Mom’s 4G dan pilih rasamu.', G, null]] }
  ];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let idx = -1, cc = -1, userPaused = false, visible = false, muted = true, scrub = false, segs = [];
  let started = false, resume = false;      // started: baru true setelah pengunjung menekan putar. Sebelum itu video TIDAK pernah jalan sendiri.
  const fmt = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const end = (x, n) => n < x.ch.length - 1 ? x.ch[n + 1][0] : x.len;
  const len = () => v.duration || VID[idx].len;
  const play = () => { if (!v.src) return; started = true; root.classList.add('is-started'); const r = v.play(); if (r && r.catch) r.catch(() => root.classList.remove('is-playing')); };

  list.innerHTML = VID.map((x, i) => `<li><button type="button" class="vx-it" data-i="${i}" aria-label="Video ${i + 1}: ${x.t}"><span class="vx-th"><img src="${T}v${i + 1}-poster.webp" alt="" width="960" height="540" loading="lazy" decoding="async"><em>${fmt(x.len)}</em></span><span><small>VIDEO ${String(i + 1).padStart(2, '0')}</small><b>${x.t}</b><p>${x.d}</p><span class="vx-dots">${x.ch.map(c => `<i style="--sc:${c[3]}"></i>`).join('')}</span></span><i class="vx-bar"></i></button></li>`).join('');
  const items = [...list.querySelectorAll('.vx-it')];

  function setChap(n) {
    const x = VID[idx], c = x.ch[n]; cc = n;
    root.style.setProperty('--c', c[3]);
    $('vxChip').textContent = c[1];
    $('vxNum').textContent = String(n + 1).padStart(2, '0');
    $('vxSmall').textContent = 'VIDEO ' + String(idx + 1).padStart(2, '0') + ' · ' + x.t;
    $('vxTitle').textContent = c[1]; $('vxDesc').textContent = c[2];
    cta.textContent = c[4] ? 'Pesan ' + NAME[c[4]] : 'Pesan sekarang'; cta.dataset.f = c[4] || '';
    [...chaps.children].forEach((b, i) => b.classList.toggle('on', i === n));
    if (!reduce.matches && stage.dataset.on) { stage.classList.remove('wipe'); void stage.offsetWidth; stage.classList.add('wipe'); }
    stage.dataset.on = '1';
    now.classList.remove('in'); void now.offsetWidth; now.classList.add('in');
  }
  function tick() {
    const x = VID[idx], t = v.currentTime || 0, L = len();
    segs.forEach((s, n) => { s.firstChild.style.width = Math.max(0, Math.min(1, (t - x.ch[n][0]) / (end(x, n) - x.ch[n][0]))) * 100 + '%'; });
    let n = 0; x.ch.forEach((c, i) => { if (t >= c[0] - .05) n = i; });
    if (n !== cc) setChap(n);
    $('vxCur').textContent = fmt(t); track.setAttribute('aria-valuenow', Math.round(t / L * 100));
    items[idx].style.setProperty('--p', (t / L * 100).toFixed(1) + '%');
  }
  function layout() {
    const x = VID[idx];
    track.innerHTML = x.ch.map((c, n) => `<span class="vx-seg" style="--w:${end(x, n) - c[0]};--sc:${c[3]}"><i></i></span>`).join('');
    segs = [...track.children]; $('vxDur').textContent = fmt(x.len);
  }
  function load(i, auto = true) {
    i = (i + VID.length) % VID.length; const x = VID[i]; v.pause(); idx = i; cc = -1; delete stage.dataset.on;
    items.forEach((b, n) => { b.classList.toggle('on', n === i); b.style.setProperty('--p', '0%'); if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    v.poster = T + 'v' + (i + 1) + '-poster.webp'; v.src = x.src; v.load(); v.muted = muted;
    chaps.innerHTML = x.ch.map((c, n) => `<button type="button" class="vx-ch" data-n="${n}" style="--sc:${c[3]}"><img src="${T}v${i + 1}-${n + 1}.webp" alt="" width="32" height="32" loading="lazy"><span>${c[1]} <small>${fmt(c[0])}</small></span></button>`).join('');
    layout(); setChap(0); root.classList.remove('is-playing');
    if (auto && started && visible && !userPaused) play();
  }
  items.forEach((b, n) => b.addEventListener('click', () => { userPaused = false; visible = true; started = true; if (n === idx) { if (v.paused) play(); } else load(n); }));
  chaps.addEventListener('click', e => { const b = e.target.closest('.vx-ch'); if (!b) return; v.currentTime = VID[idx].ch[+b.dataset.n][0] + .01; userPaused = false; tick(); play(); });
  cta.addEventListener('click', e => { const f = cta.dataset.f; if (f && M && M.selectProduct) { e.preventDefault(); M.selectProduct(f); } });

  /* miringan 3D halus mengikuti kursor (desktop) */
  if (matchMedia('(hover:hover)').matches && !reduce.matches) {
    pl.addEventListener('pointermove', e => { if (document.fullscreenElement) return; const r = pl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; pl.style.transform = `perspective(1400px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`; });
    pl.addEventListener('pointerleave', () => { pl.style.transform = ''; });
  }
  const toggle = () => { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } };
  $('vxTap').addEventListener('click', toggle); $('vxPP').addEventListener('click', toggle);
  $('vxSnd').addEventListener('click', () => { muted = !muted; v.muted = muted; root.classList.toggle('is-sound', !muted); $('vxSnd').setAttribute('aria-pressed', String(!muted)); if (started && v.paused && !userPaused) play(); });
  $('vxFs').addEventListener('click', () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (pl.requestFullscreen) pl.requestFullscreen().catch(() => {}); else if (pl.webkitRequestFullscreen) pl.webkitRequestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  });
  const seekX = x => { const r = track.getBoundingClientRect(); v.currentTime = Math.min(1, Math.max(0, (x - r.left) / r.width)) * len(); tick(); };
  track.addEventListener('pointerdown', e => { scrub = true; track.setPointerCapture(e.pointerId); seekX(e.clientX); });
  track.addEventListener('pointermove', e => { if (scrub) seekX(e.clientX); });
  track.addEventListener('pointerup', () => { scrub = false; });
  track.addEventListener('keydown', e => {
    const k = e.key, d = k === 'ArrowRight' ? 5 : k === 'ArrowLeft' ? -5 : 0;
    if (d) { e.preventDefault(); v.currentTime = Math.max(0, Math.min(len(), v.currentTime + d)); tick(); }
    else if (k === 'Home') v.currentTime = 0; else if (k === 'End') v.currentTime = len() - .1;
  });

  v.addEventListener('play', () => { started = true; root.classList.add('is-started', 'is-playing'); });
  v.addEventListener('pause', () => root.classList.remove('is-playing'));
  v.addEventListener('timeupdate', tick);
  v.addEventListener('loadedmetadata', () => { if (v.duration && Math.abs(v.duration - VID[idx].len) > .3) { VID[idx].len = v.duration; layout(); } });
  v.addEventListener('ended', () => { root.classList.remove('is-playing'); setTimeout(() => { if (visible && started && !userPaused) load(idx + 1); }, 700); });

  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => {
    visible = en.isIntersecting && en.intersectionRatio >= .4;
    if (visible) { if (started && resume && !userPaused) play(); resume = false; }
    else { resume = !v.paused; v.pause(); }                       // keluar layar → jeda; kembali → lanjut hanya jika tadi memang sedang diputar
  }, { threshold: [0, .4] }).observe($('vxStage'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resume = !v.paused; v.pause(); } else if (visible && started && resume && !userPaused) { resume = false; play(); } });
  document.addEventListener('gl:pause', () => { resume = false; v.pause(); });
  load(0, false);
  const cue = $('vxCue'); if (cue) cue.textContent = 'Putar video · ' + fmt(VID[0].len);
})();
