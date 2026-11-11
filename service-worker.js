importScripts('notify-core.js');
const V='orrery-v6',F=['./','index.html','style.css','app.js','notify-core.js','logic.js','manifest.json','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match('index.html'))))});
// Reminder checks. Runs when the page asks (every ~30s while open) or when the browser grants a Periodic Background Sync wake-up.
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('orrery');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function kv(k,v){const d=await idb();return new Promise((ok,no)=>{const s=d.transaction('profile',v?'readwrite':'readonly').objectStore('profile'),q=v?s.put({...v,k}):s.get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
async function run(){if(self.Notification&&Notification.permission!=='granted')return;const s=await kv('notif'),log=(await kv('nlog'))||{k:'nlog',sent:[]},out=ASTRA.due(s,log,new Date());for(const n of out){await self.registration.showNotification(n.title,{body:n.body,silent:!!(s&&s.sound==='silent'),tag:n.key,icon:'assets/icon-192.png',badge:'assets/icon-192.png',data:{url:n.url}});log.sent.push({k:n.key,d:n.d,ts:Date.now()})}if(out.length){log.sent=log.sent.slice(-60);await kv('nlog',log);(await clients.matchAll({type:'window'})).forEach(c=>c.postMessage('astra-fired'))}}
self.addEventListener('periodicsync',e=>{if(e.tag==='astra-check')e.waitUntil(run())});
self.addEventListener('message',e=>{if(e.data==='astra-check')e.waitUntil(run())});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=e.notification.data&&e.notification.data.url||'#home';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>cs[0]?(cs[0].focus(),cs[0].navigate?cs[0].navigate('./'+u):0):clients.openWindow('./'+u)))});
