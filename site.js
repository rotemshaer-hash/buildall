// The one place the WhatsApp number lives. International format, digits only (972...).
const WA_NUMBER = '972542020812';

const waLink = text => 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
const GREETING = document.body.dataset.greeting || 'היי, הגעתי מהאתר של POETEXA ואשמח לשיחת ייעוץ חינם 🙂';
if (WA_NUMBER) {
  document.querySelectorAll('[data-wa]').forEach(a => {
    // data-msg lets a card ask about its own subject; without it the general greeting is sent.
    const subject = a.dataset.msg;
    a.href = waLink(subject ? `${document.body.dataset.from || 'היי, הגעתי מהאתר של POETEXA'}, ואשמח לשמוע על: ${subject} 🙂` : GREETING);
    a.target = '_blank'; a.rel = 'noopener';
  });
}

// A square that says "ניהול עובדים" takes you to the form with that already written
// in it, so the subject is not lost and nothing opens that was not asked for.
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('[data-subject]');
  if (!a) return;
  const msg = document.querySelector('#lead [name="msg"]');
  if (!msg) return;
  const subject = a.dataset.subject;
  if (!msg.value.trim() || msg.dataset.auto === '1') {
    msg.value = 'מעוניין ב: ' + subject;
    msg.dataset.auto = '1';
  }
  const sel = document.querySelector('#lead [name="what"]');
  if (sel) {
    const category = a.closest('#manage') ? 'מערכת ניהול' : a.closest('#app') ? 'אפליקציה'
      : subject.includes('דף נחיתה') ? 'דף נחיתה' : a.closest('#web') ? 'אתר לעסק'
      : a.closest('#auto, #ai') ? 'כלי או פתרון אחר'
      : /עובדים|משמרות|מלאי|דוחות|משימות|מסמכים|לקוחות/.test(subject) ? 'מערכת ניהול'
      : /אפליקציה/.test(subject) ? 'אפליקציה' : /אתר/.test(subject) ? 'אתר לעסק' : 'כלי או פתרון אחר';
    const option = [...sel.options].find(o => o.text.startsWith(category));
    if (option) sel.value = option.value;
  }
  setTimeout(() => document.querySelector('#lead [name="name"]')?.focus({ preventScroll: true }), 600);
});

// A link to #manage from anywhere should land on an open group, not a closed one.
// location.hash is whatever text follows "#" in the URL, so it isn't
// guaranteed to be a valid CSS selector (e.g. a bare "#", one starting with a
// digit, or containing a stray space) — querySelector throws on those, and an
// uncaught throw here would stop every later script in this file from running.
const openTargetGroup = hash => {
  let el;
  try { el = hash && document.querySelector(hash); } catch { return; }
  if (el && el.tagName === 'DETAILS') el.open = true;
};
addEventListener('hashchange', () => openTargetGroup(location.hash));
openTargetGroup(location.hash);
// hashchange only fires when the URL's hash actually changes — closing a
// group with its own summary and then clicking the same #auto link again
// leaves the hash unchanged, so no event fires and the group stayed closed.
// A direct click handler re-opens the target regardless of whether the
// hash itself moved.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) openTargetGroup(a.getAttribute('href'));
});

// The floating demo pill steps aside while the demo itself is in view.
(() => {
  const fab = document.querySelector('.demo-fab');
  const demo = fab && document.querySelector(fab.dataset.hideAt || '#demo');
  if (!fab || !demo || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => fab.classList.toggle('hide', e.isIntersecting),
    { threshold: 0.12 }).observe(demo);
})();

const form = document.getElementById('lead');

// The same filled form goes out two ways, so the fields are read in one place.
const formText = f => [
  (document.body.dataset.from || 'היי, הגעתי מהאתר של POETEXA') + ' 🙂',
  'שם: ' + f.get('name'),
  f.get('biz') ? 'עסק: ' + f.get('biz') : '',
  f.get('email') ? 'מייל: ' + f.get('email') : '',
  f.get('phone') ? 'טלפון: ' + f.get('phone') : '',
  'צריך: ' + f.get('what'),
  f.get('msg') ? 'הרעיון: ' + f.get('msg') : ''
].filter(Boolean).join('\n');

const say = (text, ok) => {
  const el = document.getElementById('form-msg');
  if (el) { el.textContent = text; el.className = 'form-msg' + (ok === true ? ' ok' : ok === false ? ' bad' : ''); }
};

