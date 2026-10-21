// Checks dist/ itself, not what the build meant to produce. Run after `node scripts/dist.mjs`.
// It caught a whole section deleted by accident, which every other check had missed.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = 'dist';
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html') && !p.includes('/demo/') && !p.includes('googlef0')) pages.push(p);
  }
})(ROOT);

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('  ✗ ' + msg); } };

console.log(`דפים שנבדקו: ${pages.length}\n`);

// ---- 1. every link points at something that exists ----
console.log('קישורים וקבצים:');
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const rel = page.replace(ROOT, '') || '/index.html';
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const h of hrefs) {
    if (/^(https?:|mailto:|tel:|data:|#?$)/.test(h)) continue;
    // A query string is part of the link, not of the file name: ?utm_source=ig names
    // the campaign, and resolving it against the disk looks for a file nobody wrote.
    const [path, hash] = h.split('#');
    if (!path || path === './') {            // same page anchor
      if (hash && !ids.has(hash)) ok(false, `${rel}: עוגן חסר #${hash}`);
      continue;
    }
    const file = path.split('?')[0];
    if (!file) continue;
    const target = file.startsWith('/')
      ? join(ROOT, file)
      : resolve(dirname(page), file);
    const candidates = [target, join(target, 'index.html')];
    const found = candidates.find(c => existsSync(c));
    ok(!!found, `${rel}: קובץ חסר ${h}`);
    if (found && hash) {
      const t = readFileSync(found.endsWith('.html') ? found : join(found, 'index.html'), 'utf8');
      ok(t.includes(`id="${hash}"`), `${rel}: עוגן חסר ${h}`);
    }
  }
}

// ---- 2. the things we built in the last days ----
const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
console.log('\nמה שנבנה בימים האחרונים:');
ok(home.includes('id="film"'), 'מקטע הסרטון קיים בדף הבית');
ok(home.includes('media/workit.mp4'), 'קובץ הסרטון מקושר');
ok(home.includes('media/workit-poster.jpg'), 'תמונת הפתיחה של הסרטון מקושרת');
ok(existsSync(join(ROOT, 'media/workit.mp4')), 'קובץ הסרטון נמצא בתיקייה שעולה לאוויר');
ok(home.includes('VideoObject'), 'תיאור הווידאו לגוגל');
// The headline is checked by what it names, not by one exact string: pinning the
// sentence meant every rewording failed the build for no reason, while a category
// quietly dropped from it would have passed.
const h1 = (home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ['',''])[1].replace(/&nbsp;/g, ' ');
// In the new studio layout the H1 is a brand promise; the service categories
// are required in the visible lead copy immediately below it.
const heroSection = home.slice(home.indexOf('<!-- HERO: POETEXA'), home.indexOf('<div class="poetexa-quick'));
ok(h1.includes('העסק שלך'), 'הכותרת הראשית מציגה את הבטחת המותג');
for (const word of ['מערכות ניהול', 'אפליקציות', 'אוטומציות', 'אתרים'])
  ok(heroSection.includes(word), `הפתיח מזכיר "${word}"`);
ok(existsSync(join(ROOT, '404.html')), 'דף 404 קיים');
ok(readFileSync(join(ROOT,'404.html'),'utf8').includes('הדף הזה לא קיים'), 'דף 404 עם התוכן שלנו');
for (const g of ['website-or-app','shift-scheduling','what-decides-price','app-without-store'])
  ok(existsSync(join(ROOT, `guides/${g}/index.html`)), `מדריך ${g}`);
for (const c of ['field-photos','employee-quiz','work-it'])
  ok(readFileSync(join(ROOT, `work/${c}/index.html`),'utf8').includes('מה זה שינה'), `"מה זה שינה" בדף ${c}`);
ok(existsSync(join(ROOT, 'googlef057313d56875ab6.html')), 'קובץ האימות של גוגל');

console.log('\nבכל הדפים:');
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const rel = page.replace(ROOT, '');
  ok(html.includes('google-site-verification'), `${rel}: תג האימות של גוגל`);
  ok(html.includes('id="install"'), `${rel}: שורת ההתקנה כאפליקציה`);
  ok(html.includes('btn-ai'), `${rel}: כפתור ה-AI בראש הדף`);
  ok(!html.includes('class="fab"'), `${rel}: אין כפתור וואטסאפ צף`);
  ok(!html.includes('ai-fab'), `${rel}: אין כפתור AI צף`);
}

console.log('\nניסוחים שהוסכם להוריד:');
const banned = ['שתי מערכות שבנינו', 'עסק של איש אחד', 'חלק קטן ממה שאנחנו בונים', 'וזו רק דוגמה',
                'GitHub Pages', 'rotemshaer-hash.github.io',
                'רותם · בונים הכל', 'card hl', 'שיחת ייעוץ חינם</a></li>'];
// The owner's first name tells a visitor nothing and shrinks the business to one person.
// It had crept back into the assistant, the accessibility page and the panel's own copy,
// so the whole built site is checked rather than the places we happen to remember.
banned.push('רותם');
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const b of banned) ok(!html.includes(b), `${page.replace(ROOT,'')}: עדיין מופיע "${b}"`);
}

console.log('\nמגירות:');
// Every drawer ships closed: one left open makes the list under it look like the page
// rather than like one choice among several, and the ones below it get missed.
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  ok(!/<details[^>]*\sopen[\s>]/.test(html), `${page.replace(ROOT, '')}: יש מגירה שנפתחת מעצמה`);
}

console.log('\nסרגל הניווט:');
// The strip is a map of the scroll, so its order is checked against the page itself
// rather than against a list written here — a hard-coded position only breaks the day
// a section moves, which is exactly the day the check should have helped.
const chips = [...home.matchAll(/<li><a href="[^"]*#([a-z-]+)">([\s\S]*?)<\/a><\/li>/g)].map(m => ({ id: m[1], name: m[2].replace(/<[^>]+>/g, '').trim() }));
ok(chips.length === 9, 'תפריט מלא עם תשעה יעדים');
ok(!home.includes('class="marquee"'), 'פס השירותים החתוך הוסר');
ok(!home.includes('ניווט באתר'), 'אין שורת ניווט נפרדת וכפולה');
ok(home.includes('class="film-play"'), 'כפתור ניגון מפורש לסרטון');
const at = id => home.indexOf(`id="${id}"`, home.indexOf('</nav>'));
for (const c of chips) ok(at(c.id) > -1, `לסקשן "${c.name}" יש עוגן בעמוד (#${c.id})`);
const strayed = chips.find((c, i) => i > 0 && at(c.id) < at(chips[i - 1].id));
ok(!strayed, strayed && `"${strayed.name}" בסרגל אחרי "${chips[chips.indexOf(strayed) - 1].name}", אבל בעמוד הוא לפניו`);
console.log('  ' + chips.map(c => c.name).join(' · '));

console.log(`\n${fails === 0 ? '✓ הכול תקין' : '✗ ' + fails + ' כשלים'} — ${checks} בדיקות`);
// A check that prints a failure and exits 0 is a check nobody will ever notice.
if (fails) process.exit(1);
