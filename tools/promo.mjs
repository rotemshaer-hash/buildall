// Renders tools/promo.html into a ten second vertical film.
// Run: node tools/promo.mjs   (needs Playwright + a full ffmpeg)
//
// It does NOT use Playwright's video recorder: that starts rolling before the page
// is ready, so the film came out shifted. Instead every animation is paused and
// stepped to an exact time, one screenshot per frame, which is identical every run.
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = 1080, H = 1920, FPS = 30, SECONDS = 10;
const FRAMES = FPS * SECONDS;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const out = new URL('../promo/', import.meta.url).pathname;
const tmp = '/tmp/promo-frames';

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(out, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto(new URL('promo.html', import.meta.url).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));

for (let i = 0; i < FRAMES; i++) {
  const ms = (i / FPS) * 1000;
  // Setting the time is not enough: the browser must paint it before we capture,
  // or large elements come out missing. Two frames guarantees a composited paint.
  await p.evaluate(t => {
    document.getAnimations().forEach(a => { a.currentTime = t; });
    return new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
  }, ms);
  await p.screenshot({ path: `${tmp}/f${String(i).padStart(4, '0')}.png` });
}
await b.close();

execFileSync(FFMPEG, [
  '-y', '-framerate', String(FPS), '-i', `${tmp}/f%04d.png`,
  '-vf', 'format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart',
  `${out}buildall-10s.mp4`
], { stdio: ['ignore', 'ignore', 'inherit'] });

rmSync(tmp, { recursive: true, force: true });
console.log('promo/buildall-10s.mp4');
