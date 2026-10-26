const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Usage: node batch-industry-reels.cjs <base-url> <out-dir>
// e.g. node batch-industry-reels.cjs http://localhost:8801/ /tmp/industry-reels
const [, , baseArg, outArg] = process.argv;
const BASE = baseArg || 'http://localhost:8801/';
const OUT_DIR = outArg || '/tmp/industry-reels';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Each gets its own accent color (visual "style") and its own real captions,
// pulled from that industry's actual page content.
const CATS = [
  { slug: 'restaurants', color: '#c0392b', c1: 'מסעדות ובתי קפה', c2: 'סידור משמרות שלא נשכח', c3: 'תפריט שמתעדכן מהטלפון', c4: 'poetexa.pages.dev/restaurants' },
  { slug: 'beauty', color: '#9b59b6', c1: 'קוסמטיקה וטיפוח', c2: 'תורים אונליין, בלי לענות באמצע טיפול', c3: 'תזכורות שמונעות "שכחתי"', c4: 'poetexa.pages.dev/beauty' },
  { slug: 'retail', color: '#16a085', c1: 'חנויות ורשתות', c2: 'כל סניף, תמונה ושעה, במסך אחד', c3: 'מלאי שמתריע לפני שנגמר', c4: 'poetexa.pages.dev/retail' },
  { slug: 'clinics', color: '#2980b9', c1: 'קליניקות ומטפלים', c2: 'מטופל חדש? טופס קליטה כבר ממלא לבד', c3: 'תזכורות שמורידות אי-הגעות', c4: 'poetexa.pages.dev/clinics' },
  { slug: 'contractors', color: '#d35400', c1: 'קבלנים ובעלי מקצוע', c2: 'הצעת מחיר מהטלפון, תוך דקה', c3: 'תיעוד עבודה בשטח, לא בזיכרון', c4: 'poetexa.pages.dev/contractors' },
  { slug: 'fitness', color: '#27ae60', c1: 'סטודיו וחדרי כושר', c2: 'הרשמה לשיעור בלחיצה אחת', c3: 'מי צריך לחדש מנוי? המערכת יודעת', c4: 'poetexa.pages.dev/fitness' },
  { slug: 'lawyers', color: '#1a2744', c1: 'עורכי דין', c2: 'פגישת ייעוץ נקבעת לבד, בלי הודעות הלוך ושוב', c3: 'כל תיק ומסמך, במקום אחד מאובטח', c4: 'poetexa.pages.dev/lawyers' },
  { slug: 'accountants', color: '#34495e', c1: 'רואי חשבון', c2: 'מסמכים מלקוחות, בקישור אחד', c3: 'תזכורת אוטומטית לפני כל מועד דיווח', c4: 'poetexa.pages.dev/accountants' },
  { slug: 'realestate', color: '#b8860b', c1: 'נדל"ן', c2: 'כל נכס, תמונות ומחיר, מעודכן מהטלפון', c3: 'ליד ממודעה? נכנס לרשימה, לא נשכח', c4: 'poetexa.pages.dev/realestate' },
  { slug: 'garages', color: '#555555', c1: 'מוסכים', c2: 'תור אונליין, בלי לענות לטלפון מתחת לרכב', c3: 'היסטוריית הרכב מחכה כשהלקוח מגיע', c4: 'poetexa.pages.dev/garages' },
];

async function recordOne(browser, cat, idx) {
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-raw-'));
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    recordVideo: { dir: rawDir, size: { width: 540, height: 960 } },
  });
  const page = await context.newPage();
  await page.goto(BASE + cat.slug + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.evaluate((color) => {
    const d = document.createElement('div');
    d.id = 'reel-caption';
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:64px;z-index:99999;display:flex;justify-content:center;pointer-events:none';
    d.innerHTML = `<span style="background:${color}ee;color:#fff;font:800 25px Rubik,Arial,sans-serif;padding:16px 26px;border-radius:999px;box-shadow:0 10px 30px -10px #000000aa;text-align:center;max-width:460px"></span>`;
    document.body.appendChild(d);
  }, cat.color);
  const setCaption = (text) => page.evaluate((t) => { document.querySelector('#reel-caption span').textContent = t; }, text);

  await setCaption(cat.c1);
  await page.waitForTimeout(2800);

  const whyY = await page.$eval('.why-sec', el => el.getBoundingClientRect().top + window.scrollY - 30).catch(() => null);
  if (whyY != null) {
    await setCaption(cat.c2);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), whyY);
    await page.waitForTimeout(3200);
  }

  const solY = await page.$eval('#solutions', el => el.getBoundingClientRect().top + window.scrollY - 30).catch(() => null);
  if (solY != null) {
    await setCaption(cat.c3);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), solY);
    await page.waitForTimeout(3200);
  }

  await setCaption(cat.c4);
  await page.waitForTimeout(2200);

  await page.close();
  await context.close();

  const raw = fs.readdirSync(rawDir).find(f => f.endsWith('.webm'));
  const rawPath = path.join(rawDir, raw);
  const silentMp4 = path.join(OUT_DIR, `${cat.slug}-silent.mp4`);
  execSync(`ffmpeg -y -i "${rawPath}" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 20 -r 30 "${silentMp4}"`, { stdio: 'ignore' });
  fs.rmSync(rawDir, { recursive: true, force: true });

  // per-category audio bed, slightly different base pitch for variety
  const base = 98 + idx * 6;
  const finalMp4 = path.join(OUT_DIR, `${cat.slug}.mp4`);
  execSync(`bash ${path.join(__dirname, 'add-ambient-bed.sh')} "${silentMp4}" "${finalMp4}" ${base}`, { stdio: 'ignore' });
  console.log('done:', cat.slug);
  return finalMp4;
}

(async () => {
  const browser = await chromium.launch();
  for (let i = 0; i < CATS.length; i++) {
    await recordOne(browser, CATS[i], i);
  }
  await browser.close();
})();
