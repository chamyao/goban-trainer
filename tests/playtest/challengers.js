// Phone, taps: every challenger in book 1. Tap them (he walks up and talks), tap through, the duel opens;
// solve it by tapping the board; Continue. Then: cleared, their "!" is gone, and talking again
// gives their after-words, not another duel.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
const scrolls=async()=>{for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}};
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await scrolls();await ready();
const tapW=async(x,y)=>{const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k,r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
const tapBox=async()=>{const r=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const b=d.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];}const c=window.__w.game.canvas.getBoundingClientRect();return [c.left+c.width/2,c.top+c.height*.8];});await p.touchscreen.tap(...r);};
const line=()=>p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?((d.querySelector('.town-who').textContent||'')+': '+d.querySelector('.town-en').textContent):null;});
const best=()=>p.evaluate(()=>{const t=window.__trainer;if(!t||t.done||t.engineBusy||t.played.length%2)return null;
  const n=t.played.length,memo=new Map(),open=L=>L.length-1>n&&t.played.every((m,i)=>m===L[i+1]);
  const ms=[...new Set([...t.p.lines.filter(L=>L[0]===1&&open(L)),...t.p.lines.filter(L=>L[0]===2&&open(L))].map(L=>L[n+1]))];if(!ms.length)return null;
  const m=ms.find(m=>t.outcome([...t.played,m],memo)==='ok')||ms[0],c=m.charCodeAt(0)-97,r=m.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));
  if(!el)return {m};const R=el.getBoundingClientRect();return {m,x:R.left+R.width/2,y:R.top+R.height/2};});
const talkTo=async(key)=>{ // walk near, tap them, tap through until a duel opens or the talk ends
  const np=await p.evaluate(k=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===k);const G=w.walkGrid();
    for(const [dx,dy] of [[0,40],[40,10],[-40,10],[0,-30]])if(G.free(Math.floor((n.spr.x+dx)/G.C),Math.floor((n.spr.y+dy-3)/G.C))){w.player.setPosition(n.spr.x+dx,n.spr.y+dy);break;}
    n.wander=false;return [n.spr.x,n.spr.y-8];},key);
  await p.waitForTimeout(500);await tapW(...np);
  const lines=[];let duel=false;for(let i=0;i<150;i++){await p.waitForTimeout(120);if(await p.locator('.tk-duel svg').count()){duel=true;break;}
    const busy=await p.evaluate(()=>window.__w.ui.busy());const l=await line();if(l&&lines[lines.length-1]!==l)lines.push(l);
    if(busy)await tapBox();else if(lines.length&&i>15)break;}
  return {lines,duel};};
const keys=await (async()=>{const out=[];for(const pl of ['lousang-village','zhuo-county']){await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},pl);await p.waitForTimeout(1500);await ready();
  out.push(...(await p.evaluate(()=>window.__w.npcs.filter(n=>n.challenge).map(n=>n.challenge))).map(k=>[pl,k]));}return out;})();
console.log('challengers:',keys.map(k=>k[1]).join(', '));
let fails=0;
for(const [pl,key] of keys){
  if(await p.evaluate(pl=>window.__w.placeId!==pl,pl)){await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},pl);await p.waitForTimeout(1500);await ready();}
  const markBefore=await p.evaluate(k=>{const n=window.__w.npcs.find(n=>n.challenge===k);return !!(n.mark&&n.mark.visible);},key);
  const t1=await talkTo(key);
  if(!t1.duel){fails++;console.log(`FAIL ${key}: no duel; lines ${t1.lines.slice(-2).join(' | ')}`);await p.screenshot({path:SP+`/challenger-${key}.png`});continue;}
  await p.waitForTimeout(800);
  const who=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d.querySelector('.town-who').textContent+' | '+d.querySelector('.town-en').textContent;});
  const moves=[];for(let i=0;i<40;i++){if(await p.locator('.tk-duel-go').count())break;const m=await best();if(m&&m.x){await p.touchscreen.tap(m.x,m.y);moves.push(m.m);await p.waitForTimeout(900);}else await p.waitForTimeout(400);}
  const won=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.classList.contains('win'):false;});
  const winLine=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg .town-en');return d?d.textContent:'';});
  if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap();
  for(let i=0;i<40;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!!window.__w&&window.__w.ui.busy()))await tapBox();else if(i>8)break;}
  await ready();
  const after=await p.evaluate(k=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===k);return {cleared:TK.cleared(k),mark:!!(n&&n.mark&&n.mark.visible),place:w.placeId,free:w.canMove()};},key);
  const t2=await talkTo(key);
  const ok=won&&after.cleared&&!after.mark&&!t2.duel&&t2.lines.length>0&&after.free;if(!ok)fails++;
  console.log(`${ok?'ok  ':'FAIL'} ${key}: "!" before ${markBefore}; ${t1.lines.length} lines; board "${who.slice(0,60)}"; moves ${moves.join(' ')}; won ${won} ("${winLine.slice(0,40)}"); after: cleared ${after.cleared}, "!" ${after.mark}, back in ${after.place}, can move ${after.free}; talk again: ${t2.duel?'ANOTHER DUEL':'"'+(t2.lines[t2.lines.length-1]||'').slice(0,70)+'"'}`);
  if(t2.duel){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(800);}
}
if(!keys.length){fails++;console.log('FAIL no challengers found');}
console.log(`challengers: ${keys.length-fails}/${keys.length}`);await b.close();})();
