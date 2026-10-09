// The one place the WhatsApp number lives. International format, digits only (972...).
const WA_NUMBER = '972542020812';

const waLink = text => 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
const GREETING = document.body.dataset.greeting || 'היי, הגעתי מהאתר של בונים הכל ואשמח לשיחת ייעוץ חינם 🙂';
if (WA_NUMBER) {
  document.querySelectorAll('[data-wa]').forEach(a => { a.href = waLink(GREETING); a.target = '_blank'; a.rel = 'noopener'; });
}

document.getElementById('lead')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = [
    (document.body.dataset.from || 'היי, הגעתי מהאתר של בונים הכל') + ' 🙂',
    'שם: ' + f.get('name'),
    f.get('biz') ? 'עסק: ' + f.get('biz') : '',
    'צריך: ' + f.get('what'),
    f.get('msg') ? 'הרעיון: ' + f.get('msg') : ''
  ].filter(Boolean).join('\n');
  if (WA_NUMBER) window.open(waLink(text), '_blank', 'noopener');
});

const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

// Content is visible without JS; the reveal is only added when the browser can run it.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('main section .h2, .card, .step, .proj, .guarantee, details, .ind, .pain, .example').forEach(el => {
    el.classList.add('reveal'); io.observe(el);
  });
}

document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.card');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
