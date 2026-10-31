/* Keranjang hanya menyimpan pilihan produk selama halaman terbuka.
   Tampilan keranjang + form ada di navbar.js (panel #cartDrawer). */
(() => {
  const M = window.MOM, cart = {}, form = document.querySelector('#orderForm');
  let toastTimer;
  const $ = s => document.querySelector(s);
  M.toast = message => { const el = $('#toast'); clearTimeout(toastTimer); el.textContent = message; el.hidden = false; toastTimer = setTimeout(() => el.hidden = true, 3600); };
  const packs = () => Object.values(cart).reduce((a, b) => a + b, 0);

  function render() {
    const count = packs();
    $('#cartCount').textContent = count;
    document.dispatchEvent(new CustomEvent('mom:cart', { detail: { count, total: M.total(cart) } }));
  }

  M.cart = cart;
  M.cartAdjust = (id, d) => { if (!cart[id]) return; cart[id] = Math.min(4, Math.max(1, cart[id] + d)); render(); };
  M.cartRemove = id => { if (!cart[id]) return; delete cart[id]; render(); };
  M.cartClear = () => { Object.keys(cart).forEach(k => delete cart[k]); render(); };
  M.addOrder = (id, count) => {
    if (!M.products.some(p => p.id === id) || !Number.isInteger(count) || count < 1 || count > 4) return;
    // Memilih ulang mengganti jumlah rasa yang sama; pilihan rasa lain dipertahankan.
    const existed = Boolean(cart[id]); cart[id] = count; render();
    const product = M.products.find(p => p.id === id);
    M.toast(`${product.short}: ${count} kemasan ${existed ? 'diperbarui' : 'ditambahkan'} · ${M.money(count * product.price)}`);
  };

  /* ---------- Formulir data pemesan ---------- */
  const fDate = $('#fDate');
  fDate.min = M.today(); fDate.addEventListener('focus', () => fDate.min = M.today());
  form.addEventListener('input', e => {
    const input = e.target; if (!input.name) return;
    input.removeAttribute('aria-invalid');
    const error = $('#error-' + input.name); if (error) error.textContent = '';
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const status = $('#orderStatus');
    if (!packs()) { status.textContent = 'Pilih minimal satu cemilan untuk melanjutkan.'; return; }
    const customer = Object.fromEntries(new FormData(form)), errors = M.validate(customer);
    for (const key of ['name', 'phone', 'address', 'date', 'notes']) {
      const field = form.elements.namedItem(key);
      field.setAttribute('aria-invalid', Boolean(errors[key]));
      $('#error-' + key).textContent = errors[key] || '';
    }
    const bad = Object.keys(errors);
    if (bad.length) {
      const field = form.elements.namedItem(bad[0]);
      field.focus({ preventScroll: true });
      field.scrollIntoView({ block: 'center', behavior: M.motionOn() ? 'smooth' : 'auto' });
      status.textContent = 'Periksa bagian yang ditandai, ya.';
      document.dispatchEvent(new CustomEvent('mom:invalid'));
      return;
    }
    try {
      const url = M.orderUrl(cart, customer);
      window.open(url, '_blank', 'noopener,noreferrer');
      status.textContent = 'Draft WhatsApp dibuka. Periksa lalu tekan kirim di aplikasi WhatsApp.';
      document.dispatchEvent(new CustomEvent('mom:sent'));
    } catch (err) { status.textContent = err.message; }
  });
  render();
})();
