// Builds the whole site from src/: the home page, a page per industry, sitemap.xml and robots.txt.
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { BASE, BRAND, FULL_NAME, FORM_KEY, favicon, head, header, navBar, footer, contact, icon, brandRow, business, videoSchema, faqSchema } from './src/layout.mjs';
import { industries } from './src/industries.mjs';
import { services } from './src/services.mjs';
import { reviews, REVIEW_URL } from './src/reviews.mjs';
import { guides } from './src/guides.mjs';
import { cases } from './src/cases.mjs';
import { legal, UPDATED } from './src/legal.mjs';
import { problems } from './src/problems.mjs';
import { buildKnowledge } from './scripts/knowledge.mjs';

const nav = { industries, services, guides, cases, legal };

// Shared escaping for any dynamic value going into an HTML attribute
// (double-quote delimited everywhere in this file). A literal " in content
// like נדל"ן otherwise closes the attribute early and breaks the markup.
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Single source of truth for the Pilates demo's opening hours, indexed like
// Date#getDay() (0 = Sunday ... 6 = Saturday) — both the open/closed logic
// baked into the demo's own client script and the hours line printed on the
// page are generated from this same array, so they can't drift apart again.
const DEMO_HOURS = [[390, 1260], [390, 1260], [390, 1260], [390, 1260], [390, 1260], [420, 780], null];
const DEMO_DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const demoHhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const demoHoursLabel = hours => {
  const groups = [];
  for (let i = 0; i < 7;) {
    if (!hours[i]) { i++; continue; }
    let j = i;
    while (j + 1 < 7 && hours[j + 1] && hours[j + 1][0] === hours[i][0] && hours[j + 1][1] === hours[i][1]) j++;
    const day = i === j ? `${DEMO_DAY_LETTERS[i]}׳` : `${DEMO_DAY_LETTERS[i]}׳–${DEMO_DAY_LETTERS[j]}׳`;
    groups.push(`${day} ${demoHhmm(hours[i][0])}–${demoHhmm(hours[i][1])}`);
    i = j + 1;
  }
  return groups.join(' · ');
};

const write = (path, html) => {
  mkdirSync(path.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  writeFileSync(path, html);
};
// Tables collapse into one card per row on phones, so each cell carries its column's name.
const labelTables = html => html.replace(/<table>([\s\S]*?)<\/table>/g, (t, inner) => {
  const heads = [...inner.matchAll(/<th>(.*?)<\/th>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
  const body = inner.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
    if (cells.includes('<th>')) return row;
    let n = 0;
    return '<tr>' + cells.replace(/<td>/g, () => `<td data-label="${heads[n++] || ''}">`) + '</tr>';
  });
  return '<table>' + body + '</table>';
});
const withIcons = html => html
  .replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => icon(n))
  .replace(/\{\{brands\}\}/g, brandRow);

// ---------- shared sections ----------
const industriesSection = root => `<section class="industries" id="industries">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">פתרונות לפי תחום</span>
      <h2 class="h2">מה בונים לעסק כמו שלך</h2>
      <p class="lead">לכל תחום יש בעיות משלו. אלה כמה מהתחומים שאנחנו בונים להם. לא מצאת את שלך? אנחנו POETEXA.</p>
    </div>
    <div class="ind-grid">
${industries.map(i => `      <a class="ind" href="${root}${i.slug}/"><span class="ic">${icon(i.icon)}</span><b>${i.short}</b><span class="go">לפתרונות ${icon('arrow')}</span></a>`).join('\n')}
    </div>
  </div>
</section>`;

const reviewsSection = () => {
  if (!reviews.length) return '';
  return `<section class="reviews">
  <div class="wrap center">
    <div class="sec-head">
      <span class="eyebrow">ביקורות מגוגל</span>
      <h2 class="h2">מה אומרים עלינו</h2>
    </div>
    <div class="rev-grid">
${reviews.map(r => `      <figure class="card rev"><div class="stars" aria-label="${r.stars} כוכבים">${'★'.repeat(r.stars)}</div><blockquote>${r.text}</blockquote><figcaption>${r.name} · ביקורת בגוגל</figcaption></figure>`).join('\n')}
    </div>
    ${REVIEW_URL ? `<a class="btn btn-line" href="${REVIEW_URL}" target="_blank" rel="noopener">${icon('star')} לכל הביקורות בגוגל</a>` : ''}
  </div>
</section>`;
};

