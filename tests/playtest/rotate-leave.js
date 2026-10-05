// Phone: turn it sideways and back in the middle of a scene and in the middle of a problem; the
// dialogue and the board stay on screen and taps keep working. Then leave a story problem halfway
// (Leave): back in the world, the beat isn't cleared, the goal still points at it, and walking back
// to the spot plays it again.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();
const PORT={width:390,height:664},LAND={width:750,height:342};
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k,r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
const dlg=()=>p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(!d||d.hidden)return null;const r=d.getBoundingClientRect();return {text:d.querySelector('.town-en').textContent,inView:r.top>=0&&r.left>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1,box:[r.left,r.top,r.width,r.height].map(Math.round)};});
const tapDlg=async()=>{const d=await dlg();if(d)await p.touchscreen.tap(d.box[0]+d.box[2]/2,d.box[1]+d.box[3]/2);};
// start the notice scene (1-n1) by tapping its spot
const spot=await p.evaluate(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-n1');w.player.setPosition(s.x,s.y+50);return [s.x,s.y];});
await p.waitForTimeout(600);await tapW(...spot);
let d=null;for(let i=0;i<100&&!(d=await dlg());i++)await p.waitForTimeout(150);
for(let i=0;i<4&&d;i++){await tapDlg();await p.waitForTimeout(250);d=await dlg();}   // a couple of lines in
const lineBefore=d&&d.text;
await p.setViewportSize(LAND);await p.waitForTimeout(900);d=await dlg();await p.screenshot({path:SP+'/rotate-scene-landscape.png'});
check(!!d&&d.inView,'scene, turned sideways: the dialogue is still up and on screen '+(d?JSON.stringify(d.box):''));
const cv=await p.evaluate(()=>{const r=window.__w.game.canvas.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];});
check(Math.abs(cv[0]-LAND.width)<4&&Math.abs(cv[1]-LAND.height)<4,'the game fills the turned screen: '+cv.join('x'));
await tapDlg();await p.waitForTimeout(400);d=await dlg();
check(!!d&&d.text!==lineBefore||(await p.locator('.tk-duel svg').count())>0,'a tap still moves the scene on');
await p.setViewportSize(PORT);await p.waitForTimeout(900);
// on to the problem, rotate there
for(let i=0;i<200&&!(await p.locator('.tk-duel svg').count());i++){if(await dlg())await tapDlg();await p.waitForTimeout(150);}
check(await p.locator('.tk-duel svg').count()>0,'the problem opens');
await p.waitForTimeout(800);
const boardIn=()=>p.evaluate(()=>{const s=document.querySelector('.tk-duel svg').getBoundingClientRect(),l=[...document.querySelectorAll('.tk-duel-key')].map(b=>b.getBoundingClientRect());
  return {board:[s.left,s.top,s.width,s.height].map(Math.round),inView:s.top>=-1&&s.left>=-1&&s.bottom<=innerHeight+1&&s.right<=innerWidth+1,keys:l.every(r=>r.bottom<=innerHeight+1&&r.right<=innerWidth+1)};});
await p.setViewportSize(LAND);await p.waitForTimeout(900);const bl=await boardIn();await p.screenshot({path:SP+'/rotate-duel-landscape.png'});
check(bl.inView,'problem, turned sideways: the whole board is on screen '+JSON.stringify(bl.board));
console.log((bl.keys?'ok   ':'NOTE ')+'turned sideways, the Undo/Hint/Reset/Leave keys are on screen');
await p.setViewportSize(PORT);await p.waitForTimeout(900);const bp=await boardIn();
check(bp.inView,'turned back: the whole board is on screen '+JSON.stringify(bp.board));
// leave halfway: one right move, then Leave
const mv=await p.evaluate(()=>{const t=window.__trainer;const L=t.p.lines.find(L=>L[0]===1);const m=L[1],c=m.charCodeAt(0)-97,r=m.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));const R=el.getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2,L.length];});
if(mv[2]>3){await p.touchscreen.tap(mv[0],mv[1]);/* tap-to-preview: a second tap plays the ghost */if(await p.evaluate(()=>!!(window.__trainer&&window.__trainer.goban.ghost)))await p.touchscreen.tap(mv[0],mv[1]);await p.waitForTimeout(1000);}
await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(1200);
for(let i=0;i<30&&await dlg();i++){await tapDlg();await p.waitForTimeout(200);}
await ready();
const after=await p.evaluate(()=>({duel:!!document.querySelector('.tk-duel svg'),cleared:TK.cleared('1-n1'),next:window.__w.nextMain().node,free:window.__w.canMove(),goal:document.querySelector('.town-goal').textContent}));
check(!after.duel&&!after.cleared&&after.next==='1-n1'&&after.free,`after Leave: back in the world, 1-n1 cleared ${after.cleared}, next ${after.next}, can move ${after.free}, goal "${after.goal.slice(0,30)}"`);
// walk away and back to the spot: it plays again
await p.evaluate(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-n1');w.player.setPosition(s.x,s.y+90);});await p.waitForTimeout(700);
await tapW(...spot);let again=false;for(let i=0;i<200;i++){if(await p.locator('.tk-duel svg').count()){again=true;break;}if(await dlg())await tapDlg();await p.waitForTimeout(150);}
check(again,'back at the spot, the scene and its problem play again');
console.log(`rotate-leave: ${fails} failed`);await b.close();})();
