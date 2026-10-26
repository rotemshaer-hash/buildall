// Everything every page shares: the address, the icons, the logo, the head, header and footer.
// Change it here and `node build.mjs` writes it into every page.

// The site's address. When a real domain is bought, change this one line and rebuild.
export const BASE = 'https://poetexa.pages.dev/';

export const BRAND = 'POETEXA';
export const FULL_NAME = 'POETEXA — סטודיו לעיצוב אתרים, אפליקציות ופתרונות AI';
export const PHONE = { display: '054-202-0812', intl: '+972-54-202-0812', tel: '+972542020812' };

// Tracking. Both stay empty until Rotem creates them; while empty nothing is loaded.
// GA_ID: the Google Analytics measurement ID, looks like 'G-XXXXXXXXXX'.
export const GA_ID = '';
// GSC_VERIFY: the content="..." value of the Search Console HTML-tag verification.
export const GSC_VERIFY = '41VeVOyRt4SkL_H4KKYRCT9Z7gUJ_T5l3eAbktuZsnc';

// שליחת הטופס במייל, דרך Web3Forms (חינם, עד 250 פניות בחודש).
// הכתובת עצמה שמורה אצלם ולא מופיעה בקוד, כי המאגר ציבורי וכתובת גלויה אוספת ספאם.
// להשיג מפתח: web3forms.com -> מקלידים את המייל העסקי -> המפתח מגיע למייל.
// כל עוד הוא ריק, כפתור המייל לא מוצג והטופס עובד בוואטסאפ בלבד.
export const FORM_KEY = 'f42beb26-188e-4cb0-a2f9-bfc75aa1d734';
// הכתובת להצגה באתר ובפוטר. ריק = לא מוצגת.
export const EMAIL = 'poetexa.studio@gmail.com';

// Line icons, 24×24, drawn with the brand gradient. Used as <svg class="i"><use href="#i-NAME"/></svg>.
const ICONS = {
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M11 18h2"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  check: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  contacts: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  learn: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  sparkles: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18"/><path d="M9 20v-6h6v6"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  dumbbell: '<path d="M6.5 6.5h11M6.5 17.5h11"/><path d="M6 20V4M18 20V4M3 16V8M21 16V8"/>',
  spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  arrow: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  call: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};

// The logo: code brackets with "הכל" as the dot held between them.
// It is defined once here and reused by the header, the favicon, the app icons
// (tools/icons.mjs) and the share card (tools/og.mjs). Change it only here.
// `stroke`/`fill` are set by whatever draws it, so it works in light and dark.
export const LOGO_SHAPES = `
  <g class="lk" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path class="lk-r" d="M22 12 8 32l14 20"/>
    <path class="lk-l" d="M42 12l14 20-14 20"/>
  </g>
  <circle class="lk-d" cx="32" cy="32" r="5"/>`;

// The same mark with no classes, for files that cannot carry a stylesheet.
export const logoPlain = (color = 'url(#g)') =>
  LOGO_SHAPES.replace(/ class="[^"]*"/g, '')
    .replace('<g fill="none"', `<g fill="none" stroke="${color}"`)
    .replace('<circle', `<circle fill="${color}"`);


// Platform marks, shown so a business running ads recognises where its landing page
// goes. They are filled rather than stroked like the rest of the set, since a brand
// mark has to keep its own shape. Nothing beside them claims a partnership: showing
// a platform you build for is fair, implying it endorses you is not.
const BRANDS = {
  instagram: ['אינסטגרם', '<rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.6" fill="none" stroke="url(#ig-g)" stroke-width="2.1"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="url(#ig-g)" stroke-width="2.1"/><circle cx="17.5" cy="6.5" r="1.4" fill="#C13584"/>'],
  facebook: ['פייסבוק', '<path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>'],
  tiktok: ['טיקטוק', '<g><path fill="#25F4EE" d="M15.4 2h-3v13.2a2.8 2.8 0 1 1-2.3-2.8V9.3a5.9 5.9 0 1 0 5.3 5.9V8.8a6.9 6.9 0 0 0 4.4 1.3V7.1A4 4 0 0 1 15.4 2z"/><path fill="#FE2C55" d="M17.8 2h-3v13.2a2.8 2.8 0 1 1-2.3-2.8V9.3a5.9 5.9 0 1 0 5.3 5.9V8.8a6.9 6.9 0 0 0 4.4 1.3V7.1A4 4 0 0 1 17.8 2z"/><path fill="#010101" d="M16.6 2h-3v13.2a2.8 2.8 0 1 1-2.3-2.8V9.3a5.9 5.9 0 1 0 5.3 5.9V8.8A6.9 6.9 0 0 0 21 10.1V7.1a4 4 0 0 1-4.4-5.1z"/></g>'],
  google: ['גוגל', '<path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12V14h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.8 3-4.4 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.6c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.8V7.6H3.2a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.8-2.8A10 10 0 0 0 3.2 7.6l3.3 2.6A5.9 5.9 0 0 1 12 6z"/>'],
};