const guidesSection = root => `<section class="guides-strip" id="guides">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">מדריכים</span>
      <h2 class="h2">לפני שמחליטים</h2>
      <p class="lead">תשובות ברורות לשאלות שכל בעל עסק שואל, לפני שהוא מוציא שקל.</p>
    </div>
    <div class="ind-grid">
${guides.map(g => `      <a class="ind" href="${root}guides/${g.slug}/"><span class="ic">${icon(g.icon)}</span><b>${g.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
    </div>
  </div>
</section>`;

const crumbsSchema = trail => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], n) => ({ '@type': 'ListItem', position: n + 1, name, item: BASE + path }))
});

// A text page: guides, project stories, legal. `trail` is [[name, path], ...] from the home page down.
const article = ({ root, trail, eyebrow, h1, lead, body, faq, extraSchemas = [], title, description, related = '', wide = false }) => {
  const path = trail[trail.length - 1][1];
  const crumbs = trail.map(([name, p], n) => n === trail.length - 1 ? name : `<a href="${root}${p}">${name}</a>`).join(' <span>›</span> ');
  return page({
    path, root, title, description,
    schemas: [...extraSchemas, crumbsSchema(trail), ...(faq ? [faqSchema(faq)] : [])],
    body: `<section class="hero hero-sm">
  <i class="blob b1"></i><i class="blob b2"></i>
  <div class="wrap">
    <nav class="crumbs" aria-label="מיקום בדף">${crumbs}</nav>
    ${eyebrow ? `<span class="tag">${eyebrow}</span>` : ''}
    <h1>${h1}</h1>
    <p>${lead}</p>
  </div>
</section>

<section>
  <div class="wrap${wide ? '' : ' prose'}">
${body}
  </div>
</section>
${faq ? `
<section class="faq-sec" id="faq">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">שאלות נפוצות</span>
      <h2 class="h2">שאלות על הנושא</h2>
    </div>
    <div id="faq-list">
${faq.map(([q, a]) => `    <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </div>
  </div>
</section>` : ''}
${related}
${contact()}`
  });
};

// The visitor picks what's actually slowing him down and gets the answer in place.
// Covers lost leads, poor discoverability and onboarding too, not only repetitive
// work — so the heading can't narrow it to "time" alone.
const problemsSection = root => `<section class="problems" id="problems">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">${icon('wrench')} נתחיל מהבעיה</span>
      <h2 class="h2">מה הכי מעכב אותך בעסק?</h2>
      <p class="lead">לא צריך לדעת אם הפתרון הוא אתר, מערכת או אפליקציה. אפשר לבחור את מה שהכי מעיק עליך, ונראה לך מה אפשר לעשות איתו.</p>
    </div>
    <div class="prob-grid">
${problems.map(p => `      <details class="prob" name="prob">
        <summary><span class="ic">${icon(p.icon)}</span><b>${p.t}</b></summary>
        <div class="prob-body">
          <p class="prob-why">${p.why}</p>
          <p class="prob-fix"><b>מה אפשר לעשות:</b> ${p.fix}</p>
          <div class="prob-cta">
            <a class="btn btn-wa" data-wa data-msg="${attr(p.t)}" href="#contact"><svg><use href="#wa"/></svg>בדיוק זה אצלי</a>
            ${p.work ? `<a class="btn btn-line" href="${root}work/${p.work}/">ראה את ${p.workName} ←</a>` : ''}
          </div>
        </div>
      </details>`).join('\n')}
      <a class="prob prob-other" data-wa data-msg="משהו אחר שמעכב אותי" href="#contact">
        <span class="ic">${icon('bulb')}</span><b>יש לי משהו אחר</b>
      </a>
    </div>
  </div>
</section>`;

const page = ({ path, root, title, description, schemas, body, greeting, from }) =>
  head({ title, description, path, schemas, root }) + `
<body${greeting ? ` data-greeting="${attr(greeting)}"` : ''}${from ? ` data-from="${attr(from)}"` : ''}${FORM_KEY ? ` data-formkey="${attr(FORM_KEY)}"` : ''}>
${header(root)}
<main id="top">
${body}
</main>
${footer(root, nav)}`;

// The invitation to the live demo, used on the demo page itself; `hideAt` is the
// demo element that makes it redundant once it's in view. Dropped from the home
// page: it sat right before the section that immediately hid it again, so it
// showed for a flash and vanished on the first scroll.
const demoFab = (href, hideAt) =>
  `<a class="demo-fab" href="${href}" data-hide-at="${hideAt}">${icon('zap')}<span>נסה דוגמה חיה</span></a>`;

