import { readFile } from 'node:fs/promises';
const days = JSON.parse(await readFile('scripts/social-kit.json', 'utf8'));
const files = days.flatMap(d => [...d.post.files, d.reel, ...d.stories].map(f => ({ ...f, date: d.date })));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
for (let attempt = 0; attempt < 6; attempt++) {
  try {
    let next = 0;
    async function check() {
      while (next < files.length) {
        const f = files[next++];
        const r = await fetch('https://poetexa.pages.dev/downloads/' + f.date + '/' + f.name + '?check=' + process.env.GITHUB_SHA, { signal: AbortSignal.timeout(20000) });
        const b = Buffer.from(await r.arrayBuffer()), video = f.name.endsWith('.mp4');
        if (!r.ok || !r.headers.get('content-disposition')?.startsWith('attachment;') || b.length < 1000 || (video ? b.toString('ascii',4,8) !== 'ftyp' : b[0] !== 255 || b[1] !== 216)) throw new Error('Live download failed: ' + f.date + '/' + f.name + ', HTTP ' + r.status);
        console.log('PASS live ' + f.date + '/' + f.name);
      }
    }
    await Promise.all(Array.from({ length: 4 }, check));
    const hub = await fetch('https://poetexa.pages.dev/manual-week/?check=' + process.env.GITHUB_SHA);
    const html = await hub.text();
    if (!hub.ok || !html.includes('הסדר שלך להעלאה ידנית') || !html.includes('2026-11-04')) throw new Error('Manual hub missing');
    process.exit(0);
  } catch (error) {
    if (attempt === 5) throw error;
    console.log(error.message + '; waiting for deployment propagation');
    await delay(5000);
  }
}
