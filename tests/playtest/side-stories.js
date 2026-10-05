// Phone, taps only once there: every side story and the shortcut (a1-a3, b1, b2, b2g, f1, b3, bs).
// For each: clear what comes before, go to its place, tap its story spot, tap through the scene,
// solve the problem by tapping the board (the key's move), tap Continue, tap through the end.
// Checks the scene plays, the problem opens and is won, the beat is cleared, and no page error.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const BEATS=['1-a1','1-a2','1-a3','1-b1','1-b2','1-b2g','1-f1','1-b3','1-bs'];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message,'|',(e.stack||'').split('\n').slice(1,5).map(x=>x.trim()).join(' < ')));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
const scrolls=async()=>{for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}};
await p.reload();await p.waitForTimeout(1500);await scrolls();await ready();
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k,r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
const tapBox=async()=>{const r=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const b=d.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];}const c=window.__w.game.canvas.getBoundingClientRect();return [c.left+c.width/2,c.top+c.height*.8];});await p.touchscreen.tap(...r);};
const line=()=>p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?((d.querySelector('.town-who').textContent||'')+': '+d.querySelector('.town-en').textContent):null;});
const best=()=>p.evaluate(()=>{const t=window.__trainer;if(!t||t.done||t.engineBusy||t.played.length%2)return null;
  const n=t.played.length,memo=new Map(),open=L=>L.length-1>n&&t.played.every((m,i)=>m===L[i+1]);
  const ms=[...new Set([...t.p.lines.filter(L=>L[0]===1&&open(L)),...t.p.lines.filter(L=>L[0]===2&&open(L))].map(L=>L[n+1]))];if(!ms.length)return null;
  const m=ms.find(m=>t.outcome([...t.played,m],memo)==='ok')||ms[0],c=m.charCodeAt(0)-97,r=m.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));
  if(!el)return {m};const R=el.getBoundingClientRect();return {m,x:R.left+R.width/2,y:R.top+R.height/2};});
let fails=0;
for(const node of BEATS){
  // everything before it cleared (along its own road), it not
  await p.evaluate(node=>{const Q=window.__w.region.quests,seen=new Set(),st=[...Q.find(q=>q.node===node).after];while(st.length){const k=st.pop();if(seen.has(k))continue;seen.add(k);TK.markCleared(k);const q=Q.find(q=>q.node===k);if(q)st.push(...q.after);}},node);
  const q=await p.evaluate(node=>{const q=window.__w.region.quests.find(q=>q.node===node);return {place:q.place,title:q.title,avail:window.__w.available(q)};},node);
  await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},q.place);await p.waitForTimeout(1500);await ready();await scrolls();await ready();
  const goal=await p.evaluate(()=>document.querySelector('.town-goal').textContent);
  // stand a few steps below the spot, then tap it
  const s=await p.evaluate(node=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node===node);if(!s)return null;if(w.ui.busy()||w.cine)return [s.x,s.y];const G=w.walkGrid();
    for(const [dx,dy] of [[0,50],[0,40],[30,40],[-30,40],[40,0],[-40,0],[0,-40]]){if(G.free(Math.floor((s.x+dx)/G.C),Math.floor((s.y+dy-3)/G.C))){w.player.setPosition(s.x+dx,s.y+dy);break;}}return [s.x,s.y];},node);
  if(!s){fails++;console.log(`FAIL ${node} (${q.place}): no story spot on the map`);continue;}
  // indoors the scene starts as you come in: then just tap through it; outdoors walk up and tap the spot
  await p.waitForTimeout(1200);const started=await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);
  if(!started)await tapW(s[0],s[1]);
  const before=[];let opened=false;
  for(let i=0;i<400;i++){if(await p.locator('.tk-duel svg').count()){opened=true;break;}const l=await line();if(l&&before[before.length-1]!==l)before.push(l);if(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine))await tapBox();await p.waitForTimeout(120);}
  if(!opened){fails++;await p.screenshot({path:SP+`/side-${node}.png`});console.log(`FAIL ${node} (${q.place}): no problem opened; lines: ${before.slice(-3).join(' | ')}`);continue;}
  await p.waitForTimeout(800);
  let moves=[];for(let i=0;i<40;i++){if(await p.locator('.tk-duel-go').count())break;const m=await best();if(m&&m.x){await p.touchscreen.tap(m.x,m.y);/* tap-to-preview: a second tap plays the ghost */if(await p.evaluate(()=>!!(window.__trainer&&window.__trainer.goban.ghost)))await p.touchscreen.tap(m.x,m.y);moves.push(m.m);await p.waitForTimeout(900);}else await p.waitForTimeout(400);}
  await p.screenshot({path:SP+`/side-${node}-board.png`});
  const won=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.classList.contains('win'):false;});
  if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap();
  const after=[];for(let i=0;i<400;i++){await p.waitForTimeout(120);const g=p.locator('.tk-scroll-go');if(await g.count()){after.push('[scroll]');await g.first().tap();continue;}
    if(!(await p.evaluate(()=>!!window.__w&&(window.__w.ui.busy()||!!window.__w.cine)))){if(i>10)break;else continue;}const l=await line();if(l&&after[after.length-1]!==l)after.push(l);await tapBox();}
  const cleared=await p.evaluate(n=>TK.cleared(n),node);
  const ok=won&&cleared;if(!ok)fails++;
  console.log(`${ok?'ok  ':'FAIL'} ${node} "${q.title}" @ ${q.place}: goal "${goal.slice(0,50)}", ${before.length} lines, moves ${moves.join(' ')}, won ${won}, ${after.length} lines after, cleared ${cleared}`);
  console.log('     before: '+before.slice(0,2).map(x=>x.slice(0,80)).join(' | '));
  console.log('     after: '+after.slice(-2).map(x=>x.slice(0,80)).join(' | '));
}
console.log(`side stories: ${BEATS.length-fails}/${BEATS.length}`);await b.close();})();
