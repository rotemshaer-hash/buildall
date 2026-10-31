// Records a real screen-capture Reel of a live interactive demo (not just
// scrolling, like record-site-reel.cjs — this one actually drives the demo:
// clicks its trigger button and lets the real animation play out on camera).
// Needs Playwright (pre-installed) and a local server already serving dist/.
//
// Usage: node record-demo-reel.cjs <demo.json> <out.mp4>
// <demo.json>: { "url": "...", "steps": [ {"caption": "...", "click": "#sel", "hold": 2000}, ... ] }
// A step with no "click" just updates the caption and holds.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const [, , configPath, outPath] = process.argv;
if (!configPath || !outPath) {
  console.error('usage: node record-demo-reel.cjs <demo.json> <out.mp4>');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

(async () => {
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-reel-raw-'));
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 540, height: 960 },
      recordVideo: { dir: rawDir, size: { width: 540, height: 960 } },
    });
    const t0 = Date.now();
    const page = await context.newPage();
    await page.goto(config.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // Chromium's recordVideo starts capturing at context creation, before the
    // page has navigated/painted — so every raw clip opens with a blank/white
    // lead-in. Left untrimmed, that shows up as a white flash wherever the
    // clip lands after concatenation, and throws off every timestamp after it
    // (captions appear to be "late" or "missing" at a given frame index/time).
    // Measuring the real elapsed time here and trimming it off with ffmpeg
    // -ss below keeps the exported clip's timeline matching the script.
    const trimSec = (Date.now() - t0) / 1000;

    await page.evaluate(() => {
      const d = document.createElement('div');
      d.id = 'reel-caption';
      d.style.cssText = 'position:fixed;left:0;right:0;bottom:220px;z-index:99999;display:flex;justify-content:center;pointer-events:none';
      d.innerHTML = '<span style="background:#15274dee;color:#fff;font:800 24px Rubik,Arial,sans-serif;padding:14px 24px;border-radius:999px;box-shadow:0 10px 30px -10px #000000aa;text-align:center;max-width:460px"></span>';
      document.body.appendChild(d);
    });
    const setCaption = (text) => page.evaluate((t) => { document.querySelector('#reel-caption span').textContent = t; }, text);

    for (const step of config.steps) {
      if (step.caption) await setCaption(step.caption);
      if (step.scrollTo) {
        const y = await page.$eval(step.scrollTo, el => el.getBoundingClientRect().top + window.scrollY - 60).catch(() => null);
        if (y != null) await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
      }
      if (step.click) await page.click(step.click).catch(() => {});
      await page.waitForTimeout(step.hold || 1500);
    }

    await page.close();
    await context.close();

    const raw = fs.readdirSync(rawDir).find(f => f.endsWith('.webm'));
    const rawPath = path.join(rawDir, raw);
    execFileSync('ffmpeg', ['-y', '-ss', trimSec.toFixed(3), '-i', rawPath, '-vf', 'scale=1080:1920:flags=lanczos',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '30', outPath], { stdio: 'inherit' });
    console.log('wrote', outPath, 'trimmed', trimSec.toFixed(3), 's lead-in');
  } finally {
    await browser.close();
    fs.rmSync(rawDir, { recursive: true, force: true });
  }
})();
