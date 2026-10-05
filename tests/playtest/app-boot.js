// The Android app, emulated: android-app/boot.html served at its own origin (localhost:8766) fetches the
// live site's index.html and document.writes it with a <base> to the site. LIVE=real fetches
// chamyao.github.io through curl (TLS checked by curl); LIVE=local (default) serves this checkout as
// if it were the site, with ACAO * as Pages sends. Every site file is held back like Slow 4G (Chrome's Slow 4G: 563 ms + about 180 KB/s; LAT= to change).
// Checks: the campaign world comes up under <base>, stills.json loads, and the oath's pictures show.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..','..'),SITE='https://chamyao.github.io/goban-trainer/',APP='http://localhost:8766/';
const MODE=process.env.LIVE||'local',SLOW=process.env.SLOW!=='0';
(async()=>{
// the app's own files (what prepare-web.mjs puts in www/: boot.html as index.html, native.js, app.html)
const appDir=fs.mkdtempSync('/tmp/tk-app-');fs.copyFileSync(path.join(ROOT,'android-app/boot.html'),path.join(appDir,'index.html'));fs.copyFileSync(path.join(ROOT,'android-app/native.js'),path.join(appDir,'native.js'));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
const errs=[],reqs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('ERR',e.message);});p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200));});
await p.route('**/phaser.min.js',r=>r.fulfill({path:path.join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
p.on('response',r=>{if(r.status()===404&&!/\.mp3/.test(r.url()))console.log('     404',r.url().replace(SITE,'SITE/').replace(APP,'APP/'));});
await p.route(APP+'**',r=>{const u=new URL(r.request().url());const f=path.join(appDir,u.pathname==='/'?'index.html':u.pathname.slice(1));return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''});});
await p.route(SITE+'**',async r=>{const url=r.request().url(),u=new URL(url),rel=decodeURIComponent(u.pathname.replace('/goban-trainer/',''));const t0=Date.now();
  let body,status=200,type;
  if(rel.endsWith('phaser.min.js')){body=fs.readFileSync(path.join(__dirname,'vendor/phaser.min.js'));type='application/javascript';}
  else if(rel.endsWith('.mp3')){return r.fulfill({status:404,body:''});}
  else if(MODE==='real'){try{body=execFileSync('curl',['-sS','-f','--max-time','60',url],{maxBuffer:64<<20});}catch(e){status=404;body=Buffer.from('');}}
  else{const f=path.join(ROOT,rel||'index.html');if(fs.existsSync(f)&&fs.statSync(f).isFile())body=fs.readFileSync(f);else{status=404;body=Buffer.from('');}}
  if(SLOW)await new Promise(z=>setTimeout(z,Math.max(0,(+process.env.LAT||563)+body.length/180-(Date.now()-t0))));   // ~Slow 4G
  reqs.push({rel,status,ms:Date.now()-t0,kb:Math.round(body.length/1024)});
  const ext=path.extname(rel).toLowerCase(),types={'.js':'application/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.tmj':'application/json'};
  return r.fulfill({status,body,headers:{'access-control-allow-origin':'*','content-type':type||types[ext]||'application/octet-stream'}});});
await p.goto(APP+'#/tk/1');
const base=async()=>p.evaluate(()=>{const b=document.querySelector('base');return {base:b&&b.href,local:window.APP_LOCAL,url:location.href};}).catch(()=>null);
let i=0;for(;i<60;i++){const s=await base();if(s&&s.base)break;await p.waitForTimeout(250);}
const B=await base();check(!!B&&B.base===SITE&&B.url.startsWith(APP),`the app writes in the site's page with <base>: ${JSON.stringify(B)}`);
// test mode and progress: up to the oath (1-n2)
await p.waitForTimeout(3000);
await p.evaluate(()=>{localStorage.setItem('tk-guide','off');localStorage.setItem('tk-test','1');['1-start','1-c1','1-n1','1-i1'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);['1:opening','1:tree','1:council','1:notice','1:inn'].forEach(k=>TK.markSeen&&TK.markSeen(k));});
await p.reload();for(let k=0;k<80;k++){if(await p.evaluate(()=>!!document.querySelector('base')).catch(()=>false))break;await p.waitForTimeout(250);}
const scroll=()=>p.evaluate(()=>{const h=document.querySelector('.tk-scroll h3');return h&&h.textContent;}).catch(()=>null);
const t0=Date.now();let up=false;for(let k=0;k<240;k++){const c=p.getByText('Cancel',{exact:true});if(await c.count().catch(()=>0)&&await c.first().isVisible().catch(()=>false))await c.first().tap().catch(()=>{});if(await scroll())await p.locator('.tk-scroll-go').first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)).catch(()=>false)){up=true;break;}await p.waitForTimeout(250);}
check(up,`the campaign world comes up in the app (${((Date.now()-t0)/1000).toFixed(1)} s)`);
if(!up){console.log('requests:',reqs.slice(-15).map(r=>`${r.status} ${r.rel} ${r.ms}ms`).join(' | '));await b.close();process.exit(1);}
// the oath, played by taps
await p.evaluate(()=>{const w=window.__w,q=w.region.quests.find(q=>q.node==='1-n2');w.leaving=false;w.go(q.place);});await p.waitForTimeout(2500);
await p.evaluate(()=>{const w=window.__w,q=w.region.quests.find(q=>q.node==='1-n2'),s=Object.values(w.spots).find(s=>s.node==='1-n2');if(!(w.ui.busy()||w.cine)&&q&&s)w.playQuest(q,s);});
const shown=new Map();const tS=Date.now();
for(let k=0;k<500;k++){await p.waitForTimeout(150);
  const id=await p.evaluate(()=>{const el=document.querySelector('.tk-still.on img:not(.tk-still-bg)');return el&&el.complete&&el.naturalWidth?(el.src.match(/stills\/([^.?]+)/)||[])[1]:null;});
  if(id&&!shown.has(id))shown.set(id,((Date.now()-tS)/1000).toFixed(1));
  if(process.env.DEBUG&&k%10===0)console.log('    ',k,await p.evaluate(()=>JSON.stringify({still:[...document.querySelectorAll('.tk-still')].map(e=>e.className+' '+((e.querySelector('img')||{}).src||'').split('/').pop()),dlg:(document.querySelector('.town-dlg .town-en')||{}).textContent,keys:[...document.querySelectorAll('.tk-duel-keys button, .tk-duel button')].map(b=>b.textContent.trim()).join('/'),test:localStorage.getItem('tk-test'),cine:!!(window.__w&&window.__w.cine)})));
  if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
  const sk=p.locator('.tk-duel-keys button',{hasText:/Skip|跳过/});if(await sk.count()){await sk.first().tap().catch(()=>{});await p.waitForTimeout(500);continue;}
  if(await scroll()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
  const box=await p.evaluate(()=>{const w=window.__w;if(!w||!(w.ui.busy()||w.cine))return null;const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});
  if(box){await p.waitForTimeout(600);await p.touchscreen.tap(...box);continue;}
  if(await p.evaluate(()=>TK.cleared('1-n2')&&!(window.__w.ui.busy()||window.__w.cine)&&!document.querySelector('.tk-duel'))&&k>10)break;}
const sreq=reqs.filter(r=>/stills\//.test(r.rel)),stillsReq=reqs.filter(r=>/stills\.json/.test(r.rel));if(process.env.DEBUG)console.log('     all still requests:',JSON.stringify(reqs.filter(r=>/still/.test(r.rel))),'shown',JSON.stringify([...shown]));
console.log(`     stills.json: ${stillsReq.map(r=>r.status+' '+r.ms+'ms').join(', ')||'never asked for'}; pictures fetched: ${sreq.filter(r=>!/json/.test(r.rel)).map(r=>`${r.rel.split('/').pop()} ${r.status} ${r.kb}KB ${r.ms}ms`).join(', ')||'none'}`);
check(stillsReq.some(r=>r.status===200),'stills.json loads under <base>');
for(const id of ['oath_a','oath_b','oath_c'])check(shown.has(id),`${id} shows in the app${shown.has(id)?` (${shown.get(id)} s into the scene)`:''}`);
check(!errs.length,`no page errors${errs.length?': '+errs.join('; '):''}`);
console.log(fails?`app-boot: ${fails} failed`:'app-boot: all ok');await b.close();process.exit(fails?1:0);})();
