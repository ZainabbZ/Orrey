// Pure training logic shared by the app and the tests. No DOM, no storage.
(function(g){
const R=x=>Math.round(x*10)/10,e1=(w,r)=>r<=1?w:w*(1+r/30); // Epley estimate
const typ=s=>s.t||(s.wu?'warm':'work'); // old saved sets only have `wu`
// Sets that may create records: working, failure and back-off sets that were completed. Warm-up and drop sets never do.
const prEl=s=>['work','fail','back'].includes(typ(s))&&s.w>0&&s.r>0&&s.done!==false;
function bests(ws,prs,name,skip){const n=name.toLowerCase(),b={w:0,e:0,rw:{},seen:false};
ws.forEach(w=>{if(w.id===skip)return;(w.ex||[]).forEach(e=>{if(e.name.toLowerCase()!==n)return;e.sets.forEach(s=>{if(!prEl(s))return;b.seen=true;b.w=Math.max(b.w,s.w);b.e=Math.max(b.e,e1(s.w,s.r));b.rw[s.w]=Math.max(b.rw[s.w]||0,s.r)})})});
(prs||[]).forEach(p=>{if(p.ex.toLowerCase()!==n)return;b.seen=true;if(p.e1rm)b.e=Math.max(b.e,p.e1rm);if(p.w>0&&p.r>0){b.w=Math.max(b.w,p.w);b.rw[p.w]=Math.max(b.rw[p.w]||0,p.r)}}); // every saved record was a real lifted set
return b}
// Compares one exercise from a session being saved with everything before it. The first ever entry is a baseline, not a record.
function detect(ws,prs,ex,date,skip){const b=bests(ws,prs,ex.name,skip),ss=ex.sets.filter(prEl),ev=[];if(!ss.length)return{baseline:false,ev};
const top=ss.reduce((a,s)=>s.w>a.w?s:a),be=ss.reduce((a,s)=>e1(s.w,s.r)>e1(a.w,a.r)?s:a),mk=(kind,s,x)=>({ex:ex.name,kind,w:s.w,r:s.r,e1rm:R(e1(s.w,s.r)),date,...x});
if(!b.seen)return{baseline:true,ev:[mk('e1rm',be,{base:true})]};
if(top.w>b.w)ev.push(mk('weight',top,{prev:b.w}));
if(R(e1(be.w,be.r))>R(b.e))ev.push(mk('e1rm',be,{prev:R(b.e)}));
const seenW=new Set();ss.forEach(s=>{if(seenW.has(s.w))return;seenW.add(s.w);const m=Math.max(...ss.filter(x=>x.w===s.w).map(x=>x.r));if(b.rw[s.w]!==undefined&&m>b.rw[s.w])ev.push(mk('reps',{w:s.w,r:m},{prev:b.rw[s.w]}))});
return{baseline:false,ev}}
const gd=(a,b)=>Math.round((new Date(a+'T12:00')-new Date(b+'T12:00'))/864e5);
// Longest chain of active days where up to 2 rest days between sessions never break it.
function bestStreak(ds){const d=[...new Set(ds)].sort();let b=d.length?1:0,c=1;for(let i=1;i<d.length;i++){c=gd(d[i],d[i-1])<=3?c+1:1;b=Math.max(b,c)}return b}
// Longest run of consecutive calendar days.
function maxRun(ds){const d=[...new Set(ds)].sort();let b=d.length?1:0,c=1;for(let i=1;i<d.length;i++){c=gd(d[i],d[i-1])===1?c+1:1;b=Math.max(b,c)}return b}
g.LOGIC={e1,R,typ,prEl,bests,detect,bestStreak,maxRun};
})(self);