// HTML's own "required" accepts a value of pure whitespace, so a name of
// "   " passed native validation straight through to both submit paths.
// Phone here is optional, so it's only checked for shape (a reasonable
// international number) when something was actually typed. Shared by both
// the WhatsApp and the email submit paths, which both rely on it.
const nameField = form?.querySelector('[name="name"]'), phoneField = form?.querySelector('[name="phone"]');
const validateContactForm = () => {
  nameField.setCustomValidity(nameField.value.trim() ? '' : 'יש להזין שם');
  const phoneDigits = phoneField.value.trim().replace(/\D/g, '');
  phoneField.setCustomValidity(!phoneField.value.trim() || phoneDigits.length >= 7 ? '' : 'יש להזין מספר טלפון תקין');
  return form.reportValidity();
};
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateContactForm()) return;
  if (WA_NUMBER) window.open(waLink(formText(new FormData(e.target))), '_blank', 'noopener');
});

// Sending by email needs a key from web3forms.com; without one the button is not rendered.
const mailBtn = document.getElementById('send-mail');
mailBtn?.addEventListener('click', async () => {
  if (!validateContactForm()) return;
  const f = new FormData(form);
  if (f.get('_gotcha')) return;                       // a bot filled the hidden field
  // By email there is no phone number to answer on, so a reply address is the one
  // field this path cannot do without: a lead nobody can answer is a lost lead.
  const mail = form.querySelector('[name="email"]');
  if (!f.get('email')) {
    say('צריך מייל כדי שנוכל לחזור אליך. אפשר גם לשלוח בוואטסאפ.', false);
    mail?.focus();
    return;
  }
  mailBtn.disabled = true;
  say('שולח…');
  // A hung request (bad connection, a stalled API) must not leave the button
  // disabled and the form stuck on "שולח…" forever — give it a ceiling and
  // fall through to the same recovery path as a real network failure.
  const timeout = AbortSignal.timeout(15000);
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      signal: timeout,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: document.body.dataset.formkey,
        subject: 'פנייה חדשה מהאתר: ' + (f.get('biz') || f.get('name')),
        from_name: 'POETEXA',
        // web3forms turns this into the reply-to, so "reply" in the inbox reaches the lead.
        email: f.get('email'),
        replyto: f.get('email'),
        שם: f.get('name'),
        עסק: f.get('biz') || '—',
        טלפון: f.get('phone') || '—',
        צריך: f.get('what'),
        הרעיון: f.get('msg') || '—',
        הגיע_מהדף: location.pathname
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) throw new Error(data?.message || String(res.status));
    say('ההודעה נשלחה. נחזור אליך בהקדם 🙂', true);
    form.reset();
    if (typeof window.gtag === 'function') gtag('event', 'email_submit', { page: location.pathname });
  } catch {
    say('השליחה נכשלה. אפשר לשלוח בוואטסאפ, או להתקשר.', false);
  } finally {
    mailBtn.disabled = false;
  }
});

// Installing the site as an app. Chrome only offers its own prompt once the
// service worker controls the page, which is usually the second visit, so the
// steps are always shown and the one tap button replaces them when it arrives.
(() => {
  const box = document.getElementById('install');
  if (!box || matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
  const btn = document.getElementById('install-go');
  const how = document.getElementById('install-how');
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios) how.innerHTML = 'באייפון: כפתור השיתוף <b>⬆︎</b> בתחתית הדפדפן ← <b>הוספה למסך הבית</b>';
  box.hidden = false;

  let deferred = null;
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
    how.hidden = true;
  });
  btn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') box.hidden = true;
    else { btn.hidden = true; how.hidden = false; }
  });
  addEventListener('appinstalled', () => { box.hidden = true; });
})();

const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

