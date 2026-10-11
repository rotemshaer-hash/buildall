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


// ---------- Work It demo ----------
// Runs only on the page that holds it. Nothing is sent anywhere. The point of the
// demo is the second screen: WhatsApp only carries the link, and the work order
// itself is a screen in the system.
(() => {
  const root = document.querySelector('[data-demo]');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const chat = $('d-chat'), log = $('d-log'), act = $('d-act');
  const waScreen = $('d-wa'), taskScreen = $('d-task-screen');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const now = () => new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  const show = screen => {
    waScreen.classList.toggle('is-on', screen === 'wa');
    taskScreen.classList.toggle('is-on', screen === 'task');
  };
  const bubble = (side, html) => {
    const d = document.createElement('div');
    d.className = 'b ' + side;
    d.innerHTML = html + `<s>${now()}</s>`;
    chat.append(d);
    chat.scrollTop = chat.scrollHeight;
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
    const who = $('d-who').value, due = $('d-due').value;

    // fill the work order with what the manager just typed
    $('d-name').textContent = who;
    $('d-tk-title').textContent = task;
    $('d-tk-who').textContent = who;
    $('d-tk-due').textContent = due;
    $('d-tk-sent').textContent = now();
    $('d-status').textContent = 'ממתינה לביצוע';
    $('d-status').className = 'tk-status';
    $('d-photo').className = 'tk-photo';
    $('d-photo-empty').hidden = false;
    $('d-done').hidden = false;
    $('d-tk-ok').hidden = true;

    chat.innerHTML = '';
    log.innerHTML = '';
    act.hidden = true;
    show('wa');

    note(`המשימה נשלחה ל${who} · יעד: ${due}`);
    bubble('out', `<div class="lnk"><b>משימה חדשה: ${task}</b><i>לחץ לפתיחת פקודת העבודה ›</i></div>`);
    await wait(900);
    note('נמסר', 'ok');
    await wait(600);
    act.hidden = false;
    busy = false;
  });

  $('d-open').addEventListener('click', async () => {
    act.hidden = true;
    show('task');
    note('העובד פתח את פקודת העבודה', 'ok');
  });

  $('d-back').addEventListener('click', () => show('wa'));

  $('d-done').addEventListener('click', async () => {
    $('d-done').hidden = true;
    $('d-photo-empty').hidden = true;
    $('d-photo').className = 'tk-photo has-photo';
    $('d-status').textContent = 'בוצע';
    $('d-status').className = 'tk-status is-done';
    $('d-tk-ok').hidden = false;
    note('בוצע, עם תמונה ושעה', 'done');
    await wait(1100);
    show('wa');
    bubble('in', '✓ סימנתי שבוצע וצירפתי תמונה');
    await wait(500);
    bubble('out', 'תודה! 🙏');
  });
})();

// ---------- the assistant ----------
// Answers come from /api/chat, which reads the site's own content. If that is not
// available the panel still works: it answers from the questions already on the page.
(() => {
  const panel = document.getElementById('ai-panel');
  if (!panel) return;
  const $ = id => document.getElementById(id);
  const body = $('ai-body'), ask = $('ai-ask'), input = $('ai-input');
  const lead = $('ai-lead');
  let history = [], asked = 0, leadShown = false, busy = false;

  const fab = $('ai-open');
  const open = () => { panel.hidden = false; if (fab) fab.hidden = true; setTimeout(() => input.focus(), 80); };
  const close = () => { panel.hidden = true; if (fab) fab.hidden = false; };
  for (const b of document.querySelectorAll('.ai-open')) b.addEventListener('click', open);
  $('ai-close').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  const add = (who, text) => {
    const d = document.createElement('div');
    d.className = 'ai-msg ' + who;
    d.textContent = text;
    body.append(d);
    body.scrollTop = body.scrollHeight;
    return d;
  };

  // Without the assistant, the page answers from what it already says.
  const faq = [...document.querySelectorAll('#faq-list details')].map(d => ({
    q: d.querySelector('summary').textContent,
    a: d.querySelector('p').textContent
  }));
  const localAnswer = q => {
    const words = q.toLowerCase().split(/[^֐-׿a-z0-9]+/).filter(w => w.length > 2);
    let best = null, score = 0;
    for (const f of faq) {
      const hay = (f.q + ' ' + f.a).toLowerCase();
      const n = words.filter(w => hay.includes(w)).length;
      if (n > score) { score = n; best = f; }
    }
    return score >= 2 && best
      ? best.a
      : 'אני לא בטוח שיש לי את התשובה הזו. רותם ישמח לענות בוואטסאפ — אפשר להשאיר פרטים כאן ונחזור אליך.';
  };

  const maybeLead = () => {
    if (leadShown || asked < 2) return;
    leadShown = true;
    lead.hidden = false;
    body.scrollTop = body.scrollHeight;
  };

  async function send(text) {
    if (busy || !text.trim()) return;
    busy = true;
    document.querySelector('.ai-chips')?.remove();
    add('me', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    const typing = add('bot typing', '···');

    let reply;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      reply = data.reply || localAnswer(text);
    } catch {
      reply = localAnswer(text);
    }
    typing.remove();
    add('bot', reply);
    history.push({ role: 'assistant', content: reply });
    asked++;
    maybeLead();
    busy = false;
    if (typeof window.gtag === 'function') gtag('event', 'ai_question', { page: location.pathname });
  }

  ask.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  body.addEventListener('click', e => {
    if (e.target.matches('.ai-chips button')) send(e.target.textContent);
  });

  // The conversation goes with the lead, so Rotem opens it already knowing the subject.
  lead.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('ai-name').value.trim(), phone = $('ai-phone').value.trim();
    const topics = history.filter(m => m.role === 'user').map(m => m.content).slice(0, 3);
    const text = [
      (document.body.dataset.from || 'היי, הגעתי מהאתר של בונים הכל') + ' 🙂',
      'שם: ' + name,
      'טלפון: ' + phone,
      topics.length ? 'שאלתי בצ׳אט: ' + topics.join(' · ') : ''
    ].filter(Boolean).join('\n');
    if (WA_NUMBER) window.open(waLink(text), '_blank', 'noopener');
    lead.hidden = true;
    add('bot', 'תודה! הפרטים מוכנים בוואטסאפ, רק צריך ללחוץ שליחה.');
    if (typeof window.gtag === 'function') gtag('event', 'ai_lead', { page: location.pathname });
  });
  $('ai-skip').addEventListener('click', () => { lead.hidden = true; });
})();
