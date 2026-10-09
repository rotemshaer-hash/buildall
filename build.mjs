// Builds the whole site from src/: the home page, a page per industry, sitemap.xml and robots.txt.
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { BASE, head, header, footer, contact, icon, business, faqSchema } from './src/layout.mjs';
import { industries } from './src/industries.mjs';
import { reviews, REVIEW_URL } from './src/reviews.mjs';

const write = (path, html) => {
  mkdirSync(path.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  writeFileSync(path, html);
};
const withIcons = html => html.replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => icon(n));

// ---------- shared sections ----------
const industriesSection = root => `<section class="industries" id="industries">
  <div class="wrap">
    <span class="eyebrow">פתרונות לפי תחום</span>
    <h2 class="h2">מה בונים לעסק כמו שלך</h2>
    <p class="lead">לכל תחום יש בעיות משלו. אלה כמה מהתחומים שאנחנו בונים להם. לא מצאת את שלך? אנחנו בונים הכל.</p>
    <div class="ind-grid">
${industries.map(i => `      <a class="ind" href="${root}${i.slug}/"><span class="ic">${icon(i.icon)}</span><b>${i.short}</b><span class="go">${icon('arrow')}</span></a>`).join('\n')}
    </div>
  </div>
</section>`;

const reviewsSection = () => {
  if (!reviews.length) return '';
  return `<section class="reviews">
  <div class="wrap center">
    <span class="eyebrow">ביקורות מגוגל</span>
    <h2 class="h2">מה אומרים עלינו</h2>
    <div class="rev-grid" style="text-align:right">
${reviews.map(r => `      <figure class="card rev"><div class="stars" aria-label="${r.stars} כוכבים">${'★'.repeat(r.stars)}</div><blockquote>${r.text}</blockquote><figcaption>${r.name} · ביקורת בגוגל</figcaption></figure>`).join('\n')}
    </div>
    ${REVIEW_URL ? `<a class="btn btn-line" href="${REVIEW_URL}" target="_blank" rel="noopener">${icon('star')} לכל הביקורות בגוגל</a>` : ''}
  </div>
</section>`;
};

const page = ({ path, root, title, description, schemas, body, greeting, from }) =>
  head({ title, description, path, schemas, root }) + `
<body${greeting ? ` data-greeting="${greeting}"` : ''}${from ? ` data-from="${from}"` : ''}>
${header(root)}
<main id="top">
${body}
</main>
${footer(root, industries)}`;

// ---------- home ----------
let home = readFileSync('src/home.html', 'utf8');
const homeFaq = [...home.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(m => [m[1], m[2]]);
home = withIcons(home)
  .replace('<!--INDUSTRIES-->', industriesSection(''))
  .replace('<!--REVIEWS-->', reviewsSection())
  .replace('<!--CONTACT-->', contact());

write('index.html', page({
  path: '', root: '',
  title: 'בונים הכל | בניית אתרים, דפי נחיתה ואפליקציות לעסקים',
  description: 'בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים: עובדים, משמרות, מסמכים, לקוחות ועוד. מכלי קטן ועד מערכת מלאה – שיחת ייעוץ חינם.',
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

<section>
  <div class="wrap">
    <span class="eyebrow">מכירים את זה?</span>
    <h2 class="h2">מה מעיק על ${i.short}</h2>
    <div class="pains">
${i.pains.map(p => `      <div class="pain"><span>✕</span><p>${p}</p></div>`).join('\n')}
    </div>
  </div>
</section>

<section class="ladder" id="solutions">
  <div class="wrap">
    <span class="eyebrow">מה אנחנו בונים</span>
    <h2 class="h2">הפתרונות ל${i.short}</h2>
    <div class="grid">
${i.solutions.map(s => `      <div class="card"><div class="ic">${icon(s.icon)}</div><h3>${s.t}</h3><p>${s.d}</p></div>`).join('\n')}
      <div class="card idea"><div class="ic">${icon('bulb')}</div><h3>צריך משהו אחר?</h3><p>כל תהליך בעסק שלך אפשר להפוך לכלי פשוט. ספר לנו מה מעיק.</p></div>
    </div>
  </div>
</section>

<section>
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

<section id="faq">
  <div class="wrap" style="max-width:760px">
    <span class="eyebrow">שאלות נפוצות</span>
    <h2 class="h2">מה ${i.short} שואלים אותנו</h2>
    <div id="faq-list">
${i.faq.map(([q, a]) => `    <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
    </div>
  </div>
</section>

${contact('ספר לנו על העסק, והתשובה מגיעה בוואטסאפ עוד היום.')}

<section class="more">
  <div class="wrap">
    <h2 class="h2">עוד תחומים שאנחנו בונים להם</h2>
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

// ---------- sitemap + robots ----------
const urls = ['', ...industries.map(i => i.slug + '/')];
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