// Counts WhatsApp and phone clicks, per page, once Google Analytics is connected (GA_ID in src/layout.mjs).
// Matched only on data-wa/data-call specifically — the old "#lead button"
// catch-all also matched the email-send button (which has neither
// attribute), so clicking "שליחה במייל" was wrongly counted as a
// whatsapp_click. The email button already fires its own email_submit event
// on an actual successful send, which this must not also double as.
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('[data-wa], [data-call]');
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

  // Toggling classes alone leaves focus wherever it was - often on a button
  // that just became hidden (e.g. d-open, inside the now-hidden d-act), which
  // drops keyboard/screen-reader focus to <body> with no indication the
  // screen changed. Each transition moves focus to a stable landmark on the
  // screen it's entering instead.
  const show = screen => {
    waScreen.classList.toggle('is-on', screen === 'wa');
    taskScreen.classList.toggle('is-on', screen === 'task');
    (screen === 'task' ? $('d-task-title') : chat).focus({ preventScroll: true });
  };
  // d-task is free text the manager types (up to 40 chars) and lands inside
  // an innerHTML template below — unescaped, a title like "<img src=x
  // onerror=...>" would run as real markup in the visitor's own browser
  // instead of showing as the literal text they typed.
  const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    bubble('out', `<div class="lnk"><b>משימה חדשה: ${escapeHtml(task)}</b><i>לחץ לפתיחת פקודת העבודה ›</i></div>`);
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
  let history = [], asked = 0, leadShown = false, busy = false, controller = null;
  const initialBody = body.innerHTML; // the welcome message + chips, to restore on close

  // A moving hero video behind an open modal dialog is a distraction (and a
  // WCAG 2.2.2 concern) for anyone using the chat - pause it while the panel
  // is open and resume on close, instead of leaving it running regardless of
  // what else is on screen.
  const heroVideo = document.querySelector('.poetexa-hero-video');
  const open = () => { panel.hidden = false; heroVideo?.pause(); setTimeout(() => input.focus(), 80); };
  // The privacy policy says the conversation isn't kept after the window
  // closes, so closing has to actually clear it here too, not just hide it:
  // cancel any question in flight too, so its answer can't land in the next
  // conversation, and clear the name/phone the lead form was holding.
  const close = () => {
    panel.hidden = true;
    heroVideo?.play().catch(() => {});
    $('ai-open')?.focus();
    controller?.abort();
    busy = false;
    body.innerHTML = initialBody;
    history = [];
    asked = 0;
    leadShown = false;
    lead.hidden = true;
    $('ai-name').value = '';
    $('ai-phone').value = '';
  };
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll('button,input,a[href]')].filter(el => !el.closest('[hidden]') && !el.disabled);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  for (const b of document.querySelectorAll('.ai-open')) b.addEventListener('click', open);
  $('ai-close').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  const add = (who, text) => {
    const d = document.createElement('div');
    d.className = 'ai-msg ' + who;
    d.dir = 'auto'; // a visitor or the model may type in Hebrew or English; let the first strong character decide per bubble
    d.textContent = text;
    // The waiting bubble's visual "···" would otherwise be announced
    // literally by a screen reader; ai-body's aria-live reads this label
    // instead, so a screen reader user hears that an answer is on its way.
    if (who.includes('typing')) d.setAttribute('aria-label', 'מחפש תשובה…');
    body.append(d);
    body.scrollTop = body.scrollHeight;
    return d;
  };

  // Without the assistant, the page answers from what it already says.
  const faq = [...document.querySelectorAll('#faq-list details')].map(d => ({
    q: d.querySelector('summary').textContent,
    a: d.querySelector('p').textContent
  }));
  // Canned answers for the suggestion chips themselves (src/layout.mjs's
  // .ai-chips), so the one question a visitor is most likely to tap gets an
  // exact answer instead of whatever the FAQ matcher happens to score highest.
  const chipAnswers = {
    'מה אתם בונים?': 'אתרים, דפי נחיתה, אפליקציות, ומערכות לניהול עובדים, משמרות, משימות, מסמכים, לקוחות ומלאי — ואם יש לך רעיון שלא ברשימה, נבנה גם אותו.',
    'כמה זה עולה?': 'תלוי בגודל: כלי קטן או דף נחיתה עולים הרבה פחות מאפליקציה מלאה. אחרי שיחה קצרה מקבלים מחיר סגור מראש, בלי הפתעות.',
    'אני רודף אחרי עובדים': 'בכלים לניהול צוות העובד לא מתקין כלום — מקבל קישור בוואטסאפ ולוחץ עליו. רוצה שנבדוק מה מתאים לעסק שלך?',
    'יש לי כבר אתר': 'אפשר לשלב AI או מערכת ניהול באתר קיים בלי לבנות הכול מחדש, ואפשר גם לשפר את מה שיש. מה הכי מעכב אותך בו?'
  };
  const splitWords = s => s.toLowerCase().split(/[^֐-׿a-z0-9]+/).filter(w => w.length > 2);
  const localAnswer = q => {
    if (chipAnswers[q]) return chipAnswers[q];
    const words = new Set(splitWords(q));
    let best = null, score = 0;
    for (const f of faq) {
      const hayWords = new Set(splitWords(f.q + ' ' + f.a));
      const n = [...words].filter(w => hayWords.has(w)).length;
      if (n > score) { score = n; best = f; }
    }
    return score >= 2 && best
      ? best.a
      : 'אני לא בטוח שיש לי את התשובה הזו. נציג שירות ישמח לענות בוואטסאפ — אפשר להשאיר פרטים כאן ונחזור אליך.';
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
    controller = new AbortController();
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
        body: JSON.stringify({ messages: history }),
        // Two different reasons to abort need two different outcomes: closing
        // the panel should answer nothing (close() already reset the state),
        // but a stalled request must still recover — fall back to the local
        // answer and release busy — instead of leaving the chat stuck on
        // "···" forever. controller.signal alone can't tell them apart once
        // combined, so a timeout checks controller.signal.aborted itself.
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)])
      });
      const data = await res.json();
      reply = data.reply || localAnswer(text);
    } catch (e) {
      if (e.name === 'AbortError' && controller.signal.aborted) return; // the panel was closed
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
    const nameEl = $('ai-name'), phoneEl = $('ai-phone');
    const name = nameEl.value.trim(), phone = phoneEl.value.trim();
    // required alone accepts whitespace-only input; check the trimmed value
    // and a sane digit count (loose enough to accept an international
    // number) instead of trusting the raw field.
    nameEl.setCustomValidity(name ? '' : 'יש להזין שם');
    phoneEl.setCustomValidity(phone.replace(/\D/g, '').length >= 7 ? '' : 'יש להזין מספר טלפון תקין');
    if (!lead.reportValidity()) return;
    const topics = history.filter(m => m.role === 'user').map(m => m.content).slice(0, 3);
    const text = [
      (document.body.dataset.from || 'היי, הגעתי מהאתר של POETEXA') + ' 🙂',
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

// Close the compact navigation after a choice, outside tap, or Escape.
(() => {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const close = (focus = false) => { menu.open = false; if (focus) summary.focus(); };
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
  menu.querySelector('.menu-backdrop')?.addEventListener('click', () => close(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) close(true); });
})();

// The file preview supplies a Blob URL; hosted pages retain the original MP4 URL.
(() => {
  const player = document.querySelector('[data-film-player]');
  if (!player) return;
  const video = player.querySelector('video'), play = player.querySelector('.film-play');
  const status = player.querySelector('.film-status');
  play.hidden = false;
  play.addEventListener('click', async () => {
    play.disabled = true;
    status.textContent = '';
    try { await video.play(); }
    catch { play.hidden = false; status.textContent = 'הניגון לא התחיל. אפשר לשמור את הסרטון ולפתוח אותו בנגן של הטלפון.'; }
    finally { play.disabled = false; }
  });
  video.addEventListener('playing', () => { play.hidden = true; status.textContent = ''; });
  video.addEventListener('ended', () => { play.hidden = false; });
  video.addEventListener('error', () => { play.hidden = false; status.textContent = 'אפשר לשמור את הסרטון ולפתוח אותו בנגן של הטלפון.'; });
})();

document.querySelector('#lead [name="msg"]')?.addEventListener('input', e => { delete e.target.dataset.auto; });

// Depth on the bento cards: a mouse gets a pointer-tilt, but a tap on a phone
// never fires the continuous pointermove that needs — on the device this site
// is mostly viewed on, that effect was invisible. Every device instead gets a
// one-time settle: the card starts tilted further and eases into its resting
// angle the first time it scrolls into view. Off entirely under reduced motion.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const tilts = document.querySelectorAll('.pb-tilt');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('pb-in');
        obs.unobserve(e.target);
      }
    }, { threshold: .35 });
    tilts.forEach(card => io.observe(card));
  } else {
    tilts.forEach(card => card.classList.add('pb-in'));
  }
  tilts.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -8;
      const ry = ((e.clientX - r.left) / r.width - .5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
