import { mkdir, writeFile } from 'node:fs/promises';
const ids = ['3227684812430610481','9796653701978587765','2402573806964134574','12762960489213970446','7647500113676674682'];
const folder = 'dist/media/instagram-posts/2026-10-29';
await mkdir(folder, { recursive: true });
for (const [i, id] of ids.entries()) {
  const url = 'https://static.metricool.com/planner/202610/7696609-file-' + id + '.jpeg';
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error('Image ' + (i + 1) + ' source HTTP ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000 || bytes.length > 8 * 1024 * 1024 || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) throw new Error('Invalid JPEG ' + (i + 1));
  await writeFile(folder + '/' + (i + 1) + '.jpg', bytes);
  console.log('Image ' + (i + 1) + ': verified JPEG, ' + bytes.length + ' bytes');
}
