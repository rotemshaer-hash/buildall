// Check every HTML/CSS resource in the deploy directory, including the demo gallery.
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,dirname,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve('dist'),files=[];
function walk(dir){for(const name of readdirSync(dir)){const p=join(dir,name);statSync(p).isDirectory()?walk(p):files.push(p);}}walk(root);
let checks=0;const errors=[];function check(ok,msg){checks++;if(!ok)errors.push(msg);}
const pages=files.filter(p=>p.endsWith('.html')&&!/googlef|qa.html|gallery.html/.test(p));
for(const page of pages){const s=readFileSync(page,'utf8');const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);check(new Set(ids).size===ids.length,relative(root,page)+': duplicate ids');
 for(const m of s.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)){
  const h=m[1];if(!h||/^(https?:|data:|tel:|mailto:|javascript:)/.test(h))continue;
  const u=new URL(h,'https://qa.test/'+relative(root,page));let dest=resolve(root,'.'+decodeURIComponent(u.pathname));
  if(existsSync(dest)&&statSync(dest).isDirectory())dest=join(dest,'index.html');
  check(existsSync(dest),relative(root,page)+': missing '+h);
  if(u.hash&&dest.endsWith('.html')&&existsSync(dest)){const html=readFileSync(dest,'utf8');check(html.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'),relative(root,page)+': missing anchor '+h);}
 }
}
for(const css of files.filter(p=>p.endsWith('.css'))){for(const m of readFileSync(css,'utf8').matchAll(/url\(["']?([^\)"']+)["']?\)/g)){const h=m[1];if(/^(data:|https?:|#|%23)/.test(h))continue;check(existsSync(resolve(dirname(css),h)),relative(root,css)+': missing '+h);}}
check(createHash('sha256').update(readFileSync(join(root,'media/workit.mp4'))).digest('hex')==='a21d3557c4a8131cc9db770624d76aa93b36e17e4428c8f8c72a8ddd2c185784','POETEXA recoloured film changed');
check(files.length<1000,'Cloudflare dashboard upload file limit');
for(const f of files)check(statSync(f).size<=25*1024*1024,'Cloudflare per-file limit: '+relative(root,f));
console.log(JSON.stringify({htmlPages:pages.length,checks,files:files.length,errors},null,2));process.exitCode=errors.length?1:0;
