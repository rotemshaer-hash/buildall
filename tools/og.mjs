// Renders og.jpg, the card WhatsApp and other apps show when the site's link is shared.
// Run after changing the brand: node tools/og.mjs  (needs Playwright)
import { chromium } from 'playwright';
import { sprite, LOGO_SHAPES } from '../src/layout.mjs';

const html = `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#f4f6ff;color:#15274d;font-family:Arial,sans-serif;display:flex;align-items:center;padding:60px;gap:30px}.copy{width:480px}.brand{font-size:64px;font-weight:800;direction:ltr}.sub{font-size:19px;letter-spacing:2px;margin:20px 0 50px;direction:ltr}h1{font-size:48px;line-height:1.6}h1 span{color:#6642c8}p{font-size:24px;margin-top:35px}img{width:580px}</style><div class="copy"><div class="brand">POETEXA</div><div class="sub">DIGITAL DESIGN STUDIO</div><h1>העסק שלך.<br><span>העתיד שלך.</span></h1><p>אתרים · אפליקציות · פתרונות AI</p></div><img src="data:image/svg+xml;base64,${Buffer.from((await import('node:fs')).readFileSync(new URL('../assets/poetexa-devices.svg',import.meta.url))).toString('base64')}"></html>`;

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: new URL('../og.jpg', import.meta.url).pathname, type: 'jpeg', quality: 86 });
await b.close();
console.log('og.jpg written');
