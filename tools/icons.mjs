// Renders the app icons the phone uses when the site is installed to the home screen.
// Run: node tools/icons.mjs   (needs Playwright)
import { chromium } from 'playwright';

import { logoPlain } from '../src/layout.mjs';

// maskable: Android crops icons to a circle, so the mark sits smaller inside a full-bleed square.
const svg = (round, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2fd3c3"/><stop offset="1" stop-color="#c58bff"/></linearGradient></defs>
  <rect width="64" height="64" rx="${round}" fill="#0F1A1F"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${logoPlain()}</g>
</svg>`;

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const out = new URL('../icons/', import.meta.url).pathname;
for (const [name, size, round, scale] of [
  ['icon-192.png', 192, 14, 1], ['icon-512.png', 512, 14, 1], ['icon-maskable.png', 512, 0, 0.72]
]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<style>html,body{margin:0;background:#0F1A1F}svg{display:block;width:${size}px;height:${size}px}</style>${svg(round, scale)}`);
  await p.screenshot({ path: out + name, omitBackground: false });
  await p.close();
  console.log(name);
}
await b.close();
