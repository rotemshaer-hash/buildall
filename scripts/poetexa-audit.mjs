// Preview-only brand and palette audit. Run after dist is generated.
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const files=[];
function walk(dir){for(const name of readdirSync(dir)){const p=join(dir,name);if(statSync(p).isDirectory())walk(p);else if(/\.(html|css|webmanifest)$/.test(p))files.push(p);}}
walk('dist');
let failed=0;
const report=(ok,message)=>{if(!ok){console.error('FAIL '+message);failed++;}};
const css=readFileSync('dist/style.css','utf8');
const layoutPages=files.filter(f=>f.endsWith('.html')&&!f.includes('/demo/')&&!f.includes('googlef0'));
for(const p of layoutPages){const s=readFileSync(p,'utf8');report(s.includes('POETEXA'),p+' missing brand');report(!s.includes('בונים הכל'),p+' legacy brand');report(s.includes('style.css'),p+' missing stylesheet');}
for(const hex of ['#8A6A10','#D4A017','#D8CEB4','#E8E1D0','#1C1406','#F7F4EC','#15100A'])report(!css.toUpperCase().includes(hex), 'legacy palette '+hex);
const manifest=readFileSync('dist/manifest.webmanifest','utf8');
report(manifest.includes('POETEXA'),'PWA brand');report(!manifest.includes('בונים הכל'),'PWA old brand');
for(const asset of ['dist/assets/poetexa-devices.svg','dist/assets/poetexa-wave.svg'])report(statSync(asset).size>100,asset+' empty');
console.log('POETEXA audit: '+layoutPages.length+' HTML pages, '+files.length+' styled documents, '+failed+' issues');
process.exitCode=failed?1:0;
