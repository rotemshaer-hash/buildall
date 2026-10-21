// Collects only what the public site needs into dist/, leaving the sources,
// the plan and the build tools behind. Both the deploy workflow and the hand
// made ZIP use this, so what goes live is always the same set of files.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FILES = [
  'index.html', '404.html', 'style.css', 'site.js', 'sw.js', 'manifest.webmanifest',
  '_worker.js', 'kb.json',
  'assets', 'og.jpg', 'robots.txt', 'sitemap.xml', 'icons', 'demo',
  'googlef057313d56875ab6.html',   // Search Console ownership. Google says to keep it for good.
  'accessibility', 'privacy', 'guides', 'work', 'media',
  'restaurants', 'beauty', 'retail', 'clinics', 'contractors', 'fitness'
];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
let missing = [];
for (const f of FILES) {
  if (!existsSync(f)) { missing.push(f); continue; }
  cpSync(f, `dist/${f}`, { recursive: true });
}
if (missing.length) {
  console.error('missing, run `node build.mjs` first:', missing.join(', '));
  process.exit(1);
}
console.log('dist ready:', FILES.length, 'entries');

// The audit runs here, so nothing can be zipped without it passing.
const { status } = spawnSync(process.execPath, ['scripts/audit.mjs'], { stdio: 'inherit' });
if (status !== 0) {
  console.error('\nהביקורת נכשלה — dist/ לא מוכן לפריסה.');
  process.exit(status || 1);
}
