// Records a real screen-capture Reel of the live site: Playwright drives a
// real browser against a running local server, scrolls to real sections,
// and the page itself renders Hebrew caption overlays (so there's no
// ffmpeg Hebrew-text-rendering to fight with). Needs Playwright (pre-installed
// in Claude's sandbox) and a local server already serving dist/ (e.g.
// `python3 -m http.server 8801 --directory dist`).
//
// Edit the STEPS array below for a new Reel, then run:
//   node marketing/instagram/record-site-reel.cjs <base-url> <out.mp4>
// e.g. node marketing/instagram/record-site-reel.cjs http://localhost:8801/index.html /tmp/reel.mp4
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const [, , baseUrl, outPath] = process.argv;
if (!baseUrl || !outPath) {
  console.error('usage: node record-site-reel.cjs <url> <out.mp4>');
  process.exit(1);
}

// Each step: { caption, selector } — selector null means stay put (used for
// the opening hold and the closing CTA). Edit this per Reel.
const STEPS = [
  { caption: 'עלה אתר חדש ל-POETEXA', selector: null, hold: 3000 },
  { caption: 'AI, אוטומציות ניהול ודפי נחיתה', selector: '.poetexa-bento-wrap', hold: 3500 },
  { caption: 'לכל תחום יש פתרון', selector: '#industries', hold: 3500 },
  { caption: 'poetexa.pages.dev', selector: null, hold: 2500 },
];

(async () => {
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-raw-'));
  const browser = await chromium.launch();
  // A failed recording or ffmpeg step used to leave the browser open and the
  // raw-video temp dir on disk — with no cleanup on the failure path, a few
  // failed runs would pile up full-resolution video recordings in /tmp.
  try {
    const context = await browser.newContext({
      viewport: { width: 540, height: 960 }, // 9:16, triggers the site's mobile CSS
      recordVideo: { dir: rawDir, size: { width: 540, height: 960 } },
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400); // let the first paint settle before recording "counts"

    await page.evaluate(() => {
      const d = document.createElement('div');
      d.id = 'reel-caption';
      // Instagram's own UI (caption, username, like/comment/share icons) sits
      // in the bottom ~20% of a Reel's frame — recording at 540x960, that's
      // below y=768, so the caption needs to clear that line with real margin.
      d.style.cssText = 'position:fixed;left:0;right:0;bottom:220px;z-index:99999;display:flex;justify-content:center;pointer-events:none';
      d.innerHTML = '<span style="background:#15274dee;color:#fff;font:800 26px Rubik,Arial,sans-serif;padding:16px 28px;border-radius:999px;box-shadow:0 10px 30px -10px #000000aa"></span>';
      document.body.appendChild(d);
    });

    for (const step of STEPS) {
      await page.evaluate((t) => { document.querySelector('#reel-caption span').textContent = t; }, step.caption);
      if (step.selector) {
        const y = await page.$eval(step.selector, el => el.getBoundingClientRect().top + window.scrollY - 40);
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
      }
      await page.waitForTimeout(step.hold);
    }

    await page.close();
    await context.close();

    const raw = fs.readdirSync(rawDir).find(f => f.endsWith('.webm'));
    const rawPath = path.join(rawDir, raw);
    // Paths go through execFileSync's own argument array, not a shell string,
    // so a path containing a quote or a shell metacharacter can never be
    // interpreted as part of the command.
    execFileSync('ffmpeg', ['-y', '-i', rawPath, '-vf', 'scale=1080:1920:flags=lanczos',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '30', outPath], { stdio: 'inherit' });
    console.log('wrote', outPath);
  } finally {
    await browser.close();
    fs.rmSync(rawDir, { recursive: true, force: true });
  }
})();