// The row of marks, as one block wherever a landing page is offered.
export const brandRow = `<span class="brands">${Object.entries(BRANDS)
  .map(([k, [label]]) => `<svg class="br" role="img" aria-label="${label}"><use href="#b-${k}"/></svg>`).join('')}</span>`;

export const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ig-g" x1="2" y1="22" x2="22" y2="2">
      <stop offset="0" stop-color="#F9CE34"/><stop offset=".45" stop-color="#EE2A7B"/><stop offset="1" stop-color="#6228D7"/>
    </linearGradient>
    <linearGradient id="lg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3258c5"/><stop offset="1" stop-color="#3258c5"/></linearGradient>
    <linearGradient id="ig" gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2"><stop offset="0" stop-color="#785CF3"/><stop offset="1" stop-color="#286FFF"/></linearGradient>
    <symbol id="wa" viewBox="0 0 32 32"><path fill="#fff" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.6l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.8C5.1 9.9 10 5.2 16 5.2s10.9 4.7 10.9 10.6S22 26.4 16 26.4zm6-7.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2l-1 1.3c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.5c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 2.2.9 3 1 4.1.8.7-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.2-.3-.3-.6-.4z"/></symbol>
${Object.entries(ICONS).map(([k, v]) => `    <symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('\n')}
${Object.entries(BRANDS).map(([k, [, v]]) => `    <symbol id="b-${k}" viewBox="0 0 24 24" fill="currentColor">${v}</symbol>`).join('\n')}
  </defs>
</svg>`;

export const icon = name => {
  if (!ICONS[name]) throw new Error('unknown icon: ' + name);
  return `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;
};

const faviconSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0' y1='1' x2='1' y2='0'><stop offset='0' stop-color='#785CF3'/><stop offset='1' stop-color='#785CF3'/></linearGradient></defs><rect width='64' height='64' rx='14' fill='#F6F8FF'/>${logoPlain().replace(/"/g, "'")}</svg>`;
export const favicon = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg.replace(/\s+/g, ' '));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function head({ title, description, path, schemas = [], root }) {
  const url = BASE + path;
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#172B55">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="POETEXA – בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}og.jpg">${GSC_VERIFY ? `
<meta name="google-site-verification" content="${GSC_VERIFY}">` : ''}${GA_ID ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script>` : ''}
<link rel="icon" href="${favicon}">
<link rel="apple-touch-icon" href="${root}icons/icon-192.png">
<link rel="manifest" href="${root}manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${BRAND}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600&family=Rubik:wght@700;800;900&family=Frank+Ruhl+Libre:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}style.css">
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>`;
}

export function header(root) {
  return `${sprite}
<a class="skip-link" href="#top">דילוג לתוכן</a>
<header>
  <div class="wrap">
    <a class="logo" href="${root || './'}" aria-label="${BRAND} – לדף הבית">
      <svg viewBox="0 0 64 64" aria-hidden="true" stroke="url(#lg)" fill="url(#lg)">${LOGO_SHAPES}</svg>
      <span><b class="poetexa-wordmark">POETEXA</b><small>DIGITAL DESIGN STUDIO</small></span>
    </a>
    <nav class="head-nav" aria-label="ניווט ראשי">
      <a href="${root || './'}#problems">בעיות</a>
      <a href="${root || './'}#services">שירותים</a>
      <a href="${root || './'}#work">עבודות</a>
      <a href="${root || './'}#film">סרטון</a>
      <a href="${root || './'}#process">איך עובדים</a>
    </nav>
    <div class="head-actions">
      <a class="btn btn-call" href="tel:${PHONE.tel}" data-call aria-label="חיוג ל־${PHONE.display}"><svg class="i" aria-hidden="true"><use href="#i-call"/></svg><span>התקשר</span></a>
      <button class="btn btn-ai ai-open" id="ai-open" type="button" aria-label="פתיחת צ'אט עם העוזר החכם"><svg class="i" aria-hidden="true"><use href="#i-bot"/></svg><span>שאל AI</span></button>
      <a aria-label="שיחה בוואטסאפ" class="btn btn-wa head-cta" data-wa href="${root}#contact"><svg><use href="#wa"/></svg><span class="wa-t">וואטסאפ</span></a>
      ${navBar(root)}
    </div>
  </div>
</header>`;
}

// One compact navigation control inside the header; the panel is a complete site map.
export function navBar(root) {
  const r = root || './';
  const items = [
    ['film','camera','סרטון הדגמה'], ['problems','wrench','נתחיל מהבעיה'],
    ['industries','store','לפי תחום'],
    ['services','globe','שירותים'], ['auto','zap','אוטומציות'], ['ai','bot','AI'],
    ['work','star','עבודות'],
    ['process','check','איך עובדים'], ['contact','message','יצירת קשר']
  ];
  return `<nav class="nav-bar" aria-label="ניווט מהיר">
    <details class="mobile-menu">
      <summary aria-label="פתיחה וסגירה של תפריט האתר" title="תפריט">
        <span class="menu-glyph" aria-hidden="true"><i></i><i></i><i></i></span>
        <svg class="menu-close" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </summary>
      <button class="menu-backdrop" type="button" aria-label="סגירת התפריט" tabindex="-1"></button>
      <div class="menu-panel">
        <div class="menu-intro"><span>POETEXA / EXPLORE</span><b>מה בונים היום?</b></div>
        <ul>${items.map(([id, name, label]) => `<li><a href="${r}#${id}"><span class="menu-icon">${icon(name)}</span><span>${label}</span></a></li>`).join('')}</ul>
        <a class="menu-contact" href="${r}#contact">בוא נדבר על הרעיון שלך <span aria-hidden="true">←</span></a>
      </div>
    </details>
  </nav>`;
}

export function footer(root, nav) {
  const links = (title, items, dir) => `<div><b class="ft">${title}</b><nav class="foot-links" aria-label="${title}">${items.map(i => `<a href="${root}${dir}${i.slug}/">${i.short}</a>`).join('')}</nav></div>`;
  return `<footer>
  <div class="wrap">
    <div><b>${BRAND}</b> · בניית אתרים, דפי נחיתה ואפליקציות לעסקים</div>
    <div class="foot-cols">
      ${links('פתרונות לפי תחום', nav.industries, '')}
      ${links('מדריכים', nav.guides, 'guides/')}
      ${links('עבודות', nav.cases, 'work/')}
    </div>
    <div><a href="tel:${PHONE.tel}" data-call>${PHONE.display}</a>${EMAIL ? ` · <a href="mailto:${EMAIL}">${EMAIL}</a>` : ''}</div>
    <nav class="foot-links" aria-label="מידע">${nav.legal.map(i => `<a href="${root}${i.slug}/">${i.short}</a>`).join('')}</nav>
    <div class="install" id="install" hidden>
      <b>רוצה את POETEXA כאפליקציה בטלפון?</b>
      <button class="btn btn-line" type="button" id="install-go" hidden><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>התקן בלחיצה אחת</button>
      <p id="install-how">בכרום: תפריט <b>⋮</b> בפינה ← <b>הוספה למסך הבית</b></p>
    </div>
    <div>© <span id="y"></span> ${BRAND}. כל הזכויות שמורות.</div>
  </div>
</footer>

<div class="ai-panel" id="ai-panel" role="dialog" aria-modal="true" aria-labelledby="ai-title" hidden>
  <div class="ai-head">
    <div>
      <b id="ai-title">העוזר של POETEXA</b>
      <small>עונה על שאלות באתר · לא תמיד מושלם</small>
    </div>
    <button type="button" id="ai-close" aria-label="סגירה">✕</button>
  </div>
  <div class="ai-body" id="ai-body">
    <div class="ai-msg bot">שלום! אני העוזר של POETEXA. אפשר לשאול אותי על השירותים, על איך עובדים, או פשוט לספר מה אתה רוצה לשפר בעסק, ואנסה לכוון.</div>
    <div class="ai-chips">
      <button type="button">מה אתם בונים?</button>
      <button type="button">כמה זה עולה?</button>
      <button type="button">אני רודף אחרי עובדים</button>
      <button type="button">יש לי כבר אתר</button>
    </div>
  </div>
  <form class="ai-ask" id="ai-ask">
    <input aria-label="שאלה לעוזר" id="ai-input" placeholder="כתיבת שאלה…" autocomplete="off" maxlength="300">
    <button type="submit" aria-label="שליחה">↑</button>
  </form>
  <form class="ai-lead" id="ai-lead" hidden>
    <b>רוצה שנציג שירות יחזור אליך?</b>
    <div class="ai-lead-f">
      <input aria-label="שם" id="ai-name" placeholder="שם" autocomplete="name" required>
      <input aria-label="טלפון" id="ai-phone" placeholder="טלפון" inputmode="tel" autocomplete="tel" required>
    </div>
    <button class="btn btn-wa" type="submit"><svg><use href="#wa"/></svg>שליחה בוואטסאפ</button>
    <button type="button" class="ai-skip" id="ai-skip">לא עכשיו</button>
  </form>
</div>
<script src="${root}site.js" defer></script>
<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${root}sw.js').catch(()=>{}));</script>
</body>
</html>
`;
}

// The contact form — the same on every page, so a visitor can ask from wherever they landed.
// While FORM_KEY is empty there is no mail button, so the text must not promise one.
export function contact(lead = FORM_KEY
  ? 'ממלאים שלוש שורות, ובוחרים לשלוח בוואטסאפ או במייל.'
  : 'ממלאים שלוש שורות, וההודעה נפתחת מוכנה בוואטסאפ.') {
  return `<section class="contact" id="contact">
  <div class="wrap center">
    <div class="sec-head">
      <span class="eyebrow">מתחילים</span>
      <h2 class="h2">ספר לנו מה אתה צריך</h2>
      <p class="lead">${lead}</p>
    </div>
    <form id="lead">
      <label>שם<input name="name" autocomplete="name" required></label>
      <label>שם העסק<input name="biz" autocomplete="organization"></label>
      <label>מייל לחזרה<input type="email" name="email" autocomplete="email" inputmode="email" placeholder="כדי שנוכל להשיב לך"></label>
      <label>טלפון (לא חובה)<input type="tel" name="phone" autocomplete="tel" inputmode="tel"></label>
      <label>מה צריך לבנות?
        <select name="what">
          <option>אתר לעסק</option>
          <option>דף נחיתה</option>
          <option>אפליקציה</option>
          <option>מערכת ניהול (עובדים, משמרות, מסמכים, לקוחות)</option>
          <option>כלי או פתרון אחר</option>
          <option>עוד לא בטוח, רוצה להתייעץ</option>
        </select>
      </label>
      <label>במשפט אחד, מה הרעיון?<textarea name="msg" placeholder="לדוגמה: אני רוצה שהעובדים יקבלו את סידור העבודה בקישור"></textarea></label>
      <!-- מלכודת ספאם: שדה שרק בוט ממלא. הוא מוסתר מהעין ומקוראי מסך. -->
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
      <button class="btn btn-wa" type="submit"><svg><use href="#wa"/></svg>פתח וואטסאפ לתיאום שיחת ייעוץ</button>${FORM_KEY ? `
      <button class="btn btn-line" type="button" id="send-mail"><svg class="i" aria-hidden="true"><use href="#i-mail"/></svg>או שליחה במייל</button>` : ''}
      <p class="form-msg" id="form-msg" role="status" aria-live="polite"></p>
      <p class="note">ההודעה תיפתח מוכנה בוואטסאפ, ויש ללחוץ שליחה. בלי התחייבות.</p>
      ${FORM_KEY ? '<p class="note">שליחה במייל דורשת כתובת מייל, כדי שנוכל לחזור אליך.</p>' : ''}
    </form>
  </div>
</section>`;
}

export const business = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': BASE + '#business',
  name: FULL_NAME,
  url: BASE,
  telephone: PHONE.intl,
  slogan: 'הטכנולוגיה שעסקים גדולים משלמים עליה הון, במחיר של עסק קטן.',
  description: 'בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים קטנים, במחיר שמתאים להם, עם שילוב AI לפי בקשה: ניהול עובדים, משמרות, משימות, מסמכים, לקוחות, הדרכת עובדים וכלים לעבודה בשטח.',
  areaServed: { '@type': 'Country', name: 'ישראל' },
  knowsAbout: ['פתרונות דיגיטליים לעסקים קטנים', 'בינה מלאכותית (AI)', 'בניית אתרים', 'דפי נחיתה', 'פיתוח אפליקציות', 'מערכות ניהול לעסקים', 'ניהול עובדים', 'ניהול מסמכים']
};

// The demo film on the home page. Google can show it as a video result, which is
// a second way into the site besides the text.
export const videoSchema = {
  '@context': 'https://schema.org', '@type': 'VideoObject',
  name: 'מערכת אמיתית בחצי דקה: פקודת עבודה, הוכחת ביצוע וייצוא לאקסל',
  description: 'המנהל כותב פקודת עבודה מהטלפון, העובד מקבל קישור בוואטסאפ בלי להתקין אפליקציה, מצלם הוכחה עם שעה ומיקום וחותם, והמנהל מקבל הכול מסודר ומייצא לאקסל.',
  thumbnailUrl: [BASE + 'media/workit-poster.jpg'],
  contentUrl: BASE + 'media/workit.mp4',
  // Google rejects a bare date here: it wants a full ISO 8601 stamp with a time zone.
  uploadDate: '2026-10-11T09:00:00+03:00',
  duration: 'PT28S',
  isFamilyFriendly: true,
  publisher: { '@id': BASE + '#business' }
};

export const faqSchema = pairs => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
});
