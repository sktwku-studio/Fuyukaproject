/* ODDSPACE MEDIA — Service Worker (taruh di folder yang sama dengan index.html, layani lewat https) */
const V='odd-v7',CORE=V+'-core',RT=V+'-rt',IMG='odd-img',MAX_IMG=220;
const CORE_URLS=['./','index.html','logo-oddspace.png','logo-oddspace.svg','logo-oddspace-putih.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.all(CORE_URLS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>/^odd-v/.test(k)&&![CORE,RT].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const trim=async(name,max)=>{const c=await caches.open(name),ks=await c.keys();for(let i=0;i<ks.length-max;i++)await c.delete(ks[i])};
const isImg=r=>r.destination==='image'||/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(r.url);
async function cacheImg(url){
  const c=await caches.open(IMG);if(await c.match(url))return true;
  try{const r=await fetch(new Request(url,{mode:'cors',credentials:'omit'}));if(r.ok){await c.put(url,r.clone());return true}}catch(e){}
  try{const r=await fetch(new Request(url,{mode:'no-cors'}));if(r&&(r.ok||r.type==='opaque')){await c.put(url,r);return true}}catch(e){}return false}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  if(u.hostname.endsWith('.supabase.co')&&!u.pathname.startsWith('/storage/'))return;   /* data API: ditangani IndexedDB di halaman */
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const k=x.clone();caches.open(CORE).then(c=>c.put('index.html',k));return x}).catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));return}
  if(isImg(r)){e.respondWith(caches.open(IMG).then(async c=>{const h=await c.match(r.url);if(h)return h;
    try{const x=await fetch(r);if(x.ok||x.type==='opaque'){c.put(r.url,x.clone()).then(()=>trim(IMG,MAX_IMG));return x}return x}catch(err){return h||new Response('',{status:504})}}));return}
  /* skrip, gaya, font (CDN & same-origin): stale-while-revalidate */
  e.respondWith(caches.open(RT).then(async c=>{const h=await c.match(r);
    const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x}).catch(()=>null);
    return h||(await net)||new Response('',{status:504})}))});
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.type==='precache'){e.waitUntil((async()=>{const list=[...new Set(d.urls||[])].map(u=>{try{return new URL(u,self.location).href}catch(x){return null}}).filter(Boolean);let done=0;
    const say=async()=>{for(const cl of await self.clients.matchAll())cl.postMessage({type:'progress',done,total:list.length})};
    for(let i=0;i<list.length;i+=4){await Promise.all(list.slice(i,i+4).map(u=>cacheImg(u).catch(()=>{})));done=Math.min(list.length,i+4);await say()}
    await trim(IMG,MAX_IMG)})())}
  else if(d.type==='clear'){e.waitUntil(caches.delete(IMG).then(async()=>{for(const cl of await self.clients.matchAll())cl.postMessage({type:'cleared'})}))}});
