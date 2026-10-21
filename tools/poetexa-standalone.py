from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse,unquote
import base64,json,mimetypes,re,argparse
parser=argparse.ArgumentParser(description='Bundle the built POETEXA site as one offline HTML file. Requires beautifulsoup4.')
parser.add_argument('--output',type=Path,default=Path('POETEXA-OPEN.html'))
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1]/'dist'
OUT=args.output.resolve()
assets={}
def asset(path):
 p=path.resolve();key=p.relative_to(ROOT).as_posix()
 if key not in assets:
  mime=mimetypes.guess_type(key)[0] or 'application/octet-stream'
  assets[key]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
 return '__PO_ASSET__'+key+'__END__'
def local(ref,base):
 if not ref or ref.startswith(('#','data:','https:','http:','tel:','mailto:','javascript:')):return None
 u=urlparse(urljoin('https://poetexa.local/'+base,ref));p=ROOT/unquote(u.path.lstrip('/'))
 return p if p.is_file() else None
def css_text(path):
 s=path.read_text()
 def sub(m):
  ref=m.group(2);p=local(ref,path.relative_to(ROOT).as_posix())
  return 'url("'+asset(p)+'")' if p else m.group(0)
 return re.sub(r'url\((([\'\"]?))([^)]*)\)',lambda m:m.group(0),s) if False else re.sub(r'url\(\s*([\'\"]?)([^\)\'\"]+)\1\s*\)',sub,s)
pages={}
for path in sorted(ROOT.rglob('*.html')):
 if path.name in ('qa.html','gallery.html') or path.name.startswith('googlef'):continue
 key='/'+path.relative_to(ROOT).as_posix();key=key[:-10] if key.endswith('index.html') else key
 soup=BeautifulSoup(path.read_text(),'html.parser')
 for el in soup.select('link[rel="manifest"], .install'):el.decompose()
 for script in list(soup.find_all('script')):
  if 'serviceWorker' in script.get_text():script.decompose();continue
  if script.get('src'):
   p=local(script['src'],path.relative_to(ROOT).as_posix())
   if p:del script['src'];script.string=p.read_text();script.attrs.pop('defer',None)
 for link in list(soup.select('link[rel="stylesheet"]')):
  p=local(link.get('href'),path.relative_to(ROOT).as_posix())
  if p:
   style=soup.new_tag('style');style.string=css_text(p);link.replace_with(style)
 for el in soup.find_all(True):
  for attr in ['src','poster']:
   if el.has_attr(attr):
    p=local(el[attr],path.relative_to(ROOT).as_posix())
    if p:el[attr]=asset(p)
  if el.name=='link' and el.has_attr('href'):
   p=local(el['href'],path.relative_to(ROOT).as_posix())
   if p:el['href']=asset(p)
  if el.name=='a' and el.has_attr('href'):
   p=local(el['href'],path.relative_to(ROOT).as_posix())
   if p and p.suffix.lower() not in ('.html','.js','.css'):
    el['href']=asset(p);el['download']=p.name
 pages[key]=str(soup)
# Render the homepage without requiring JavaScript; the runtime adds navigation.
initial=BeautifulSoup(pages['/'],'html.parser')
for el in list(initial.find_all('script')):
 if el.get('type')!='application/ld+json':el.decompose()
initial=str(initial)
def expand_initial(m):
 key=m.group(1)
 return '' if key.endswith('.mp4') else assets[key]
