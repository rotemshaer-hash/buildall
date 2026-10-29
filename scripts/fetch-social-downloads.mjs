import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { buildManualPage } from './manual-kit-page.mjs';
const days = JSON.parse(await readFile('scripts/social-kit.json', 'utf8'));
const files = days.flatMap(d => [...d.post.files, d.reel, ...d.stories].map(f => ({ ...f, date: d.date })));
let next = 0;
async function download() {
  while (next < files.length) {
    const f = files[next++], u = new URL(f.source);
    if (u.protocol !== 'https:' || u.hostname !== 'static.metricool.com') throw new Error('Unexpected source host');
    const response = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(f.date + '/' + f.name + ': source HTTP ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    const video = f.name.endsWith('.mp4');
    const valid = video ? bytes.toString('ascii', 4, 8) === 'ftyp' : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (bytes.length < 1000 || bytes.length > (video ? 100 : 8) * 1024 * 1024 || !valid) throw new Error('Invalid media ' + f.name);
    const folder = 'dist/media/social-kit/' + f.date;
    await mkdir(folder, { recursive: true });
    await writeFile(folder + '/' + f.name, bytes);
    console.log('Verified ' + f.date + '/' + f.name + ': ' + bytes.length + ' bytes');
  }
}
await Promise.all(Array.from({ length: 4 }, download));
await mkdir('dist/manual-week', { recursive: true });
await writeFile('dist/manual-week/index.html', buildManualPage(days));
console.log('Manual kit ready: ' + files.length + ' files');
