// Renders tools/promo3.html into a twenty second vertical film with the two characters.
// Run: node tools/promo3.mjs   (needs Playwright + a full ffmpeg)
//
// The scene is driven by window.seek(t) inside the page, so each frame is an exact
// point in time rather than whatever the browser happened to be showing. The idle
// bob is a CSS animation, so those are paused and stepped to the same time.
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = 1080, H = 1920, FPS = 30, SECONDS = 28.3;
const FRAMES = Math.round(FPS * SECONDS);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const out = new URL('../promo/', import.meta.url).pathname;
const tmp = '/tmp/promo3-frames';

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(out, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto(new URL('promo3.html', import.meta.url).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));

for (let i = 0; i < FRAMES; i++) {
  const sec = i / FPS;
  // Two frames guarantees the browser composited the new time before the capture.
  await p.evaluate(s => {
    document.getAnimations().forEach(a => { a.currentTime = s * 1000; });
    window.seek(s);
    return new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
  }, sec);
  await p.screenshot({ path: `${tmp}/f${String(i).padStart(4, '0')}.png` });
}
await b.close();

execFileSync(FFMPEG, [
  '-y', '-framerate', String(FPS), '-i', `${tmp}/f%04d.png`,
  '-vf', 'format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart',
  `${out}workit-28s.mp4`
], { stdio: ['ignore', 'ignore', 'inherit'] });

rmSync(tmp, { recursive: true, force: true });
console.log('promo/workit-28s.mp4');
