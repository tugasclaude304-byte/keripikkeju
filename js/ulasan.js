/* FAQ (akordeon halus) + rating & komentar pelanggan.
   Cara kerja ulasan:
   - Ulasan yang dikirim pelanggan disimpan di browser pelanggan itu sendiri (localStorage),
     langsung tampil, dan bisa dikirim ke admin lewat WhatsApp.
   - Ulasan resmi yang boleh tampil untuk SEMUA pengunjung: isi array `reviews` di js/data.js
     dengan {name, product, rating, text, date}. Atau isi CFG.ENDPOINT dengan alamat server
     (GET -> daftar ulasan, POST -> kirim ulasan baru) supaya ulasan tersimpan terpusat. */
(() => {
  const CFG = { ENDPOINT: '', LS: 'mom_reviews_v1', MAX: 400 };
  const $ = id => document.getElementById(id);
  const M = window.MOM || { site: { name: 'Dapur Mom’s 4G', wa: '6281295554083' }, products: [], reviews: [] };

  /* ---------- FAQ: buka-tutup dengan animasi tinggi, satu terbuka sekali waktu ---------- */
  const fq = $('fqList');
  if (fq) {
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    const items = [...fq.querySelectorAll('details')];
    const anim = (d, open) => {
      const a = d.querySelector('.fq-a');
      d.dataset.o = open ? '1' : '0';
      if (d._an) d._an.cancel();
      if (rm.matches) { d.open = open; return; }
      if (open) d.open = true;
      const h = a.scrollHeight;
      const kf = open ? [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }] : [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }];
      const an = d._an = a.animate(kf, { duration: open ? 420 : 320, easing: 'cubic-bezier(.2,.9,.2,1)' });
      an.onfinish = () => { if (!open) d.open = false; d._an = null; };
    };
    items.forEach(d => { d.dataset.o = d.open ? '1' : '0'; d.querySelector('summary').addEventListener('click', e => {
      e.preventDefault();
      if (d.dataset.o === '1') { anim(d, false); return; }
      items.forEach(o => { if (o !== d && o.dataset.o === '1') anim(o, false); });
      anim(d, true);
    }); });
  }

  /* ---------- Ulasan ---------- */
  const list = $('rvList'); if (!list) return;
  const COL = ['#e0140a', '#d97706', '#f97316', '#be185d', '#7c3aed', '#0f766e', '#2563eb'];
  const STAR = '<svg class="rv-st" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
  const LABEL = ['', 'Perlu ditingkatkan', 'Kurang sesuai selera', 'Cukup suka', 'Enak!', 'Suka banget!'];
  const prods = (M.products || []).map(p => p.name);
  const OTHER = 'Beberapa rasa';
  let remote = [], filter = 'Semua';

  const load = () => { try { const r = JSON.parse(localStorage.getItem(CFG.LS) || '[]'); return Array.isArray(r) ? r : []; } catch (e) { return []; } };
  const save = a => { try { localStorage.setItem(CFG.LS, JSON.stringify(a)); } catch (e) { /* abaikan */ } };
  let mine = load();

  const norm = (r, own) => {
    const rating = Math.round(Number(r.rating));
    if (!r || !r.name || !r.text || !(rating >= 1 && rating <= 5)) return null;
    const ts = r.ts || Date.parse(r.date || '') || 0;
    return { id: r.id || ('x' + ts + r.name), name: String(r.name).slice(0, 40), product: String(r.product || OTHER).slice(0, 40), rating, text: String(r.text).slice(0, CFG.MAX), ts, own: !!own };
  };
  const all = () => [
    ...mine.map(r => norm(r, true)), ...remote.map(r => norm(r, false)), ...(M.reviews || []).map(r => norm(r, false))
  ].filter(Boolean).sort((a, b) => b.ts - a.ts);

  const dateTxt = ts => ts ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(ts) : '';
  const stars = n => Array.from({ length: 5 }, (_, i) => STAR.replace('class="rv-st"', `class="rv-st${i < n ? ' on' : ''}"`)).join('');
  const colorOf = s => COL[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COL.length];
  const initials = n => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  function renderSummary(a) {
    const n = a.length, avg = n ? a.reduce((s, r) => s + r.rating, 0) / n : 0;
    $('rvAvg').textContent = n ? avg.toFixed(1).replace('.', ',') : '–';
    $('rvAvgStars').innerHTML = stars(Math.round(avg));
    $('rvCount').textContent = n ? `Dari ${n} ulasan` : 'Belum ada ulasan';
    $('rvBars').innerHTML = [5, 4, 3, 2, 1].map(k => {
      const c = a.filter(r => r.rating === k).length;
      return `<li><span>${k}</span><span class="rv-bar"><i style="width:${n ? c / n * 100 : 0}%"></i></span><span>${c}</span></li>`;
    }).join('');
  }
  function renderFilter() {
    const opts = ['Semua', ...prods, OTHER];
    $('rvFilter').innerHTML = opts.map(o => `<button type="button" class="rv-chip" aria-pressed="${o === filter}" data-f="${o.replace(/"/g, '&quot;')}">${o}</button>`).join('');
  }
  function render() {
    const a = all();
    renderSummary(a);
    const shown = filter === 'Semua' ? a : a.filter(r => r.product === filter);
    list.textContent = '';
    shown.forEach(r => {
      const li = document.createElement('li'); li.className = 'rv-item';
      li.innerHTML = `<div class="rv-top"><span class="rv-av" style="--c:${colorOf(r.name)}"></span><div class="rv-who"><b><span class="rv-nm"></span>${r.own ? '<span class="rv-tag">ULASANMU</span>' : ''}</b><small>${dateTxt(r.ts)}</small></div><span class="rv-stars-ro" aria-label="${r.rating} dari 5 bintang">${stars(r.rating)}</span></div><span class="rv-prod"></span><p class="rv-txt"></p>${r.own ? '<button type="button" class="rv-del">Hapus ulasanku</button>' : ''}`;
      li.querySelector('.rv-av').textContent = initials(r.name);
      li.querySelector('.rv-nm').textContent = r.name;
      li.querySelector('.rv-prod').textContent = r.product;
      li.querySelector('.rv-txt').textContent = r.text;
      const del = li.querySelector('.rv-del');
      if (del) del.addEventListener('click', () => { mine = mine.filter(m => m.id !== r.id); save(mine); render(); });
      list.appendChild(li);
    });
    $('rvEmpty').hidden = shown.length > 0;
    requestAnimationFrame(() => $('rvBars').querySelectorAll('.rv-bar i').forEach(i => { const w = i.style.width; i.style.width = '0'; requestAnimationFrame(() => { i.style.width = w; }); }));
  }

  /* form */
  $('rvProduct').innerHTML = [...prods, OTHER].map(p => `<option>${p}</option>`).join('');
  renderFilter();
  $('rvFilter').addEventListener('click', e => { const b = e.target.closest('.rv-chip'); if (!b) return; filter = b.dataset.f; renderFilter(); render(); });

  const form = $('rvForm'), status = $('rvStatus'), txt = $('rvText'), cnt = $('rvCnt');
  form.querySelectorAll('[name=rvRating]').forEach(r => r.addEventListener('change', () => { $('rvRateTxt').textContent = `${r.value}/5 · ${LABEL[r.value]}`; }));
  txt.addEventListener('input', () => { cnt.textContent = `${txt.value.length}/${CFG.MAX}`; txt.classList.remove('bad'); });
  $('rvName').addEventListener('input', e => e.target.classList.remove('bad'));
  const say = (m, ok) => { status.className = 'rv-status' + (ok ? ' ok' : ''); status.textContent = m; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if ($('rvWeb').value) return; // jebakan spam
    const rating = Number((form.querySelector('[name=rvRating]:checked') || {}).value || 0);
    const name = $('rvName').value.trim(), text = txt.value.trim(), product = $('rvProduct').value;
    if (!rating) { say('Pilih bintang dulu, ya.'); return; }
    if (name.length < 2) { $('rvName').classList.add('bad'); $('rvName').focus(); say('Isi namamu dulu, ya.'); return; }
    if (text.length < 10) { txt.classList.add('bad'); txt.focus(); say('Tulis komentar minimal 10 huruf, ya.'); return; }
    const r = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, product, rating, text, ts: Date.now() };
    mine.unshift(r); save(mine); filter = 'Semua'; renderFilter(); render();
    form.reset(); cnt.textContent = `0/${CFG.MAX}`; $('rvRateTxt').textContent = 'Pilih bintang';
    if (CFG.ENDPOINT) { try { await fetch(CFG.ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }); } catch (er) { /* abaikan */ } }
    const msg = `Halo ${M.site.name}, saya ${name} mau berbagi ulasan.\n\nProduk: ${product}\nRating: ${rating}/5\nUlasan: ${text}`;
    status.className = 'rv-status ok';
    status.innerHTML = 'Terima kasih! Ulasanmu sudah tampil di bawah. ';
    const a = document.createElement('a'); a.className = 'rv-wa'; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.href = `https://wa.me/${M.site.wa}?text=${encodeURIComponent(msg)}`; a.textContent = 'Kirim juga ke admin via WhatsApp ↗';
    status.appendChild(document.createElement('br')); status.appendChild(a);
    list.firstElementChild && list.firstElementChild.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });

  render();
  if (CFG.ENDPOINT) fetch(CFG.ENDPOINT).then(r => r.json()).then(d => { if (Array.isArray(d)) { remote = d; render(); } }).catch(() => {});
})();
