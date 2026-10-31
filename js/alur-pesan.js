/* Pesan cepat di section Kemasan: tiga rasa langsung tampil, tiap rasa punya tombol − 0 +.
   Total langsung terhitung; satu tombol "Pesan sekarang" membuka form (panel keranjang).
   Pratinjau kantong di kiri ikut berubah mengikuti rasa & jumlah yang terakhir ditekan.
   Hanya memakai API lama: M.cart, M.addOrder, M.cartAdjust, M.cartRemove, M.selectProduct. */
(() => {
  const M = window.MOM, $ = s => document.querySelector(s);
  const tabs = $('#kqTabs'), combo = $('#kqCombo'), list = $('#kqList'), info = $('#kqInfo'), total = $('#kqTotal'), go = $('#kqGo'), max = $('#kqMax');
  if (!M || !list) return;
  const cart = () => M.cart || {};
  const wt = n => (M.packs[n - 1] || { weight: n * 250 + ' g' }).weight;
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  list.innerHTML = M.products.map(p => `
    <li class="kq-row" data-id="${p.id}" style="--c:${p.color}">
      <span class="kq-img"><img src="${esc(p.image)}" alt="" width="56" height="68" loading="lazy" decoding="async"></span>
      <div class="kq-nm"><b>${esc(p.name)}</b><small data-sub>${M.money(p.price)} / 250 g</small></div>
      <div class="kq-step" role="group" aria-label="Jumlah ${esc(p.name)}">
        <button type="button" data-d="-1" aria-label="Kurangi ${esc(p.name)}">−</button>
        <output aria-live="polite"><b data-n>0</b><small data-w>kemasan</small></output>
        <button type="button" data-d="1" aria-label="Tambah ${esc(p.name)}">+</button>
      </div>
    </li>`).join('');

  function paint() {
    let packs = 0, kinds = 0, atMax = false;
    list.querySelectorAll('.kq-row').forEach(row => {
      const p = M.products.find(x => x.id === row.dataset.id), n = cart()[p.id] || 0;
      packs += n; if (n) kinds++; if (n >= 4) atMax = true;
      row.classList.toggle('on', n > 0);
      row.querySelector('[data-n]').textContent = n ? wt(n) : '0';
      row.querySelector('[data-w]').textContent = n ? n + ' kemasan' : 'kemasan';
      row.querySelector('[data-sub]').textContent = n ? `${M.money(n * p.price)} · ${n} × 250 g` : `${M.money(p.price)} / 250 g`;
      row.querySelector('[data-d="-1"]').disabled = n < 1;
      row.querySelector('[data-d="1"]').disabled = n >= 4;
    });
    max.hidden = !atMax;
    info.textContent = packs ? `${kinds} rasa · ${packs} kemasan (${packs * 250 >= 1000 ? (packs * .25).toString().replace('.', ',') + ' kg' : packs * 250 + ' g'})` : 'Belum ada pilihan';
    total.textContent = M.money(M.total(cart()));
    go.disabled = !packs;
  }

  /* pratinjau kantong di kiri ikut berubah */
  const preview = (id, n) => {
    if (M.selectProduct) M.selectProduct(id);
    const b = document.querySelector(`.kx-stops [data-count="${n}"]`); if (b) b.click();
  };

  list.addEventListener('click', e => {
    const pick = e.target.closest('.kq-img,.kq-nm');                          // ketuk foto/nama rasa → pratinjau pindah ke rasa itu
    if (pick) { const rid = pick.closest('.kq-row').dataset.id; preview(rid, Math.max(1, cart()[rid] || 0)); return; }
    const b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
    const id = b.closest('.kq-row').dataset.id, d = Number(b.dataset.d), n = cart()[id] || 0, next = n + d;
    if (next < 0 || next > 4) return;
    if (next === 0) M.cartRemove(id);
    else if (n === 0) M.addOrder(id, 1);
    else M.cartAdjust(id, d);
    if (next > 0) preview(id, next);
  });


  /* ---- PAKET: duo & komplit (menambah beberapa rasa sekaligus; harga = jumlah harga satuan) ---- */
  const COMBOS = [
    { k: 'duo', n: 'Kribo + Udang', t: 'Keju gurih ketemu kriuk udang', q: { keju: 1, udang: 1 } },
    { k: 'duo', n: 'Kribo + Bawang', t: 'Duet klasik, gurihnya dua kali', q: { keju: 1, bawang: 1 } },
    { k: 'duo', n: 'Bawang + Udang', t: 'Dua kriuk dalam satu genggaman', q: { bawang: 1, udang: 1 } },
    { k: 'komplit', n: 'Paket Komplit', t: 'Ketiga rasa, satu meja', q: { keju: 1, bawang: 1, udang: 1 } },
    { k: 'komplit', n: 'Paket Rame-Rame', t: '2 kemasan tiap rasa, buat arisan & hari raya', q: { keju: 2, bawang: 2, udang: 2 } },
    { k: 'komplit', n: 'Dobel Kribo', t: 'Kribo 2×, ditemani Bawang & Udang', q: { keju: 2, bawang: 1, udang: 1 } }
  ];
  const TABS = [['satu', 'Satuan', M.products.length], ['duo', 'Duo', 3], ['komplit', 'Komplit', 3]];
  const P = id => M.products.find(x => x.id === id);
  tabs.innerHTML = TABS.map(([k, l, c], i) => `<button type="button" role="tab" data-t="${k}" aria-selected="${i === 0}"><b>${l}</b><small>${c} pilihan</small></button>`).join('');
  combo.innerHTML = COMBOS.map((c, i) => {
    const ids = Object.keys(c.q), packs = ids.reduce((a, id) => a + c.q[id], 0), price = ids.reduce((a, id) => a + c.q[id] * P(id).price, 0);
    c.price = price;
    return `<li class="kq-row kc" data-ci="${i}" data-k="${c.k}" ${c.k === 'duo' ? 'hidden' : 'hidden'}>
      <span class="kq-img kc-pics">${ids.map(id => `<img src="${esc(P(id).image)}" alt="" width="46" height="54" loading="lazy" decoding="async">`).join('')}</span>
      <div class="kq-nm"><em class="kc-tag">${ids.length} RASA · ${packs * 250 >= 1000 ? (packs * .25).toString().replace('.', ',') + ' kg' : packs * 250 + ' g'}</em><b>${c.n}</b><small data-sub>${M.money(price)} · ${ids.map(id => (c.q[id] > 1 ? c.q[id] + ' ' : '') + P(id).short).join(' + ')}</small><span class="kc-t">${c.t}</span></div>
      <div class="kq-step" role="group" aria-label="Jumlah ${esc(c.n)}"><button type="button" data-d="-1" aria-label="Kurangi ${esc(c.n)}">−</button><output aria-live="polite"><b data-n>0</b><small>paket</small></output><button type="button" data-d="1" aria-label="Tambah ${esc(c.n)}">+</button></div>
    </li>`;
  }).join('');
  let tab = 'satu';
  const showTab = k => {
    tab = k; tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === k)));
    list.hidden = k !== 'satu'; combo.hidden = k === 'satu';
    combo.querySelectorAll('.kc').forEach(li => { li.hidden = li.dataset.k !== k; });
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) showTab(b.dataset.t); });
  const cn = c => Math.min(...Object.keys(c.q).map(id => Math.floor((cart()[id] || 0) / c.q[id])));
  function paintCombos() {
    combo.querySelectorAll('.kc').forEach(li => {
      const c = COMBOS[li.dataset.ci], n = cn(c), ids = Object.keys(c.q);
      li.classList.toggle('on', n > 0);
      li.querySelector('[data-n]').textContent = n;
      li.querySelector('[data-sub]').textContent = n ? `${M.money(n * c.price)} · ${n} paket` : li.querySelector('[data-sub]').textContent;
      li.querySelector('[data-d="-1"]').disabled = n < 1;
      li.querySelector('[data-d="1"]').disabled = ids.some(id => (cart()[id] || 0) + c.q[id] > 4);
    });
  }
  combo.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'), row = e.target.closest('.kc'); if (!row) return;
    const c = COMBOS[row.dataset.ci], ids = Object.keys(c.q);
    if (!b) { preview(ids[0], Math.max(1, cart()[ids[0]] || 0)); return; }
    if (b.disabled) return;
    const d = Number(b.dataset.d);
    ids.forEach(id => { for (let i = 0; i < c.q[id]; i++) {
      const n = cart()[id] || 0;
      if (d > 0) { if (n === 0) M.addOrder(id, 1); else M.cartAdjust(id, 1); }
      else if (n <= 1) M.cartRemove(id); else M.cartAdjust(id, -1);
    } });
    if (d > 0) preview(ids[0], cart()[ids[0]] || 1);
  });
  showTab('satu');
  document.addEventListener('mom:cart', () => { paint(); paintCombos(); });
  paint(); paintCombos();
})();
