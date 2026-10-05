const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const PLACE=process.argv[2]||'lousang-village';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();
if(await p.evaluate(()=>window.__w.placeId)!==PLACE){await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},PLACE);await p.waitForTimeout(1500);await ready();}
const scr=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k, r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);
const tapW=async(x,y)=>{const [a,b2]=await scr(x,y);await p.touchscreen.tap(a,b2);};
const st=()=>p.evaluate(()=>{const w=window.__w,G=w.walkGrid();return {startFree:G.free(Math.floor(w.player.x/8),Math.floor((w.player.y-3)/8)),p:[Math.round(w.player.x),Math.round(w.player.y)],busy:w.ui.busy(),leaving:w.leaving,cine:!!w.cine,seated:w.seated,walk:w.walk&&{n:w.walk.path.length,stuck:Math.round(w.walk.stuck)}};});
p.on('console',m=>{if(m.text().startsWith('T|'))console.log(m.text().slice(0,400));});
await p.evaluate(()=>{const w=window.__w;const t=w.talk.bind(w);w.talk=(st,d,sty)=>{console.log('T|talk '+JSON.stringify(st&&st[0]).slice(0,60)+' '+new Error().stack.split('\n').slice(2,7).map(x=>x.trim().split(' ')[1]).join('<'));return t(st,d,sty);};
 const ta=w.tapAt.bind(w);w.tapAt=(x,y)=>{console.log('T|tapAt '+Math.round(x)+','+Math.round(y)+' busy='+w.ui.busy());return ta(x,y);};});
const n=await p.evaluate(()=>window.__w.npcs.length);
let fails=0;
for(let round=0;round<2;round++) for(let i=0;i<n;i++){
  if(await p.evaluate(pl=>window.__w.placeId!==pl,PLACE)){await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},PLACE);await p.waitForTimeout(1500);await ready();}
  const np=await p.evaluate(i=>{const n=window.__w.npcs[i];if(!n)return null;const s=n.spr;return s.visible?[s.x,s.y-8]:null;},i); if(!np) continue;
  // bring the npc on screen: walk there by taps first if far
  await p.evaluate(([x,y])=>{const w=window.__w;if(Math.hypot(w.player.x-x,w.player.y-y)>120)w.player.setPosition(x+40,y+30);},np); await p.waitForTimeout(700);
  // stand them still: a villager who wanders off between the look and the tap leaves the tap on a building
  const np2=await p.evaluate(i=>{const n=window.__w.npcs[i];if(!n)return null;n.wander=false;n.spr.setVelocity&&n.spr.setVelocity(0);return [n.spr.x,n.spr.y-8];},i); if(!np2) continue;
  await tapW(np2[0],np2[1]);
  let talked=false;
  for(let k=0;k<30;k++){await p.waitForTimeout(250);const s=await st();if(s.busy){talked=true;const [a,b2]=await scr(np2[0],np2[1]-40);await p.touchscreen.tap(a,b2);} else if(talked) break;}
  if(await p.locator('.tk-duel').count()){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(800);}
  await p.waitForTimeout(300);
  // now tap the ground in 4 directions around Liu Bei
  for(const [dx,dy] of [[50,0],[-50,0],[0,40],[0,-40]]){
    if(await p.evaluate(()=>window.__w.ui.busy())){await p.evaluate(()=>{while(window.__w.ui.busy())window.__w.ui.advance();});await p.waitForTimeout(200);}
    const s0=await st(); if(s0.leaving){await p.waitForTimeout(1500);await ready();break;} const tx=s0.p[0]+dx, ty=s0.p[1]+dy;
    // only taps the game can route somewhere else: it aims at y+4 and snaps a blocked tap to the
    // nearest open cell, which next to a fence can be the one he stands on (no move is right then)
    const free=await p.evaluate(([x,y])=>{const w=window.__w,G=w.walkGrid();if(!G.free(Math.floor(x/8),Math.floor((y+1)/8)))return false;
      const path=w.findPath(w.player.x,w.player.y-3,x,y+1);return !!path&&path.length>0&&Math.hypot(path[path.length-1].x-w.player.x,path[path.length-1].y-w.player.y+3)>=8;},[tx,ty]);
    if(!free) continue;
    if(await p.evaluate(([x,y])=>window.__w.npcs.some(n=>n.spr.visible&&Math.hypot(n.spr.x-x,n.spr.y-8-y)<22),[tx,ty])) continue;
    await tapW(tx,ty); await p.waitForTimeout(900);
    if(await p.evaluate(pl=>!window.__w||window.__w.placeId!==pl,PLACE)){await p.waitForTimeout(800);await ready();await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},PLACE);await p.waitForTimeout(1500);await ready();break;}
    const s1=await st(); const moved=Math.hypot(s1.p[0]-s0.p[0],s1.p[1]-s0.p[1]);
    if(moved<6){fails++;console.log(`FAIL npc ${i} (${await p.evaluate(i=>(window.__w.npcs[i]||{}).sprite,i)}) talked=${talked}: tap ${dx},${dy} didn't move`,JSON.stringify(s0),JSON.stringify(s1));}
  }
}
console.log('fails',fails,'of npcs',n);
await b.close();})();
