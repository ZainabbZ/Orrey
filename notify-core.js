// Shared by the page and the service worker. Pure scheduling logic, no I/O.
(function(g){
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const mins=t=>{const m=/^\s*(\d{1,2}):(\d{2})\s*$/.exec(t||'');return m&&+m[1]<24&&+m[2]<60?+m[1]*60+ +m[2]:null};
const TITLE={water:'Water',workout:'Workout',measure:'Measurements',nutrition:'Nutrition',sleep:'Sleep',summary:'Daily summary'};
const URLS={water:'#water',workout:'#train',measure:'#body',nutrition:'#fuel',sleep:'#home',summary:'#days'};
const MSG={water:['A glass of water could be nice right about now.','Hydration check-in. Log a drink if you have had one.'],workout:['Your planned session time. Go at the pace that suits today.','Training window is open. A lighter session counts too.'],measure:['Weekly check-in time. Measure the way you usually do; the numbers are just information.'],nutrition:['Log today\'s meals when it suits you. Approximate is fine.','A quick nutrition log keeps your picture complete.'],sleep:['Wind-down time. Rest is part of training.','Time to ease into the evening.'],summary:['Your daily summary is ready to review.','A moment to reflect on today, whenever you are ready.']};
function defaults(){const all=t=>Array(7).fill(t),o=false;return{k:'notif',on:false,quiet:{on:true,from:'22:30',to:'07:00'},max:6,gap:30,r:{water:{on:o,days:all('10:00, 14:00, 18:00')},workout:{on:o,days:['','17:00','','17:00','','17:00','']},measure:{on:o,days:['09:00','','','','','','']},nutrition:{on:o,days:all('20:00')},sleep:{on:o,days:all('22:00')},summary:{on:o,days:all('21:30')},achv:{on:o}}}}
function quiet(s,now){if(!s||!s.quiet||!s.quiet.on)return false;const a=mins(s.quiet.from),b=mins(s.quiet.to),n=now.getHours()*60+now.getMinutes();if(a==null||b==null)return false;return a<=b?n>=a&&n<b:n>=a||n<b}
// Returns notifications that are due now (scheduled time passed within `grace` minutes), after dedup, quiet hours and limits.
function due(s,log,now,grace){grace=grace||45;if(!s||!s.on)return[];const day=ymd(now),n=now.getHours()*60+now.getMinutes(),wd=now.getDay(),all=log.sent||[],sent=all.filter(x=>x.d===day),keys=new Set(all.map(x=>x.k)),c=[],out=[];
for(const k in s.r){const r=s.r[k];if(!r.on||!r.days)continue;for(const tk of String(r.days[wd]||'').split(',')){const t=mins(tk);if(t==null||t>n||n-t>grace)continue;const key=k+'|'+day+'|'+pad(t/60|0)+':'+pad(t%60);if(!keys.has(key))c.push({k,t,key})}}
if(!c.length||quiet(s,now))return out;c.sort((a,b)=>a.t-b.t);let cnt=sent.length,last=sent.reduce((a,x)=>Math.max(a,x.ts||0),0);const ts=now.getTime();
for(const x of c){if(cnt>=(s.max||6)||ts-last<(s.gap||0)*6e4)break;const b=MSG[x.k];out.push({key:x.key,d:day,k:x.k,title:'ASTRA: '+TITLE[x.k],body:b[(now.getDate()+x.t)%b.length],url:URLS[x.k]});cnt++;last=ts}
return out}
g.ASTRA={mins,defaults,quiet,due};
})(self);
