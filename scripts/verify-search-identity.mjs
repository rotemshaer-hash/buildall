// Post-deploy checks: public availability is verified, not Google indexing.
import assert from 'node:assert/strict';
const BASE = 'https://poetexa.pages.dev/';
const paths = ['', 'automations/', 'ai/', 'landing-pages/', 'social-content/', 'guides/excel-or-system/', 'guides/first-automation/'];
async function get(path) {
  const response = await fetch(BASE + path, { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } });
  assert.equal(response.status, 200, `HTTP status for ${path || '/'}`);
  return response.text();
}
async function verify() {
  const sitemap = await get('sitemap.xml');
  const robots = await get('robots.txt');
  assert(robots.includes(`Sitemap: ${BASE}sitemap.xml`));
  for (const path of paths) {
    const html = await get(path);
    assert(html.includes(`<link rel="canonical" href="${BASE}${path}">`), `canonical: ${path}`);
    assert(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `indexable: ${path}`);
    assert(sitemap.includes(`<loc>${BASE}${path}</loc>`), `sitemap: ${path}`);
    if (!path) {
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
      const sites = schemas.filter(s => s['@type'] === 'WebSite');
      assert.equal(sites.length, 1); assert.equal(sites[0].name, 'POETEXA'); assert.equal(sites[0].url, BASE);
      assert(html.includes('property="og:site_name" content="POETEXA"'));
      assert(html.includes('name="google-site-verification"'));
    } else if (!path.startsWith('guides/')) {
      assert(html.includes('id="detail-0"'), `updated service content: ${path}`);
    }
    console.log(`Verified public SEO page: ${BASE}${path}`);
  }
}
// The deployment may reach different CDN nodes a few seconds apart.
for (let attempt = 1; ; attempt++) {
  try { await verify(); break; }
  catch (error) { if (attempt === 3) throw error; console.log(`Verification pending (${attempt}/3): ${error.message}`); await new Promise(resolve => setTimeout(resolve, 3000)); }
}
console.log('POETEXA site name, seven canonical pages, sitemap and crawl directives verified. Google indexing is not measured by this check.');

// Also verify the reusable free-check campaign's direct phone downloads.
for (const name of ['reel.mp4', 'story.jpg', 'cover.jpg']) {
  const response = await fetch(BASE + 'downloads/free-check/' + name, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `free-check download: ${name}`);
  assert(response.headers.get('content-disposition')?.includes('attachment'), `attachment: ${name}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length > 1000, `nonempty: ${name}`);
  assert(name.endsWith('.mp4') ? bytes.toString('ascii', 4, 8) === 'ftyp' : bytes[0] === 255 && bytes[1] === 216, `media signature: ${name}`);
  console.log(`Verified free-check download: ${name} (${bytes.length} bytes)`);
}
