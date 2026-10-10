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

// ---------- Work It demo ----------
// Runs only on the page that contains it. Nothing is sent anywhere; it plays out
// the same sequence the real system does, so a visitor can see both sides at once.
(() => {
  const root = document.querySelector('[data-demo]');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const chat = $('d-chat'), log = $('d-log'), act = $('d-act');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const now = () => new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  const bubble = (side, html) => {
    const d = document.createElement('div');
    d.className = 'b ' + side;
    d.innerHTML = html + `<s>${now()}</s>`;
    chat.append(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
  };
  const note = (text, state) => {
    log.querySelector('.empty')?.remove();
    const li = document.createElement('li');
    li.className = state || '';
    li.innerHTML = `<span>${text}</span><time>${now()}</time>`;
    log.append(li);
  };

  let busy = false;
  $('d-send').addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    const task = ($('d-task').value || 'משימה').trim();
    const who = $('d-who').value;
    $('d-name').textContent = who;
    chat.innerHTML = '';
    log.innerHTML = '';
    act.hidden = true;

    note('המשימה נשלחה ל' + who);
    bubble('out', `<div class="lnk"><b>משימה חדשה: ${task}</b><i>לחץ לפתיחה ›</i></div>`);

    await wait(900);
    note('נמסר', 'ok');
    await wait(700);
    act.hidden = false;
    busy = false;
  });

  $('d-open').addEventListener('click', async () => {
    act.hidden = true;
    note('נפתח על ידי ' + $('d-who').value, 'ok');
    await wait(700);
    bubble('in', '✓ בוצע · צירפתי תמונה 📷');
    note('בוצע, עם תמונה ושעה', 'done');
    await wait(600);
    bubble('out', 'תודה! 🙏');
  });
})();
