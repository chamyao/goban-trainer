// Offline (the user: "optimize for offline use / periodic connection: I take the subway"; "cache the Stream and other
// problems, solve without a connection, and update the sheet once it's back"): the site kept by its service worker
// and Offline.prefetch; with the network off it opens, deals Stream problems and rates them; progress and feedback
// wait (the header's pill says so) and reach the sheet (mocked) when the network is back.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const posts=[];
await ctx.route('https://script.google.com/**',r=>{const q=r.request();if(q.method()==='POST'){posts.push(JSON.parse(q.postData()));return r.fulfill({json:{ok:true}});}return r.fulfill({json:{data:{}}});});
await p.addInitScript(()=>{localStorage.setItem('gt-username','offline-tester');});
await p.goto('http://localhost:8765/#/');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>navigator.serviceWorker.controller||new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',()=>r(true))),null,{timeout:30000});
check(await p.evaluate(()=>!!navigator.serviceWorker.controller),'the service worker keeps the site');
const kept=await p.evaluate(()=>Offline.prefetch());
check(kept.failed===0&&kept.files>10,`kept ahead of the trip: ${kept.files} files (every book, the Stream, KataGo)`);
await ctx.setOffline(true);
await p.reload();await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.book-list',{timeout:20000});
check(await p.isVisible('#netChip')&&/Offline/.test(await p.textContent('#netChip')),`offline, the site opens; the pill: "${await p.textContent('#netChip')}"`);
// the Stream, offline: several problems dealt and rated
await p.evaluate(()=>location.hash='#/stream');
const r0=await p.evaluate(()=>TKElo.state().r);let rated=0;
for(let n=0;n<3;n++){
  await p.waitForFunction(()=>window.__trainer&&window.__trainer.p&&document.querySelector('.stream-rating'),null,{timeout:20000});await p.waitForTimeout(300);
  for(let i=0;i<40;i++){const st=await p.evaluate(()=>{const t=window.__trainer;if(t.done==='ok'||t.done==='bad')return t.done;if(t.done==='next'||t.engineBusy)return 'wait';
    const L=t.consistentLines()[0];if(!L)return 'noline';const mv=L[t.played.length+1];if(!mv)return 'wait';const [c,rr]=cIdx(mv);t.click(c,rr);return 'played';});
    if(st==='ok'||st==='bad'||st==='noline')break;await p.waitForTimeout(st==='wait'?600:1000);}
  if(await p.evaluate(()=>TKElo.state().streamRated===`${window.__trainer.book.id}:${window.__trainer.p.id}`))rated++;
  await p.evaluate(()=>window.__trainer.streamNext());}
const r1=await p.evaluate(()=>TKElo.state().r);
check(rated===3&&r1!==r0,`offline, the Stream deals and rates: 3 problems, rating ${r0} → ${r1}`);
await p.waitForFunction(()=>/1 to sync/.test(document.getElementById('netChip').textContent),null,{timeout:15000}).catch(()=>{});
check(/Offline · 1 to sync/.test(await p.textContent('#netChip'))&&posts.length===0,`the progress waits: "${await p.textContent('#netChip')}", nothing sent`);
const fb=await p.evaluate(()=>Sync.sendFeedback('written underground','#/stream'));
check(fb==='queued'&&/2 to sync/.test(await p.textContent('#netChip')),'feedback written offline waits too');
// back above ground
await ctx.setOffline(false);
await p.waitForFunction(()=>document.getElementById('netChip').hidden,null,{timeout:20000}).catch(()=>{});
const prog=posts.find(x=>x.kind==='progress'),f=posts.find(x=>x.kind==='feedback');
check(!!prog&&!!f&&f.data.message==='written underground','back online: the progress and the feedback reach the sheet');
check(await p.evaluate(()=>document.getElementById('netChip').hidden&&!Sync.dirty()&&Offline.box().length===0),'and nothing is left waiting; the pill goes');
const sent=prog&&await p.evaluate(async d=>(await Sync.unpack(d)).progress.tkElo.r,prog.data);
check(sent===r1,`the rating earned offline is the one on the sheet (${sent})`);
await ctx.close();
// the Android app (android-app/boot.html): the live site's page under a <base>, the APK's own files at APP_LOCAL. Here
// the "live site" is live.test (routed to these files) and the APK's copy localhost; the live site's data cut off mid-ride: the copy answers
const c2=await b.newContext(),q=await c2.newPage();q.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const LIVE='https://live.test/',LOCAL='http://localhost:8765/';
await q.route(LIVE+'**',async r=>{const u=r.request().url();if(/\/(data|assets)\//.test(u))return r.fallback();
  const res=await fetch(LOCAL+u.slice(LIVE.length));r.fulfill({status:res.status,body:Buffer.from(await res.arrayBuffer()),headers:{'content-type':res.headers.get('content-type')||'','access-control-allow-origin':'*'}});});
await q.route(LOCAL+'app-sim',async r=>{let html=await (await fetch(LOCAL+'index.html')).text();
  html=html.replace('<head>',`<head><base href="${LIVE}"><script>window.APP_LOCAL=${JSON.stringify(LOCAL)};<\/script>`);r.fulfill({body:html,contentType:'text/html'});});
const cut=[];await q.route(LIVE+'data/**',r=>{cut.push(r.request().url());r.abort('internetdisconnected');});
await q.route(LIVE+'assets/**',r=>r.abort('internetdisconnected'));
await q.goto(LOCAL+'app-sim#/stream');await q.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await q.waitForFunction(()=>window.__trainer&&window.__trainer.p,null,{timeout:30000}).catch(()=>{});
check(await q.evaluate(()=>!!(window.__trainer&&window.__trainer.p))&&cut.length>0,`the app with the live site's data cut off: the Stream deals from the APK's copy (${cut.length} files refused live)`);
const img=await q.evaluate(async()=>{const i=new Image();document.body.append(i);i.src='assets/events/cur-halloween.png?v=1';await new Promise(r=>setTimeout(r,1500));return [i.naturalWidth,i.src];});
check(img[0]>0&&img[1].startsWith(LOCAL),`and a picture the live site can't give comes from the APK's copy (${img[1]})`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);})();
