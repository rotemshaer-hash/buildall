// Renders og.jpg, the card WhatsApp and other apps show when the site's link is shared.
// Run after changing the brand: node tools/og.mjs  (needs Playwright)
import { chromium } from 'playwright';
import { sprite } from '../src/layout.mjs';

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@600&family=Heebo:wght@800&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
html{overflow:hidden;background:#0F1A1F}
body{width:1200px;height:630px;overflow:hidden;font-family:Heebo,sans-serif;color:#fff;
  background:linear-gradient(150deg,#0F1A1F 0%,#0e7a72 45%,#8b2fc9 100%);position:relative}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5}
.b1{width:480px;height:480px;background:#14b8a6;top:-160px;right:-80px}
.b2{width:420px;height:420px;background:#a855f7;bottom:-180px;left:-60px}
.grid{position:absolute;inset:0;opacity:.14;background-image:linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px);background-size:48px 48px}
.in{position:relative;padding:70px 80px;height:100%;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:22px}
.brand svg{width:110px;height:110px}
.brand b{font-size:84px;line-height:1}
.brand b em{font-style:normal;background:linear-gradient(90deg,#5ee2d4,#d9a6ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.brand small{display:block;font:600 22px Assistant,sans-serif;letter-spacing:6px;opacity:.75;direction:ltr;text-align:right;margin-top:6px}
h1{font-size:56px;line-height:1.2;margin-top:56px;max-width:900px}
.pills{display:flex;gap:14px;margin-top:auto}
.pills span{font:600 26px Assistant,sans-serif;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:10px 26px}
</style></head><body>
${sprite}
<i class="blob b1"></i><i class="blob b2"></i><div class="grid"></div>
<div class="in">
  <div class="brand">
    <svg viewBox="0 0 64 64"><g fill="url(#lg)">
      <rect x="6" y="36" width="13" height="22" rx="3.5"/><rect x="25" y="23" width="13" height="35" rx="3.5"/>
      <path d="M44 18.5 50.5 7 57 18.5V54.5a3.5 3.5 0 0 1-3.5 3.5h-6A3.5 3.5 0 0 1 44 54.5z"/></g></svg>
    <div><b>בונים <em>הכל</em></b><small>BUILD ALL</small></div>
  </div>
  <h1>בניית אתרים, דפי נחיתה, אפליקציות ומערכות ניהול לעסקים</h1>
  <div class="pills"><span>מכלי קטן ועד מערכת מלאה</span><span>שיחת ייעוץ חינם</span></div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: new URL('../og.jpg', import.meta.url).pathname, type: 'jpeg', quality: 86 });
await b.close();
console.log('og.jpg written');
