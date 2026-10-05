const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
const ctx=await b.newContext({...devices[process.env.PLAYTEST_DEVICE||'iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.locator('.tk-map').scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
const toPage=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k, r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);
// bring the challenger on screen first (wherever the map put him)
await p.evaluate(()=>{const n=window.__w.npcs.find(n=>n.challenge);window.__w.player.setPosition(n.spr.x+50,n.spr.y+30);});await p.waitForTimeout(1200);
const n=await p.evaluate(()=>{const n=window.__w.npcs.find(n=>n.challenge);return [n.spr.x,n.spr.y-8];});
let [tx,ty]=await toPage(n[0],n[1]); await p.touchscreen.tap(tx,ty);
for(let i=0;i<60&&!(await p.locator('.tk-duel svg').count());i++){ if(await p.evaluate(()=>window.__w.ui.busy())) await p.touchscreen.tap(tx,ty); await p.waitForTimeout(250);}
await p.waitForTimeout(900);
console.log('duel full-screen:', await p.locator('.tk-duel-full').count(), '| board box', JSON.stringify(await p.locator('.tk-duel svg').boundingBox()));
await p.screenshot({path:SP+'/mobile3.png'});
// a tap on an empty point: where points are under 28 px apart (tap to preview) the first tap shows a
// ghost stone and plays nothing, a tap elsewhere moves the ghost, a second tap on it plays; else one tap plays
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
const B=()=>p.evaluate(()=>{const t=window.__trainer,g=t.goban;return {stones:t.grid.flat().filter(Boolean).length,played:t.played.length,ghost:g.ghost?[g.ghost.c,g.ghost.r]:null,needs:g.needsConfirm(),done:!!t.done};});
const empties=await p.evaluate(()=>{const t=window.__trainer,g=t.goban;return [...g.svg.querySelectorAll('circle[fill="transparent"]')].map(e=>{const cx=+e.getAttribute('cx'),cy=+e.getAttribute('cy');let c=-1,r=-1;for(let k=0;k<19;k++){if(g.px(k)===cx)c=k;if(g.py(k)===cy)r=k;}const R=e.getBoundingClientRect();return {c,r,x:R.left+R.width/2,y:R.top+R.height/2};}).filter(q=>q.c>=0&&q.r>=0&&!t.grid[q.r][q.c]);});
const A=empties[0],Z=empties[empties.length-1],s0=await B();
console.log(`board points ${await p.evaluate(()=>{const g=window.__trainer.goban;return Math.round(g.svg.getBoundingClientRect().width/g.W*g.cell);})} px apart; tap to preview: ${s0.needs}`);
await p.touchscreen.tap(A.x,A.y);await p.waitForTimeout(500);const s1=await B();
if(s0.needs){
  check(s1.ghost&&s1.ghost[0]===A.c&&s1.ghost[1]===A.r&&s1.played===s0.played,`first tap: a ghost at ${A.c},${A.r} and no move (moves ${s0.played} -> ${s1.played})`);
  await p.touchscreen.tap(Z.x,Z.y);await p.waitForTimeout(500);const s2=await B();
  check(s2.ghost&&s2.ghost[0]===Z.c&&s2.ghost[1]===Z.r&&s2.played===s0.played,`a tap on another point moves the ghost there (${Z.c},${Z.r}), still no move`);
  // ghosts on points that aren't the answer cost nothing: no slip, no rest, the solve still flawless
  const firstMoves=await p.evaluate(()=>[...new Set(window.__trainer.p.lines.map(L=>L[1]))]);
  const W2=empties.filter(q=>!firstMoves.includes(String.fromCharCode(97+q.c)+String.fromCharCode(97+q.r))).slice(0,4);
  for(const q of W2){await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(250);}
  await p.waitForTimeout(1500);
  const sl=await p.evaluate(()=>({rest:!!document.querySelector('.tk-rest'),flawed:window.__trainer.flawed||null,done:window.__trainer.done||null,slip:!!document.querySelector('.tk-duel-dlg.slip')}));
  check(!sl.rest&&!sl.flawed&&!sl.done&&!sl.slip,`ghosts on ${W2.length} wrong points: no slip, no rest, still flawless (${JSON.stringify(sl)})`);
  await p.touchscreen.tap(Z.x,Z.y);await p.waitForTimeout(400);
  await p.touchscreen.tap(Z.x,Z.y);await p.waitForTimeout(900);const s3=await B();
  check(!s3.ghost&&(s3.played>s0.played||s3.done),`a second tap on the ghost plays it (moves ${s0.played} -> ${s3.played})`);
}else check(s1.played>s0.played||s1.done,`one tap plays (moves ${s0.played} -> ${s1.played})`);
await p.locator('.tk-duel-key',{hasText:'Leave'}).tap(); await p.waitForTimeout(600); check(!(await p.locator('.tk-duel').count()),'Leave closes the problem');
console.log(`tap-duel: ${fails} failed`);
await b.close();})();
