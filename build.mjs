// Builds the whole site from src/: the home page, a page per industry, sitemap.xml and robots.txt.
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { BASE, BRAND, FULL_NAME, head, header, footer, contact, icon, business, faqSchema } from './src/layout.mjs';
import { industries } from './src/industries.mjs';
import { reviews, REVIEW_URL } from './src/reviews.mjs';
import { guides } from './src/guides.mjs';
import { cases } from './src/cases.mjs';
import { legal, UPDATED } from './src/legal.mjs';

const nav = { industries, guides, cases, legal };

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
const withIcons = html => html.replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => icon(n));

// ---------- shared sections ----------
const industriesSection = root => `<section class="industries" id="industries">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">פתרונות לפי תחום</span>
      <h2 class="h2">מה בונים לעסק כמו שלך</h2>
      <p class="lead">לכל תחום יש בעיות משלו. אלה כמה מהתחומים שאנחנו בונים להם. לא מצאת את שלך? אנחנו בונים הכל.</p>
    </div>
    <div class="ind-grid">
${industries.map(i => `      <a class="ind" href="${root}${i.slug}/"><span class="ic">${icon(i.icon)}</span><b>${i.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
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

const page = ({ path, root, title, description, schemas, body, greeting, from }) =>
  head({ title, description, path, schemas, root }) + `
<body${greeting ? ` data-greeting="${greeting}"` : ''}${from ? ` data-from="${from}"` : ''}>
${header(root)}
<main id="top">
${body}
</main>
${footer(root, nav)}`;

// ---------- home ----------
let home = readFileSync('src/home.html', 'utf8');
const homeFaq = [...home.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(m => [m[1], m[2]]);
home = withIcons(home)
  .replace('<!--INDUSTRIES-->', industriesSection(''))
  .replace('<!--REVIEWS-->', reviewsSection())
  .replace('<!--GUIDES-->', guidesSection(''))
  .replace('<!--CONTACT-->', contact());

write('index.html', page({
  path: '', root: '',
  title: 'בונים הכל | בניית אתרים, אפליקציות ומערכות לעסקים קטנים',
  description: 'בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים קטנים, עם שילוב AI: עובדים, משמרות, מסמכים, לקוחות ועוד. מכלי קטן ועד מערכת מלאה – שיחת ייעוץ חינם.',
  schemas: [business, faqSchema(homeFaq)],
  body: home
}));

// ---------- industry pages ----------
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
      <span class="eyebrow">מכירים את זה?</span>
      <h2 class="h2">מה מעיק על ${i.short}</h2>
    </div>
    <div class="pains">
${i.pains.map(p => `      <div class="pain"><span>✕</span><p>${p}</p></div>`).join('\n')}
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
${i.solutions.map(s => `      <div class="card"><div class="ic">${icon(s.icon)}</div><h3>${s.t}</h3><p>${s.d}</p></div>`).join('\n')}
      <div class="card"><div class="ic">${icon('bot')}</div><h3>עם AI, אם תרצה</h3><p>צ׳אט שעונה ללקוחות, סיכומים ומסמכים שממלאים את עצמם. משלבים רק איפה שזה חוסך לך זמן.</p></div>
      <div class="card idea"><div class="ic">${icon('bulb')}</div><h3>צריך משהו אחר?</h3><p>כל תהליך בעסק שלך אפשר להפוך לכלי פשוט. ספר לנו מה מעיק.</p></div>
    </div>
  </div>
</section>

<section class="services">
  <div class="wrap">
    <div class="example">
      <span class="eyebrow">איך זה נראה ביום־יום</span>
      <p>${i.example}</p>
    </div>
  </div>
</section>

<div class="guarantee">
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

${contact('ספר לנו על העסק, והתשובה מגיעה בוואטסאפ עוד היום.')}

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
    greeting: `היי, הגעתי מהאתר של בונים הכל (${i.short}) ואשמח לשיחת ייעוץ חינם 🙂`,
    from: `היי, הגעתי מהאתר של בונים הכל (${i.short})`,
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

// ---------- guides ----------
const linkCards = (root, items, dir) => `<div class="ind-grid">
${items.map(o => `      <a class="ind" href="${root}${dir}${o.slug}/"><span class="ic">${icon(o.icon || 'arrow')}</span><b>${o.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
    </div>`;

write('guides/index.html', article({
  root: '../', trail: [['דף הבית', ''], ['מדריכים', 'guides/']],
  title: 'מדריכים לבעלי עסקים: אתרים, אפליקציות וניהול | בונים הכל',
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
      datePublished: g.date, dateModified: g.date, inLanguage: 'he',
      author: { '@id': BASE + '#business' }, publisher: { '@id': BASE + '#business' },
      image: BASE + 'og.jpg', mainEntityOfPage: BASE + `guides/${g.slug}/`
    }],
    related: `<section class="more"><div class="wrap"><div class="sec-head"><h2 class="h2">עוד מדריכים</h2></div>${linkCards('../../', others, 'guides/')}</div></section>`
  }));
}

// ---------- project stories ----------
for (const c of cases) {
  const others = cases.filter(o => o !== c);
  write(`work/${c.slug}/index.html`, article({
    root: '../../', trail: [['דף הבית', ''], ['עבודות', '#work'], [c.short, `work/${c.slug}/`]],
    title: c.title, description: c.description, h1: c.h1, lead: c.lead, eyebrow: c.size,
    body: `<h2>האתגר</h2>
<p>${c.problem}</p>
<h2>מה בנינו</h2>
<p>${c.solution}</p>
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
  start_url: BASE, scope: BASE, id: BASE,
  display: 'standalone', orientation: 'portrait', lang: 'he', dir: 'rtl',
  background_color: '#0F1A1F', theme_color: '#0F1A1F',
  categories: ['business', 'productivity'],
  icons: [
    { src: BASE + 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: BASE + 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: BASE + 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');

// ---------- sitemap + robots ----------
const urls = ['', ...industries.map(i => i.slug + '/'), 'guides/', ...guides.map(g => `guides/${g.slug}/`),
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
