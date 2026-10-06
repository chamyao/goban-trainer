const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BOOK=+(process.env.BOOK||1);   // BOOK=2 / 3: the books before it are done, this one played
const shot=n=>p.screenshot({path:SP+'/mfr_'+n+'.png'});
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&window.__w.ui)))return;await p.waitForTimeout(200);}};
const busy=()=>p.evaluate(()=>!!(window.__w&&window.__w.ui.busy()));
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const [a,b2]=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(a,b2);};
const act=async()=>{if(!(await p.evaluate(()=>!!window.__w&&(window.__w.ui.busy()||!!window.__w.cine)&&!document.querySelector('.tk-duel'))))return;   /* never a tap on an open board (it would be a move) */const box=await p.evaluate(()=>{const r=window.__w.game.canvas.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height*0.6];});await p.touchscreen.tap(box[0],box[1]);};
const tapSpot=async node=>{const s=await p.evaluate(node=>{const s=Object.values(window.__w.spots).find(s=>s.node===node);return s&&[s.x,s.y];},node);if(s)await tapW(s[0],s[1]);};
const line=()=>p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?(d.querySelector('.town-who').textContent?d.querySelector('.town-who').textContent+': ':'')+d.querySelector('.town-en').textContent:null});
const front=node=>p.evaluate(node=>{const w=window.__w;const s=Object.values(w.spots).find(s=>s.node===node);if(!s)return 'nospot';
  for(const [dx,dy,f] of [[0,14,'up'],[0,-12,'down'],[-14,2,'right'],[14,2,'left']]){w.player.setPosition(s.x+dx,s.y+dy);w.player.facing=f;const tg=w.target();if(tg&&tg.kind==='spot')return f;}return 'none';},node);
