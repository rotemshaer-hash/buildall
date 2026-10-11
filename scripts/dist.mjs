// Collects only what the public site needs into dist/, leaving the sources,
// the plan and the build tools behind. Both the deploy workflow and the hand
// made ZIP use this, so what goes live is always the same set of files.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';

const FILES = [
  'index.html', 'style.css', 'site.js', 'sw.js', 'manifest.webmanifest',
  '_worker.js', 'kb.json',
  'og.jpg', 'robots.txt', 'sitemap.xml', 'icons', 'demo',
  'accessibility', 'privacy', 'guides', 'work',
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
