/* Navbar: panel keranjang (daftar pesanan + data pengiriman + checkout WhatsApp).
   Logika data keranjang ada di order.js (M.cart, M.cartAdjust, M.cartRemove, M.cartClear). */
(() => {
  const M = window.MOM, $ = s => document.querySelector(s);
  const toggle = $('#cartToggle'), drawer = $('#cartDrawer'), overlay = $('#drawerOverlay'), badge = $('#cartCount');
  const items = $('#drawerItems'), foot = $('#drawerFoot'), bar = $('#drawerBar'), scroller = $('#drawerScroll'), closeBtn = $('#drawerClose');
  const header = $('.header'), menuBtn = $('.menu-toggle'), mobileNav = $('#mobileNav');
  const form = $('#orderForm'), steps = $('#orderSteps'), floating = $('#floatingCart'), status = $('#orderStatus');
  if (!M || !toggle || !drawer || !M.cart) return;
  overlay.hidden = false;

  let prevCount = 0, lastFocus = null, clearArmed = false, clearTimer, sent = false;
  const packs = () => Object.values(M.cart).reduce((a, b) => a + b, 0);
  const weight = n => n >= 4 ? `${(n * .25).toLocaleString('id-ID')} kg` : `${n * 250} g`;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isOpen = () => drawer.classList.contains('open');
  const filled = () => ['#fName', '#fPhone', '#fAddress', '#fDate'].every(q => $(q).value.trim());

  /* ---------- Langkah (Pesanan → Data → WhatsApp) ---------- */
  const READY = 'Semua siap. Tekan tombol di atas untuk membuka draft WhatsApp.', TODO = 'Lengkapi data pengiriman, lalu pesan lewat WhatsApp.';
  function syncSteps() {
    const n = sent ? 4 : !packs() ? 1 : !filled() ? 2 : 3;
    if (!sent && (status.textContent === TODO || status.textContent === READY)) status.textContent = n === 3 ? READY : TODO;
    steps.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('is-done', i + 1 < n); li.classList.toggle('is-now', i + 1 === n);
      if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  /* ---------- Render panel ---------- */
  function render() {
    const n = packs(), total = M.total(M.cart), money = M.money(total);
    badge.dataset.zero = n ? 'false' : 'true';
    toggle.setAttribute('aria-label', `Buka keranjang, ${n} kemasan`);
    $('#drawerSub').textContent = n ? `${n} kemasan · ${weight(n)}` : 'Belum ada cemilan';
    $('#drawerQty').textContent = `${n} kemasan`;
    $('#drawerWeight').textContent = weight(n);
    $('#drawerTotal').textContent = money; $('#barTotal').textContent = money; $('#floatingTotal').textContent = money;
    drawer.classList.toggle('is-empty', !n);
    foot.hidden = !n; bar.hidden = !n;
    items.innerHTML = n
      ? M.products.filter(p => M.cart[p.id]).map(p => {
          const q = M.cart[p.id];
          return `<article class="d-item" data-id="${p.id}" style="--tile:${p.color}">
            <div class="d-tile"><img src="${p.image}" alt="" width="74" height="92" loading="lazy" decoding="async"></div>
            <div class="d-info">
              <h3>${esc(p.name)}</h3>
              <p class="d-variant">${q} kemasan · ${q * 250} g</p>
              <p class="d-price">${M.money(p.price)} per kemasan</p>
              <div class="d-row">
                <div class="d-step">
                  <button type="button" data-dminus="${p.id}" aria-label="Kurangi ${esc(p.name)}" ${q === 1 ? 'disabled' : ''}>−</button>
                  <output aria-live="polite">${q}</output>
                  <button type="button" data-dplus="${p.id}" aria-label="Tambah ${esc(p.name)}" ${q === 4 ? 'disabled' : ''}>+</button>
                </div>
                <strong class="d-sub">${M.money(q * p.price)}</strong>
              </div>
            </div>
            <button type="button" class="d-remove" data-dremove="${p.id}" aria-label="Hapus ${esc(p.name)} dari keranjang"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button>
          </article>`;
        }).join('')
      : `<div class="d-empty"><div class="d-empty-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.55-1.2L20.4 8H6.2"/><circle cx="9.4" cy="19.6" r="1.4"/><circle cx="17" cy="19.6" r="1.4"/></svg></div><h3>Keranjangmu masih kosong</h3><p>Pilih rasa dan jumlah kemasan, lalu tambahkan ke pesanan. Form pengiriman muncul di sini.</p><a href="#kemasan" class="d-empty-cta">Pilih cemilan ↗</a></div>`;
    if (!n) { sent = false; status.textContent = TODO; }
    disarmClear(); syncSteps(); syncFloating();
  }
  function syncFloating() { floating.hidden = !packs() || isOpen(); }

  /* ---------- Animasi saat produk ditambahkan ---------- */
  function bump() { [toggle, badge].forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }); }
  document.addEventListener('mom:cart', e => {
    const n = e.detail.count;
    if (n > prevCount) bump();
    prevCount = n; sent = false; render();
  });
  document.addEventListener('mom:sent', () => { sent = true; syncSteps(); });

  /* ---------- Buka / tutup panel ---------- */
  function open() {
    if (isOpen()) return;
    if (!mobileNav.hidden) menuBtn.click();
    lastFocus = document.activeElement;
    drawer.removeAttribute('inert'); drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('open'); overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('drawer-open');
    if (M.lenis && M.lenis.stop) M.lenis.stop();
    scroller.scrollTop = 0; syncFloating();
    setTimeout(() => closeBtn.focus({ preventScroll: true }), 60);
  }
  function close(restore = true) {
    if (!isOpen()) return;
    drawer.classList.remove('open'); overlay.classList.remove('open');
    drawer.setAttribute('inert', ''); drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('drawer-open');
    if (M.lenis && M.lenis.start) M.lenis.start();
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    syncFloating();
  }
  M.openCart = open; M.closeCart = close;
  toggle.addEventListener('click', () => isOpen() ? close() : open());
  closeBtn.addEventListener('click', () => close());
  overlay.addEventListener('click', () => close());
  // Tombol/tautan mana pun dengan data-open-cart membuka keranjang
  document.addEventListener('click', e => { const t = e.target.closest('[data-open-cart]'); if (!t) return; e.preventDefault(); open(); });
  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') { // fokus tetap di dalam panel
      const f = [...drawer.querySelectorAll('button:not([disabled]),a[href],input,textarea,select')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Link di dalam panel (mis. "Pilih cemilan") menutup panel sebelum scroll
  drawer.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) close(false); });

  /* ---------- Tambah / kurang / hapus ---------- */
  items.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const key = b.hasAttribute('data-dplus') ? 'dplus' : b.hasAttribute('data-dminus') ? 'dminus' : b.hasAttribute('data-dremove') ? 'dremove' : '';
    if (!key) return;
    const id = b.dataset[key];
    if (key === 'dremove') {
      const row = b.closest('.d-item'); row.classList.add('leaving');
      setTimeout(() => { M.cartRemove(id); (items.querySelector('[data-dremove]') || closeBtn).focus({ preventScroll: true }); }, 180);
      return;
    }
    M.cartAdjust(id, key === 'dplus' ? 1 : -1);
    const again = items.querySelector(`[data-${key}="${id}"]`);
    (again && !again.disabled ? again : items.querySelector(`[data-${key === 'dplus' ? 'dminus' : 'dplus'}="${id}"]`) || closeBtn).focus({ preventScroll: true });
  });

  /* ---------- Kosongkan (dua langkah) ---------- */
  const clearBtn = $('#drawerClear');
  function disarmClear() { clearArmed = false; clearTimeout(clearTimer); clearBtn.textContent = 'Kosongkan keranjang'; clearBtn.classList.remove('armed'); }
  clearBtn.addEventListener('click', () => {
    if (!clearArmed) { clearArmed = true; clearBtn.textContent = 'Yakin? Klik sekali lagi'; clearBtn.classList.add('armed'); clearTimer = setTimeout(disarmClear, 3000); return; }
    M.cartClear(); M.toast && M.toast('Keranjang dikosongkan. Data pemesan tetap ada.'); closeBtn.focus({ preventScroll: true });
  });

  /* ---------- Pilih cepat tanggal ---------- */
  const fDate = $('#fDate'), chips = [...document.querySelectorAll('.date-chips button')];
  const addDays = n => { const d = new Date(M.today() + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  function syncChips() { chips.forEach(c => c.setAttribute('aria-pressed', String(fDate.value === addDays(+c.dataset.days)))); }
  chips.forEach(c => c.addEventListener('click', () => { fDate.value = addDays(+c.dataset.days); fDate.dispatchEvent(new Event('input', { bubbles: true })); }));
  form.addEventListener('input', () => { sent = false; if (status.textContent !== TODO && status.textContent !== READY) status.textContent = TODO; syncChips(); syncSteps(); });
  syncChips();

  render();
})();
