// The one place the WhatsApp number lives. International format, digits only (972...).
const WA_NUMBER = '972542020812';

const waLink = text => 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
const GREETING = document.body.dataset.greeting || 'היי, הגעתי מהאתר של בונים הכל ואשמח לשיחת ייעוץ חינם 🙂';
if (WA_NUMBER) {
  document.querySelectorAll('[data-wa]').forEach(a => {
    // data-msg lets a card ask about its own subject; without it the general greeting is sent.
    const subject = a.dataset.msg;
    a.href = waLink(subject ? `${document.body.dataset.from || 'היי, הגעתי מהאתר של בונים הכל'}, ואשמח לשמוע על: ${subject} 🙂` : GREETING);
    a.target = '_blank'; a.rel = 'noopener';
  });
}

const form = document.getElementById('lead');

// The same filled form goes out two ways, so the fields are read in one place.
const formText = f => [
  (document.body.dataset.from || 'היי, הגעתי מהאתר של בונים הכל') + ' 🙂',
  'שם: ' + f.get('name'),
  f.get('biz') ? 'עסק: ' + f.get('biz') : '',
  'צריך: ' + f.get('what'),
  f.get('msg') ? 'הרעיון: ' + f.get('msg') : ''
].filter(Boolean).join('\n');

const say = (text, ok) => {
  const el = document.getElementById('form-msg');
  if (el) { el.textContent = text; el.className = 'form-msg' + (ok === true ? ' ok' : ok === false ? ' bad' : ''); }
};

form?.addEventListener('submit', e => {
  e.preventDefault();
  if (WA_NUMBER) window.open(waLink(formText(new FormData(e.target))), '_blank', 'noopener');
});

// Sending by email needs a key from web3forms.com; without one the button is not rendered.
const mailBtn = document.getElementById('send-mail');
mailBtn?.addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const f = new FormData(form);
  if (f.get('_gotcha')) return;                       // a bot filled the hidden field
  mailBtn.disabled = true;
  say('שולח…');
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: document.body.dataset.formkey,
        subject: 'פנייה חדשה מהאתר: ' + (f.get('biz') || f.get('name')),
        from_name: 'בונים הכל',
        שם: f.get('name'),
        עסק: f.get('biz') || '—',
        צריך: f.get('what'),
        הרעיון: f.get('msg') || '—',
        הגיע_מהדף: location.pathname
      })
    });
    if (!res.ok) throw new Error(res.status);
    say('ההודעה נשלחה. נחזור אליך בהקדם 🙂', true);
    form.reset();
    if (typeof window.gtag === 'function') gtag('event', 'email_submit', { page: location.pathname });
  } catch {
    say('השליחה נכשלה. אפשר לשלוח בוואטסאפ, או להתקשר.', false);
    mailBtn.disabled = false;
  }
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

// Counts WhatsApp and phone clicks, per page, once Google Analytics is connected (GA_ID in src/layout.mjs).
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('[data-wa], [data-call], #lead button');
  if (!a || typeof window.gtag !== 'function') return;
  gtag('event', a.hasAttribute('data-call') ? 'phone_click' : 'whatsapp_click', { page: location.pathname });
});

// The floating WhatsApp button appears only past the hero, so it never sits
// next to the buttons that are already in the header and in the hero itself.
const fab = document.querySelector('.fab');
const hero = document.querySelector('.hero');
if (fab && hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(
    ([e]) => fab.classList.toggle('show', !e.isIntersecting),
    { threshold: 0 }
  ).observe(hero);
} else if (fab) {
  fab.classList.add('show');
}