initial=re.sub(r'__PO_ASSET__(.*?)__END__',expand_initial,initial)
# No empty media source: the original video is attached when the app starts.
initial=initial.replace('src=""','')
payload=json.dumps({'pages':pages,'assets':assets},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
runtime=r'''
(()=>{
'use strict';
const data=JSON.parse(document.getElementById('poetexa-bundle').textContent);
const fileBase=location.href.split('#')[0];
let route='/', cleanup=[];
const blobAssets=new Map();
function remember(key,hash,replace=false){try{history[replace?'replaceState':'pushState']({poetexaRoute:key},'',fileBase+hash);}catch{/* Android content:// viewers can disallow history changes; navigation still works. */}}
const nativeDocumentAdd=document.addEventListener;
const nativeWindowAdd=window.addEventListener;
const nativeFetch=window.fetch.bind(window);
window.fetch=(resource,options)=>{
 const url=typeof resource==='string'?resource:resource?.url||String(resource);
 if(url.includes('/api/chat'))return Promise.resolve(new Response(JSON.stringify({fallback:true,reason:'offline-preview'}),{headers:{'content-type':'application/json'}}));
 return nativeFetch(resource,options);
};
function expand(html){return html.replace(/__PO_ASSET__(.*?)__END__/g,(_,key)=>{
 if(!key.endsWith('.mp4'))return data.assets[key];
 if(!blobAssets.has(key)){
   const encoded=data.assets[key],base64=encoded.slice(encoded.indexOf(',')+1),binary=atob(base64),bytes=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
   blobAssets.set(key,URL.createObjectURL(new Blob([bytes],{type:'video/mp4'})));
 }
 return blobAssets.get(key);
});}
function jump(hash){
 if(!hash){window.scrollTo(0,0);return;}
 const el=document.getElementById(decodeURIComponent(hash.slice(1)));
 if(!el)return;
 for(let parent=el;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));
}
function mount(target,hash='',push=true){
 const key=data.pages[target]?target:'/404.html';
 for(const fn of cleanup)fn();cleanup=[];route=key;
 if(push)remember(key,hash);
 const parsed=new DOMParser().parseFromString(expand(data.pages[key]),'text/html');
 const scripts=[...parsed.querySelectorAll('script')].filter(s=>s.type!=='application/ld+json');
 const code=scripts.map(s=>s.textContent);scripts.forEach(s=>s.remove());
 document.documentElement.lang='he';document.documentElement.dir='rtl';
 document.head.innerHTML=parsed.head.innerHTML;
 document.body.innerHTML=parsed.body.innerHTML;
 document.addEventListener=function(type,listener,options){nativeDocumentAdd.call(document,type,listener,options);cleanup.push(()=>document.removeEventListener(type,listener,options));};
 window.addEventListener=function(type,listener,options){nativeWindowAdd.call(window,type,listener,options);cleanup.push(()=>window.removeEventListener(type,listener,options));};
 try{for(const text of code){const script=document.createElement('script');script.textContent='(()=>{\n'+text+'\n})();';document.body.append(script);}}
 finally{document.addEventListener=nativeDocumentAdd;window.addEventListener=nativeWindowAdd;}
 jump(hash);
}
nativeDocumentAdd.call(document,'click',event=>{
 const a=event.target.closest?.('a[href]');
 if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.hasAttribute('download'))return;
 const href=a.getAttribute('href');if(!href||/^(tel:|mailto:|data:|javascript:)/i.test(href))return;
 const url=new URL(href,'https://poetexa.local'+route);
 if(!['poetexa.local','buildall.pages.dev'].includes(url.hostname))return;
 let target=url.pathname;if(target.endsWith('/index.html'))target=target.slice(0,-10);
 if(!target.endsWith('/')&&!target.endsWith('.html'))target+='/';
 event.preventDefault();
 if(target===route){remember(route,url.hash);document.querySelectorAll('.mobile-menu').forEach(el=>el.open=false);jump(url.hash);}
 else mount(target,url.hash,true);
},true);
nativeWindowAdd.call(window,'popstate',event=>{const next=event.state?.poetexaRoute||'/';if(next!==route)mount(next,location.hash,false);else jump(location.hash);});
remember('/',location.hash,true);
mount('/',location.hash,false);
})();
'''
# A literal backslash-n in a dynamic script would be invalid JS; use actual newlines.
result=initial.replace('</body>','<script id="poetexa-bundle" type="application/json">'+payload+'</script><script>'+runtime+'</script></body>')
OUT.write_text(result)
print(json.dumps({'file':str(OUT),'bytes':OUT.stat().st_size,'pages':len(pages),'embedded_assets':len(assets)},ensure_ascii=False))
