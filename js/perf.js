/* Hemat tenaga HP: jeda animasi CSS yang berulang di section yang sedang tidak terlihat.
   Tampilan tidak berubah; animasi lanjut otomatis begitu section masuk layar lagi. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(list => list.forEach(e => e.target.classList.toggle('perf-off', !e.isIntersecting)), { rootMargin: '200px 0px' });
  document.querySelectorAll('main section, .footer').forEach(el => io.observe(el));
})();
