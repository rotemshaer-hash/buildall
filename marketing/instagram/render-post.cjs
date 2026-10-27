// Renders post-template.html into a 1080x1080 PNG for an Instagram post.
// Run: node marketing/instagram/render-post.cjs out.png '{"KICKER":"חדש עכשיו", ...}'
// Needs Playwright (pre-installed in Claude's sandbox; `npm i playwright` elsewhere).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [, , outPath, fieldsJson] = process.argv;
if (!outPath || !fieldsJson) {
  console.error('usage: node render-post.cjs <out.png> <fields-json>');
  process.exit(1);
}
const fields = JSON.parse(fieldsJson);
let html = fs.readFileSync(path.join(__dirname, 'post-template.html'), 'utf8');
for (const [k, v] of Object.entries(fields)) html = html.replaceAll(`{{${k}}}`, v);

// A field missing from fieldsJson (or misspelled) left its {{PLACEHOLDER}}
// literally visible in the rendered PNG instead of failing the run - this
// catches that before anything is rendered, not after someone posts it.
const leftover = html.match(/\{\{[A-Z0-9_]+\}\}/g);
if (leftover) {
  console.error('missing field(s), still in template:', [...new Set(leftover)].join(', '));
  process.exit(1);
}

const tmp = path.join(__dirname, '.render-tmp.html');
fs.writeFileSync(tmp, html);

(async () => {
  const browser = await chromium.launch();
  // A failed goto/screenshot used to leave the browser open and the temp
  // HTML file on disk; both are cleaned up on any outcome now.
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    console.log('wrote', outPath);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { force: true });
  }
})();