// ---------- home ----------
let home = readFileSync('src/home.html', 'utf8');
const homeFaq = [...home.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(m => [m[1], m[2]]);
home = withIcons(home)
  .replace('<!--INDUSTRIES-->', industriesSection(''))
  .replace('<!--REVIEWS-->', reviewsSection())
  .replace('<!--PROBLEMS-->', problemsSection(''))
  .replace('<!--GUIDES-->', guidesSection(''))
  .replace('<!--CONTACT-->', contact());

write('index.html', page({
  path: '', root: '',
  title: 'POETEXA | בניית אתרים, אפליקציות ומערכות לעסקים קטנים',
  description: 'בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים קטנים, עם שילוב AI: עובדים, משמרות, מסמכים, לקוחות ועוד. מכלי קטן ועד מערכת מלאה – שיחת ייעוץ חינם.',
  schemas: [business, videoSchema, faqSchema(homeFaq)],
  body: home
}));

// ---------- industry + service pages ----------
// industries.mjs/services.mjs are the single source of truth for which slugs
// should exist, but nothing ever removed a directory for a slug that got
// renamed or dropped from one of them - build.mjs only ever writes, never
// deletes, so the old directory (and whatever stale content it holds)
// stayed in the repo and kept deploying forever. A tracked manifest of
// "slugs this build wrote last time" (both kinds, same mechanism) lets this
// run diff against the current lists and clean up anything that's no longer
// there.
const MANIFEST_PATH = '.industry-slugs.json';
const currentSlugs = [...industries.map(i => i.slug), ...services.map(s => s.slug)];
const previousSlugs = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : [];
for (const slug of previousSlugs) {
  if (!currentSlugs.includes(slug) && existsSync(slug)) rmSync(slug, { recursive: true, force: true });
}
writeFileSync(MANIFEST_PATH, JSON.stringify(currentSlugs));

for (const i of industries) {
  const root = '../';
  const others = industries.filter(o => o !== i);
  const body = `<section class="hero hero-sm">
  <i class="blob b1"></i><i class="blob b2"></i>
  <div class="wrap">
    <nav class="crumbs" aria-label="מיקום בדף"><a href="${root}">דף הבית</a> <span>›</span> ${i.short}</nav>
    <span class="hero-ic">${icon(i.icon)}</span>
    <h1>${i.h1}</h1>
    <p>${i.lead}</p>
    <div class="ctas">
      <a class="btn btn-wa" data-wa href="#contact"><svg><use href="#wa"/></svg>שיחת ייעוץ חינם</a>
      <a class="btn btn-ghost" href="#solutions">מה אפשר לבנות?</a>
    </div>
  </div>
</section>

<section class="why-sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">מהשטח</span>
      <h2 class="h2">${i.short} — מה הכי מעכב</h2>
    </div>
    <div class="pains">
${i.pains.map(p => `      <a class="pain" href="#s${p.fix}"><span>✕</span><p>${p.t}</p><span class="pain-go">לפתרון ←</span></a>`).join('\n')}
    </div>
  </div>
</section>

<section class="ladder" id="solutions">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">מה אנחנו בונים</span>
      <h2 class="h2">הפתרונות ל${i.short}</h2>
    </div>
    <div class="grid">
${i.solutions.map((s, n) => `      <a class="card" id="s${n}" data-wa data-msg="${attr(s.t)}" href="#contact"><div class="ic">${icon(s.icon)}</div><h3>${s.t}</h3><p>${s.d}</p></a>`).join('\n')}
      <a class="card" data-wa data-msg="שילוב AI" href="#contact"><div class="ic">${icon('bot')}</div><h3>עם AI, אם תרצה</h3><p>צ׳אט שעונה ללקוחות, סיכומים ומסמכים שממלאים את עצמם. משלבים רק איפה שזה חוסך לך זמן.</p></a>
      <a class="card idea" data-wa data-msg="רעיון משלי" href="#contact"><div class="ic">${icon('bulb')}</div><h3>צריך משהו אחר?</h3><p>כל תהליך בעסק שלך אפשר להפוך לכלי פשוט. ספר לנו מה אתה צריך.</p></a>
    </div>
  </div>
</section>

<section class="services">
  <div class="wrap">
    <a class="example" data-wa data-msg="${attr(i.short)}" href="#contact">
      <span class="eyebrow">דוגמה להמחשה — לא לקוח אמיתי</span>
      <p>${i.example}</p>
      <span class="ex-go">נדבר על העסק שלך ←</span>
    </a>
  </div>
</section>

<div class="guarantee" id="price">
  <h2>התחייבות למחיר הכי משתלם</h2>
  <p>קיבלת הצעה זולה יותר על אותה עבודה? שלח לנו אותה, ונשווה.</p>
</div>

<section class="faq-sec" id="faq">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">שאלות נפוצות</span>
      <h2 class="h2">מה ${i.short} שואלים אותנו</h2>
    </div>
    <div id="faq-list">
${i.faq.map(([q, a]) => `    <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </div>
  </div>
</section>

${contact('ספר לנו על העסק, ונחזור אליך.')}

<section class="more">
  <div class="wrap">
    <div class="sec-head"><h2 class="h2">עוד תחומים שאנחנו בונים להם</h2></div>
    <div class="ind-grid">
${others.map(o => `      <a class="ind" href="${root}${o.slug}/"><span class="ic">${icon(o.icon)}</span><b>${o.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
    </div>
  </div>
</section>`;

  write(`${i.slug}/index.html`, page({
    path: i.slug + '/', root, title: i.title, description: i.description,
    greeting: `היי, הגעתי מהאתר של POETEXA (${i.short}) ואשמח לשיחת ייעוץ חינם 🙂`,
    from: `היי, הגעתי מהאתר של POETEXA (${i.short})`,
    schemas: [
      {
        '@context': 'https://schema.org', '@type': 'Service',
        name: i.h1, serviceType: i.short, description: i.description,
        provider: { '@id': BASE + '#business' },
        areaServed: { '@type': 'Country', name: 'ישראל' },
        url: BASE + i.slug + '/'
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'דף הבית', item: BASE },
          { '@type': 'ListItem', position: 2, name: i.short, item: BASE + i.slug + '/' }
        ]
      },
      faqSchema(i.faq)
    ],
    body
  }));
}

// ---------- service pages (AI / automations / landing pages) ----------
// Same intent as the industry pages above, but split by what we build
// instead of who it's for, so a campaign ad for "AI" or "אוטומציות ניהול"
// can link straight to the page that explains exactly that.
for (const s of services) {
  const root = '../';
  const body = `<section class="hero hero-sm">
  <i class="blob b1"></i><i class="blob b2"></i>
  <div class="wrap">
    <nav class="crumbs" aria-label="מיקום בדף"><a href="${root}">דף הבית</a> <span>›</span> ${s.short}</nav>
    <span class="hero-ic">${icon(s.icon)}</span>
    <h1>${s.h1}</h1>
    <p>${s.lead}</p>
    <div class="ctas">
      <a class="btn btn-wa" data-wa href="#contact"><svg><use href="#wa"/></svg>שיחת ייעוץ חינם</a>
    </div>
  </div>
</section>

<section class="why-sec">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">למי זה מתאים</span>
      <h2 class="h2">${s.short} — מתי זה שימושי</h2>
    </div>
    <p>${s.audience}</p>
  </div>
</section>

<section class="services">
  <div class="wrap">
    <a class="example" data-wa data-msg="${attr(s.short)}" href="#contact">
      <span class="eyebrow">דוגמה להמחשה — לא לקוח אמיתי</span>
      <p>${s.example}</p>
      <span class="ex-go">נדבר על העסק שלך ←</span>
    </a>
  </div>
</section>

<section class="why-sec">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">חיבורים נדרשים</span>
      <h2 class="h2">איך זה מתחבר למה שיש לך</h2>
    </div>
    <ul>
${s.integrations.map(t => `      <li>${t}</li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="why-sec">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">חשוב לדעת</span>
      <h2 class="h2">מגבלות</h2>
    </div>
    <ul>
${s.limits.map(t => `      <li>${t}</li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="faq-sec" id="faq">
  <div class="wrap prose">
    <div class="sec-head">
      <span class="eyebrow">שאלות נפוצות</span>
      <h2 class="h2">מה שואלים אותנו על ${s.short}</h2>
    </div>
    <div id="faq-list">
${s.faq.map(([q, a]) => `    <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </div>
  </div>
</section>

${contact('ספר לנו על העסק, ונחזור אליך.')}`;

  write(`${s.slug}/index.html`, page({
    path: s.slug + '/', root, title: s.title, description: s.description,
    greeting: `היי, הגעתי מהאתר של POETEXA (${s.short}) ואשמח לשיחת ייעוץ חינם 🙂`,
    from: `היי, הגעתי מהאתר של POETEXA (${s.short})`,
    schemas: [
      {
        '@context': 'https://schema.org', '@type': 'Service',
        name: s.h1, serviceType: s.short, description: s.description,
        provider: { '@id': BASE + '#business' },
        areaServed: { '@type': 'Country', name: 'ישראל' },
        url: BASE + s.slug + '/'
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'דף הבית', item: BASE },
          { '@type': 'ListItem', position: 2, name: s.short, item: BASE + s.slug + '/' }
        ]
      },
      faqSchema(s.faq)
    ],
    body
  }));
}

// ---------- not found ----------
// Cloudflare serves this for any address that does not exist. Without it the
// visitor gets a bare server error page with none of our branding and no way on.
write('404.html', page({
  // absolute, because a 404 is served at whatever address the visitor mistyped
  path: '404', root: '/',
  title: 'הדף לא נמצא | ' + BRAND,
  description: 'הכתובת שחיפשת לא קיימת באתר של POETEXA. מכאן אפשר לחזור לדף הבית, לעבודות או ליצירת קשר.',
  body: `<section class="hero hero-sm">
  <i class="blob b1"></i><i class="blob b2"></i>
  <div class="wrap">
    <span class="tag">404</span>
    <h1>הדף הזה לא קיים</h1>
    <p>אולי הכתובת השתנתה, ואולי נפלה אות בדרך. הנה מה שכן נמצא כאן:</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="ind-grid">
      <a class="ind" href="/"><span class="ic">${icon('globe')}</span><b>דף הבית</b><span class="go">${icon('arrow')}</span></a>
      <a class="ind" href="/#services"><span class="ic">${icon('box')}</span><b>מה אנחנו בונים</b><span class="go">${icon('arrow')}</span></a>
      <a class="ind" href="/#work"><span class="ic">${icon('star')}</span><b>עבודות</b><span class="go">${icon('arrow')}</span></a>
      <a class="ind" href="/guides/"><span class="ic">${icon('book')}</span><b>מדריכים</b><span class="go">${icon('arrow')}</span></a>
      <a class="ind" href="/#film"><span class="ic">${icon('zap')}</span><b>סרטון הדגמה</b><span class="go">${icon('arrow')}</span></a>
      <a class="ind" href="/#contact"><span class="ic">${icon('message')}</span><b>יצירת קשר</b><span class="go">${icon('arrow')}</span></a>
    </div>
  </div>
</section>`
}));

// ---------- guides ----------
const linkCards = (root, items, dir) => `<div class="ind-grid">
${items.map(o => `      <a class="ind" href="${root}${dir}${o.slug}/"><span class="ic">${icon(o.icon || 'arrow')}</span><b>${o.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
    </div>`;

write('guides/index.html', article({
  root: '../', trail: [['דף הבית', ''], ['מדריכים', 'guides/']],
  title: 'מדריכים לבעלי עסקים: אתרים, אפליקציות וניהול | POETEXA',
  description: 'מדריכים קצרים וברורים לבעלי עסקים: כמה עולה אתר, אתר או אפליקציה, ואיך לנהל משמרות בלי בלגן.',
  h1: 'מדריכים לבעלי עסקים', lead: 'תשובות ברורות לשאלות שכל בעל עסק שואל, לפני שהוא מוציא שקל.',
  body: `    ${linkCards('', guides, '')}`, wide: true
}));
for (const g of guides) {
  const others = guides.filter(o => o !== g);
  write(`guides/${g.slug}/index.html`, article({
    root: '../../', trail: [['דף הבית', ''], ['מדריכים', 'guides/'], [g.short, `guides/${g.slug}/`]],
    title: g.title, description: g.description, h1: g.h1, lead: g.lead, faq: g.faq,
    eyebrow: `מדריך · עודכן ${new Date(g.date).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`,
    body: labelTables(g.body),
    extraSchemas: [{
      '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.description,
      datePublished: `${g.date}T09:00:00+03:00`, dateModified: `${g.date}T09:00:00+03:00`, inLanguage: 'he',
      author: { '@id': BASE + '#business' }, publisher: { '@id': BASE + '#business' },
      image: BASE + 'og.jpg', mainEntityOfPage: BASE + `guides/${g.slug}/`
    }],
    related: `<section class="more"><div class="wrap"><div class="sec-head"><h2 class="h2">עוד מדריכים</h2></div>${linkCards('../../', others, 'guides/')}</div></section>`
  }));
}

// The Work It demo: the visitor assigns a task and watches both screens react.
const workItDemo = () => `${demoFab('#demo', '#demo')}
<section class="demo-sec" id="demo">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow">${icon('zap')} נסה בעצמך</span>
      <h2 class="h2">תן משימה, וראה את שני הצדדים</h2>
      <p class="lead">הדגמה חיה שרצה כאן בדף. מימין מה שאתה רואה כמנהל, ומשמאל מה שקורה בטלפון של העובד: ההודעה מגיעה בוואטסאפ, אבל <b>פקודת העבודה עצמה היא מסך במערכת</b>.</p>
    </div>
    <div class="demo" data-demo>
      <div class="demo-side">
        <span class="demo-tag">${icon('users')} המסך שלך</span>
        <div class="demo-panel">
          <label class="demo-f">מה צריך לעשות?
            <input id="d-task" value="לספור מלאי במחסן" maxlength="40">
          </label>
          <div class="demo-two">
            <label class="demo-f">מי מבצע?
              <select id="d-who"><option>דני</option><option>מאיה</option><option>אבי</option></select>
            </label>
            <label class="demo-f">עד מתי?
              <select id="d-due"><option>היום</option><option>מחר</option><option>סוף השבוע</option></select>
            </label>
          </div>
          <button class="btn btn-wa" id="d-send" type="button"><svg><use href="#wa"/></svg>שלח משימה</button>
          <ul class="demo-log" id="d-log"><li class="empty">כאן יופיע מה שקורה עם המשימה</li></ul>
          <div class="demo-export" id="d-export" hidden>
            <button class="btn btn-line" type="button" id="d-xlsx"><svg class="i" aria-hidden="true"><use href="#i-file"/></svg>ייצוא דוח אקסל</button>
            <div class="xls-result" id="d-xls-result" hidden>
              <div class="xls-h">דוח_עבודה.xlsx</div>
              <div class="xls-g"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <p class="xls-ok">✓ כל המשימות, התמונות והשעות בקובץ אחד</p>
            </div>
          </div>
        </div>
      </div>
      <div class="demo-side">
        <span class="demo-tag">${icon('phone')} הטלפון של העובד</span>
        <div class="dev demo-phone">
          <!-- מסך 1: ההודעה שמגיעה בוואטסאפ, רק כדי למסור את הקישור -->
          <div class="ph-screen is-on" id="d-wa">
            <div class="wa-h"><span class="av">ב</span><span id="d-name">דני</span></div>
            <div class="wa-chat" id="d-chat" tabindex="-1">
              <div class="b out empty-msg">שלח משימה כדי לראות מה מגיע אליו</div>
            </div>
            <div class="demo-act" id="d-act" hidden>
              <button type="button" id="d-open">פתח את פקודת העבודה</button>
            </div>
          </div>

          <!-- מסך 2: פקודת העבודה עצמה — זה המוצר -->
          <div class="ph-screen" id="d-task-screen">
            <div class="tk-h">
              <button type="button" class="tk-back" id="d-back" aria-label="חזרה למסך הקודם">›</button>
              <b id="d-task-title" tabindex="-1">פקודת עבודה</b>
            </div>
            <div class="tk-body">
              <span class="tk-status" id="d-status">ממתינה לביצוע</span>
              <h4 id="d-tk-title">לספור מלאי במחסן</h4>
              <dl class="tk-meta">
                <div><dt>עובד</dt><dd id="d-tk-who">דני</dd></div>
                <div><dt>יעד</dt><dd id="d-tk-due">היום</dd></div>
                <div><dt>נשלח</dt><dd id="d-tk-sent">—</dd></div>
              </dl>
              <div class="tk-photo" id="d-photo">
                <span id="d-photo-empty">צרף תמונה כהוכחת ביצוע</span>
              </div>
              <button class="tk-btn" type="button" id="d-done">סמן שבוצע וצרף תמונה</button>
              <p class="tk-ok" id="d-tk-ok" hidden>✓ הדיווח נשלח למנהל</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p class="demo-note">הדגמה בלבד: לא נשלחת הודעת וואטסאפ אמיתית ולא נשמר שום מידע.</p>
  </div>
</section>`;

// The smart-inbox demo: a sample inquiry comes in, gets classified, joins the
// handling queue and raises an alert — all automated — then stops and waits
// for a human to approve before anything would go out.
const autoInboxDemo = () => `${demoFab('#demo', '#demo')}
<section class="demo-sec" id="demo">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow">${icon('bot')} נסה בעצמך</span>
      <h2 class="h2">קבל פנייה לדוגמה, וראה מה קורה</h2>
      <p class="lead">הדגמה חיה שרצה כאן בדף, עם נתוני דוגמה מסומנים — שום הודעה אמיתית לא נשלחת. לוחצים, וצופים איפה האוטומציה פועלת לבד ואיפה אתה מאשר.</p>
    </div>
    <div class="inbox-demo" data-inbox-demo>
      <button class="btn btn-wa" id="ib-new" type="button"><svg><use href="#wa"/></svg>קבל פנייה לדוגמה</button>
      <div class="ib-flow">
        <div class="ib-step">
          <span class="ib-step-tag">${icon('message')} הפנייה נכנסת</span>
          <div class="ib-msg" id="ib-msg-text">—</div>
        </div>
        <div class="ib-step ib-auto">
          <span class="ib-step-tag">⚡ אוטומציה — מיון לפי נושא</span>
          <div class="ib-status" id="ib-classify-status">ממתין לפנייה…</div>
        </div>
        <div class="ib-step ib-auto">
          <span class="ib-step-tag">⚡ אוטומציה — הוספה לרשימה והתראה</span>
          <ul class="ib-queue" id="ib-queue"><li class="empty">הרשימה ריקה</li></ul>
        </div>
        <div class="ib-step ib-human">
          <span class="ib-step-tag">✋ כאן אתה מאשר</span>
          <div id="ib-approve-area"><p class="ib-hint">אין עדיין פנייה לאשר.</p></div>
        </div>
      </div>
    </div>
    <p class="demo-note">הדגמה בלבד: נתוני דוגמה מסומנים, ושום הודעה אמיתית לא נשלחת ולא נשמרת.</p>
  </div>
</section>`;

// ---------- project stories ----------
for (const c of cases) {
  const others = cases.filter(o => o !== c);
  write(`work/${c.slug}/index.html`, article({
    root: '../../', trail: [['דף הבית', ''], ['עבודות', '#work'], [c.short, `work/${c.slug}/`]],
    title: c.title, description: c.description, h1: c.h1, lead: c.lead, eyebrow: c.size,
    body: `${c.demo === 'work-it' ? workItDemo() : c.demo === 'inbox' ? autoInboxDemo() : ''}<h2>האתגר</h2>
<p>${c.problem}</p>
<h2>מה בנינו</h2>
<p>${c.solution}</p>
${c.gains ? `<h2>מה זה שינה</h2>
<div class="gains">
${c.gains.map(([was, now]) => `  <div class="gain"><p class="was">${was}</p><p class="now">${now}</p></div>`).join('\n')}
</div>
` : ''}<h2>שני הצדדים</h2>
<div class="sides">
  <div class="side side-a"><span class="side-tag">${icon('users')} ${c.sides.workerT}</span><p>${c.sides.worker}</p></div>
  <div class="side side-b"><span class="side-tag">${icon('chart')} ${c.sides.mgrT}</span><p>${c.sides.mgr}</p></div>
</div>
<h2>איך זה עובד</h2>
<ol class="steps-list">
${c.how.map(h => `  <li>${h}</li>`).join('\n')}
</ol>
<div class="callout"><b>מה זה אומר בשבילך</b><p>${c.shows}</p></div>`,
    related: `<section class="more"><div class="wrap"><div class="sec-head"><h2 class="h2">עוד עבודות</h2></div>${linkCards('../../', others.map(o => ({ ...o, icon: 'arrow' })), 'work/')}</div></section>`
  }));
}

// ---------- legal ----------
for (const l of legal) {
  write(`${l.slug}/index.html`, article({
    root: '../', trail: [['דף הבית', ''], [l.short, `${l.slug}/`]],
    title: l.title, description: l.description, h1: l.h1, lead: l.lead,
    body: l.body + `\n<p class="updated">עודכן לאחרונה: ${UPDATED}</p>`
  }));
}

// ---------- manifest: lets the phone install the site to the home screen ----------
write('manifest.webmanifest', JSON.stringify({
  name: FULL_NAME, short_name: BRAND,
  description: 'בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים קטנים, עם שילוב AI.',
  start_url: './', scope: './', id: './',
  display: 'standalone', orientation: 'portrait', lang: 'he', dir: 'rtl',
  background_color: '#f5f7fc', theme_color: '#15274d',
  categories: ['business', 'productivity'],
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');

// ---------- demo project ----------
// A site for a café that does not exist, built to show what a small business site
// looks like. It carries its own look, and a banner that says plainly it is a demo.
write('demo/cafe/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>לחם ושקד · בית קפה ומאפייה | פרויקט הדגמה של ${BRAND}</title>
<meta name="description" content="פרויקט הדגמה: אתר לבית קפה שכונתי, עם תפריט, שעות פתיחה והזמנת שולחן. נבנה על ידי POETEXA כדי להראות איך נראה אתר לעסק קטן.">
<link rel="canonical" href="${BASE}demo/cafe/">
<meta name="theme-color" content="#2A1D14">
<!-- A demo business: keep it out of search so nobody mistakes it for a real café. -->
<meta name="robots" content="noindex, follow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Frank+Ruhl+Libre:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="demo-ribbon">
  <span><b>פרויקט הדגמה</b> · עסק לדוגמה שאינו קיים</span>
  <a href="../../">נבנה על ידי POETEXA ←</a>
</div>
<main>
${readFileSync('src/demo-cafe.html', 'utf8')}
</main>
<footer class="c-foot">
  <div class="c-wrap">
    <p><b>לחם ושקד</b> · הלוחמים 14, חולון · 03-000-0000</p>
    <p class="c-dis">זהו פרויקט הדגמה. העסק, הכתובת והטלפון אינם אמיתיים. <a href="../../">POETEXA</a> בנתה אותו כדי להראות איך נראה אתר לעסק קטן.</p>
  </div>
</footer>
<script>
document.getElementById('c-form').addEventListener('submit', e => {
  e.preventDefault();
  const n = document.getElementById('c-note');
  n.textContent = 'תודה! בהדגמה הזו לא נשלחה בקשה. באתר אמיתי הבקשה הייתה מגיעה לבית הקפה.';
  n.className = 'c-note ok';
});
</script>
</body>
</html>
`);

// ---------- demo landing page ----------
// Where a campaign on Instagram or Facebook should land: the "link in bio" shape
// people already know, except every button answers here instead of sending the
// visitor away. It carries its own look, a banner saying plainly it is a demo, and
// the source tag the real thing files with the lead — shown working, not described.
write('demo/landing/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>נועה ברק · פילאטיס | דף נחיתה לדוגמה של ${BRAND}</title>
<meta name="description" content="דף נחיתה לדוגמה לקמפיין באינסטגרם ובפייסבוק: הצעה אחת, טופס שנפתח במקום, שאלון התאמה, כפתור וואטסאפ ומעקב מאיפה הגיע הליד. נבנה על ידי POETEXA.">
<link rel="canonical" href="${BASE}demo/landing/">
<meta name="theme-color" content="#F7F3EB">
<!-- An instructor who does not exist: keep it out of search so nobody books a class. -->
<meta name="robots" content="noindex, follow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Frank+Ruhl+Libre:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="demo-ribbon">
  <span><b>דף נחיתה לדוגמה</b> · עסק שאינו קיים</span>
  <a href="../../">נבנה על ידי POETEXA ←</a>
</div>
${readFileSync('src/demo-landing.html', 'utf8').replace('א׳–ה׳ 06:30–21:00 · ו׳ 07:00–13:00', demoHoursLabel(DEMO_HOURS))}
<footer class="l-foot">
  <p><b>נועה ברק · פילאטיס ואימון אישי</b> · אבן גבירול 00, תל אביב</p>
  <p class="l-dis">זהו דף נחיתה להדגמה. המאמנת, הכתובת והשעות אינם אמיתיים, התמונה היא איור, ושום פנייה לא נשלחת. <a href="../../">POETEXA</a> בנתה אותו כדי להראות לאן מודעה באינסטגרם או בפייסבוק צריכה לנחות.</p>
</footer>
<script>
(() => {
  // 1. Where the click came from. A real page files this with the lead, so the
  //    business knows which campaign paid for itself.
  const FROM = { ig: 'אינסטגרם', instagram: 'אינסטגרם', fb: 'פייסבוק', facebook: 'פייסבוק',
                 tiktok: 'טיקטוק', tt: 'טיקטוק', google: 'גוגל', g: 'גוגל' };
  const src = (new URLSearchParams(location.search).get('utm_source') || '').toLowerCase();
  const tag = document.getElementById('l-src');
  if (tag && FROM[src]) tag.textContent = 'הגעת מ' + FROM[src];

  // 2. Open or closed, read from the clock rather than written in the text — a line
  //    that says "open now" when it is nine at night costs more than it gives.
  //    Same HOURS array the build script used for the printed hours line
  //    (Date#getDay() order: 0 = Sunday ... 6 = Saturday), and read in Israel
  //    time specifically — a visitor's own device clock/timezone must not
  //    decide whether a Tel Aviv studio looks open.
  const HOURS = ${JSON.stringify(DEMO_HOURS)};
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date()).map(p => [p.type, p.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const mins = Number(parts.hour) * 60 + Number(parts.minute);
  const span = HOURS[day];
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const open = document.getElementById('l-open');
  if (span && mins >= span[0] && mins < span[1]) {
    open.classList.add('on');
    open.innerHTML = '<i></i> פתוח עכשיו · עד ' + hhmm(span[1]);
  } else {
    const next = HOURS.slice(day + 1).concat(HOURS).find(Boolean);
    open.innerHTML = '<i></i> סגור כרגע · נפתח ב-' + hhmm(next[0]);
  }

  // 3. Every tap is counted. In the real page it reaches the owner; here it stays in
  //    this browser, and the panel says so.
  const LABELS = { 'a-book': 'שיעור ניסיון', 'wa': 'וואטסאפ', 'a-quiz': 'שאלון התאמה',
                   'a-class': 'איך נראה שיעור', 'a-where': 'איפה ומתי' };
  const taps = {};
  const bars = document.getElementById('l-stats');
  const draw = () => {
    const top = Math.max(1, ...Object.values(taps));
    bars.innerHTML = Object.keys(LABELS).map(k => {
      const n = taps[k] || 0;
      return '<li><span class="k">' + LABELS[k] + ' <em>' + n + '</em></span>' +
             '<span class="t"><i style="width:' + (n / top * 100) + '%"></i></span></li>';
    }).join('');
  };
  const count = k => { taps[k] = (taps[k] || 0) + 1; draw(); };
  draw();
  for (const id of ['a-book', 'a-quiz', 'a-class', 'a-where']) {
    document.getElementById(id).addEventListener('toggle', e => { if (e.target.open) count(id); });
  }

  // 4. WhatsApp, the form and the quiz: each says what the real page would do.
  document.getElementById('l-wa').addEventListener('click', e => {
    e.preventDefault(); count('wa');
    alert('בהדגמה הזו וואטסאפ לא נפתח. בדף אמיתי זה פותח שיחה עם המאמנת, עם ההודעה כבר כתובה.');
  });
  document.getElementById('l-lead').addEventListener('submit', e => {
    e.preventDefault();
    const n = document.getElementById('l-note');
    n.textContent = 'תודה! בהדגמה הזו לא נשלחה פנייה. בדף אמיתי היא הייתה מגיעה למאמנת תוך שנייה, יחד עם המקור שממנו הגעת.';
    n.className = 'b-note ok';
  });

  const Q = [
    ['מתי התאמנת לאחרונה?', ['השבוע', 'לפני כמה חודשים', 'לא זוכר']],
    ['יש משהו שכואב?', ['גב תחתון', 'ברכיים', 'שום דבר מיוחד']],
    ['מה הכי מתאים לך?', ['בוקר מוקדם', 'אחר הצהריים', 'ערב']],
  ];
  let i = 0;
  const q = document.getElementById('q-q'), opts = document.getElementById('q-opts'),
        bar = document.getElementById('q-bar'), out = document.getElementById('q-out');
  const ask = () => {
    if (i === Q.length) {
      document.getElementById('q-box').hidden = true;
      out.hidden = false;
      out.className = 'b-note ok';
      out.textContent = 'מתאים לך. בדף אמיתי התשובות היו מגיעות למאמנת לפני שהגעת, והיא הייתה יודעת איתך מה לעשות בשיעור הראשון.';
      return;
    }
    q.textContent = Q[i][0];
    bar.style.width = (i / Q.length * 100) + '%';
    opts.innerHTML = '';
    for (const a of Q[i][1]) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = a;
      btn.addEventListener('click', () => { i++; ask(); });
      opts.append(btn);
    }
  };
  ask();
})();
</script>
</body>
</html>
`);

// ---------- palette preview ----------
// Four candidate palettes on the site's own shapes, for a decision made by looking
// rather than by reading colour names. Temporary: delete this block once one is picked.
write('demo/colors/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ארבעה כיוונים לצבע | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-colors.html', 'utf8')}
<footer>תגיד לי מספר, ואני צובע את כל האתר בו. <a href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// Five readings of the blue direction, on the same components as the first set.
write('demo/colors-blue/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>חמישה גוונים של כחול עמוק | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../colors/style.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-colors-blue.html', 'utf8')}
<footer>תגיד לי מספר, ואני צובע את כל האתר בו. <a href="${BASE}demo/colors/">חזרה לארבעת הכיוונים</a></footer>
</body>
</html>
`);

// Logo candidates, each in the dark bar and on paper. Temporary, like the palette pages.
write('demo/logo/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>שש אפשרויות ללוגו | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-logo.html', 'utf8')}
<footer>תגיד לי מספר, ואני מחליף אותו בכל מקום. <a href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// Ten palettes on the same components as the earlier sets. Temporary.
write('demo/colors10/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>עשרה שילובי צבע | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../colors/style.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-colors10.html', 'utf8')}
<footer>תגיד לי מספר, ואני צובע את כל האתר בו. <a href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// Three design directions for the first screen. Temporary, like the palette pages.
write('demo/premium/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>שלושה כיוונים ליוקרה | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#111111">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Frank+Ruhl+Libre:wght@700;800;900&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-premium.html', 'utf8')}
<footer>תגיד לי אות — א, ב או ג — ואבנה את כל האתר בשפה הזו. <a href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// A fourth direction: blueprint. Temporary, like the other design pages.
write('demo/blueprint/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>השרטוט | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F6F4EE">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Frank+Ruhl+Libre:wght@700;800;900&family=Rubik:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-blueprint.html', 'utf8')}
<footer style="max-width:560px;margin:0 auto;padding:24px 20px 50px;text-align:center;color:#6B6355;font-size:15px">תגיד לי אם זה הכיוון, ואני בונה את כל האתר כך. <a style="color:#1C1A15;font-weight:700" href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// A fifth direction: futuristic, carried by motion. Temporary.
write('demo/future/index.html', `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>עתידני | ${BRAND}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0E0B07">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Frank+Ruhl+Libre:wght@700;800;900&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
${readFileSync('src/demo-future.html', 'utf8')}
<footer style="max-width:560px;margin:0 auto;padding:24px 20px 50px;text-align:center;color:#9A9284;font-size:15px">תגיד לי אם זה הכיוון, ואני בונה את כל האתר כך. <a style="color:#F7F2E4;font-weight:700" href="../../">חזרה לאתר</a></footer>
</body>
</html>
`);

// ---------- what the assistant answers from ----------
write('kb.json', JSON.stringify(buildKnowledge()));

// ---------- sitemap + robots ----------
const urls = ['', ...industries.map(i => i.slug + '/'), ...services.map(s => s.slug + '/'), 'guides/', ...guides.map(g => `guides/${g.slug}/`),
  ...cases.map(c => `work/${c.slug}/`), ...legal.map(l => l.slug + '/')];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${BASE}sitemap.xml
`);

console.log('built', urls.length, 'pages');