const go=async place=>{await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},place);await p.waitForTimeout(1000);await ready();await p.waitForTimeout(400);};
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1500);const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
await ready();
if(BOOK>1){await p.evaluate(B=>{for(let n=1;n<Math.min(B,4);n++)if(TK.world(n))TK.world(n).nodes.forEach(x=>{TK.markCleared(x.key);TK.markSeen(n+':'+x.scene);});localStorage.setItem('tk-guide','off');localStorage.setItem('tk-book',String(B));},BOOK);
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(BOOK>9?'?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:''):(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:''))+'#/tk/'+BOOK);await p.reload();await p.waitForTimeout(1500);
  for(let i=0;i<8;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
  await ready();}
console.log('fresh goal:',await p.evaluate(()=>document.querySelector('.town-goal').textContent),'| next:',await p.evaluate(()=>window.__w.nextMain().node));
// the beats in the order the game gives them (nextMain); a gated beat gets what it needs first (the
// flanks, the blood, the ridges have their own tests: blackwind, side-stories)
// victory banners (大捷) as they appear: counted per beat; the White Gate (3-boss) is no victory and shows none
await p.evaluate(()=>{window.__vic=0;new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.classList&&n.classList.contains('tk-victory'))window.__vic++;}).observe(document.body,{childList:true,subtree:true});});
let guard=0,lastLight;
for(;;){
  const nx=await p.evaluate(B=>{const w=window.__w,q=w&&w.nextMain();if(!q||w.w.n!==B||!new RegExp('^'+B+'-').test(q.node))return null;
    for(const g of q.gate||[])for(const n of [].concat(g.needs||[])){const [k,v]=String(n).split(':');if(k==='item')WorldItems.add(w.w,v);if(k==='mark')WorldMarks.add(w.w,v);if(k==='node')TK.markCleared(/^\d+-/.test(v)?v:w.w.n+'-'+v);}
    return [q.place,q.node];},BOOK);
  if(!nx||++guard>40)break;const [place,node]=nx;

  
  if(node==='1-n6')await p.evaluate(()=>TK.markCleared('1-bs'));
  // Black Wind's gathering and the ridges have their own test (blackwind): supply them here
  if(node==='1-boss')await p.evaluate(()=>{['pigblood','sheepblood','dogblood'].forEach(k=>WorldItems.add(TK.world(1),k));['ridge_left','ridge_right'].forEach(m=>WorldMarks.add(TK.world(1),m));});
  await go(place);
  const lightIn=await p.evaluate(()=>(window.__w.st&&window.__w.st.light)||'day');
  // the light the last beat left (night after a night scene) is still the light here: it carries onto the next map
  const NEXT={night:'dawn',dawn:'day',day:'dusk',dusk:'night'};   // time moving on a step (dawn after the night) is the story, not a lost light
  if(typeof lastLight!=='undefined'&&lastLight!==lightIn&&NEXT[lastLight]!==lightIn)console.log(`FAIL the light didn't carry over: the last beat left ${lastLight}, ${node} at ${place} opens in ${lightIn}`);
  console.log(`\n=== ${node} @ ${place}  face ${await front(node)}  light on arrival: ${lightIn}`);
  await p.evaluate(()=>{const w=window.__w;w.player.y+=10;}); await p.waitForTimeout(1200); await tapSpot(node); await p.waitForTimeout(1500); await p.waitForTimeout(200);
  // a sight puzzle (seen by one watcher, not by the other): stand where one sees her and the other, whichever way he turns, doesn't
  const sight=await p.evaluate(node=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node===node);if(!s||!s.sight)return null;const T=w.tw||16;
    const by=id=>w.npcs.find(n=>n.watch&&(n.watch.id===id||n.id===id)),A=by(s.sight.seen_by),B=by(s.sight.unseen_by);if(!A)return 'no watcher '+s.sight.seen_by;
    const dirs=B?(B.watch.turns.length?B.watch.turns:[B.watch.dir]):[];let best=null;
    for(let y=0;y<80;y++)for(let x=0;x<80;x++){const P={x:(x+.5)*T,y:(y+.9)*T};if(w.ray(P.x,P.y-6,0,1)<1||!w.sees(A,P))continue;
      if(dirs.some(d=>{const o=B.watch.dir;B.watch.dir=d;const r=w.sees(B,P);B.watch.dir=o;return r;}))continue;
      const d=Math.hypot(P.x-s.x,P.y-s.y);if(!best||d<best.d)best={...P,d};}
    if(!best)return 'none';w.walk=null;w.auto=null;w.player.setVelocity(0);w.player.setPosition(best.x,best.y);return Math.round(best.x)+','+Math.round(best.y);},node);
  if(sight){console.log('  sight puzzle: standing at '+sight);if(!/^\d/.test(sight))console.log(`FAIL ${node}: no place where ${'one watcher sees you and the other does not'} (${sight})`);await p.waitForTimeout(1500);}
  const before=[];let t0=Date.now();
  const noBoard=await p.evaluate(n=>TK.world(window.__w.w.n).nodes.find(x=>x.key===n).board===false,node);
  for(let i=0;i<500;i++){ if(await p.locator('.tk-duel svg').count())break; if(noBoard&&i>20&&!(await busy())&&!(await p.evaluate(()=>!!window.__w.cine)))break; const l=await line(); if(l&&before[before.length-1]!==l)before.push(l); await act(); await p.waitForTimeout(80);}
  console.log(' BEFORE ('+((Date.now()-t0)/1000).toFixed(0)+'s): '+before.map(x=>x.slice(0,90)).join('\n   '));
  if(noBoard){const ok=await p.evaluate(n=>TK.cleared(n),node);lastLight=await p.evaluate(()=>(window.__w.st&&window.__w.st.light)||'day');await p.waitForTimeout(1500);console.log('  after it: '+await p.evaluate(()=>{const w=window.__w;return `${w.lead} in ${w.placeId} at ${Math.round(w.player.x)},${Math.round(w.player.y)}`;}));console.log(' (no board) cleared',ok,'light after:',lastLight);if(!ok)console.log('FAIL '+node+' not cleared by its scene');continue;}
  await p.waitForTimeout(900);
  const who=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.querySelector('.town-who').textContent+' | '+d.querySelector('.town-en').textContent:'?'});
  console.log(' BOARD: '+who); await shot(node);
  await p.evaluate(()=>{window.__trainer&&(window.__trainer.flawed=null);window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(300);
  for(let k=0;k<25&&!(await p.locator('.tk-duel-go').count());k++)await p.waitForTimeout(200);
  if(!(await p.locator('.tk-duel-go').count())){console.log('FAIL '+node+': no Continue after the board was solved; the board says: '+await p.evaluate(()=>{const d=document.querySelector('.tk-duel');return d?d.textContent.replace(/\s+/g,' ').slice(0,200):'(no board)';})+' | rest '+await p.evaluate(n=>TK.restLeft(n),node));break;}
  await p.locator('.tk-duel-go').tap(); await p.waitForTimeout(500);
  const after=[];t0=Date.now();
  let boards=1;
  for(let i=0;i<600;i++){
    // a scene with several boards (NODE~1, NODE~2…): the next comes up after more lines; solve it the same way
    if(await p.locator('.tk-duel svg').count()&&!(await p.locator('.tk-duel-go').count())){await p.waitForTimeout(700);boards++;const w2=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.querySelector('.town-en').textContent:'?';});after.push(`[board ${boards}] ${w2}`);
      await p.evaluate(()=>{window.__trainer&&(window.__trainer.flawed=null);window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(300);await p.locator('.tk-duel-go').first().tap().catch(()=>{});await p.waitForTimeout(500);continue;}
    if(!(await busy())&&!(await p.evaluate(()=>!!window.__w.cine)))break; const l=await line(); if(l&&after[after.length-1]!==l)after.push(l); if(await p.locator('.tk-scroll-go').count()){after.push('[scroll] '+await p.evaluate(()=>document.querySelector('.tk-scroll h3')&&document.querySelector('.tk-scroll h3').textContent));await p.locator('.tk-scroll-go').first().tap();} await act(); await p.waitForTimeout(80);}
  console.log(' AFTER ('+((Date.now()-t0)/1000).toFixed(0)+'s): '+after.map(x=>x.slice(0,90)).join('\n   '));
  for(let k=0;k<20;k++){await p.waitForTimeout(300);const g=p.locator('.tk-scroll-go');if(await g.count()){after.push('[scroll] '+await p.evaluate(()=>document.querySelector('.tk-scroll h3')&&document.querySelector('.tk-scroll h3').textContent));await g.first().tap();k=0;}}
  console.log(' AFTER2: '+after.filter(x=>x.startsWith('[scroll]')).join(' | '));
  const vic=await p.evaluate(()=>{const v=window.__vic||0;window.__vic=0;return v;});
  if(vic)console.log(`  victory banner shown (${vic})`);
  if(node==='3-boss'&&vic)console.log('FAIL the White Gate shows a victory banner');
  lastLight=await p.evaluate(()=>(window.__w.st&&window.__w.st.light)||'day');
  await p.waitForTimeout(1500);console.log('  after it: '+await p.evaluate(()=>{const w=window.__w;return `${w.lead} in ${w.placeId} at ${Math.round(w.player.x)},${Math.round(w.player.y)}`;}));
  console.log(' cleared',await p.evaluate(n=>TK.cleared(n),node),'light after:',lastLight,'goal:',await p.evaluate(()=>document.querySelector('.town-goal')&&document.querySelector('.town-goal').textContent.slice(0,60)));
}
await b.close();})();
