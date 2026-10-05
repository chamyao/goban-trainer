const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start'].forEach(k=>TK.markCleared(k));});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();
const scr=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const [a,c]=await scr(x,y);await p.touchscreen.tap(a,c);};
const busy=()=>p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
// 1) travel straight to the county office's room
await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county--office');});await p.waitForTimeout(1500);await ready();await p.waitForTimeout(1500);
check(await busy(),'office (a room): the scene starts as you come in');
// a restored position in the room (left its problem, reload) doesn't start it again by itself
for(let k=0;k<200&&!(await p.locator('.tk-duel svg').count());k++){await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(100);}
if(await p.locator('.tk-duel svg').count()){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(1500);}
for(let k=0;k<40&&await busy();k++){await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(100);}
await ready();await p.waitForTimeout(1500);
check(!(await busy())&&!(await p.evaluate(()=>TK.cleared('1-c1'))),'office: back from leaving its problem, the scene waits (not cleared, not replaying)');
await p.reload();await p.waitForTimeout(1500);{const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();}
for(let k=0;k<6;k++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
await ready();await p.waitForTimeout(2000);
const here=await p.evaluate(()=>window.__w.placeId);
check(here!=='zhuo-county--office'||!(await busy()),'office: after a reload ('+here+'), the scene waits for a tap');
if(here==='zhuo-county--office'){const s2=await p.evaluate(()=>{const s=Object.values(window.__w.spots).find(s=>s.node==='1-c1');return [s.x,s.y];});await tapW(s2[0],s2[1]);
  let st=false;for(let k=0;k<30&&!(st=await busy());k++)await p.waitForTimeout(150);check(st,'office: a tap on the desk starts it');}
// 2) travel (map) to a place whose default arrival is on the spot: mark up to n4 cleared so n5 is open
await p.evaluate(()=>{['1-c1','1-n1','1-i1','1-n2','1-as','1-n3','1-n4','1-t1'].forEach(k=>TK.markCleared(k));});
await p.evaluate(()=>{window.__w.ui.busy=()=>false;window.__w.cine=null;window.__w.leaving=false;window.__w.go('guangzong-road');});await p.waitForTimeout(1500);await ready();await p.waitForTimeout(2000);
const P0=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y,Math.round(Math.hypot(window.__w.player.x-Object.values(window.__w.spots).find(s=>s.node==='1-n5').x,window.__w.player.y-Object.values(window.__w.spots).find(s=>s.node==='1-n5').y))]);
check(!(await busy()),'guangzong (outdoors): arrived '+P0[2]+' px from the spot; the scene waits while he stands');
// walk up to it (the arrival point is a way off now): tap the spot
const g5=await p.evaluate(()=>{const s=Object.values(window.__w.spots).find(s=>s.node==='1-n5');return [s.x,s.y];});
if(P0[2]>60){await p.evaluate(([x,y])=>{const w=window.__w;w.player.setPosition(x,y+90);},g5);await p.waitForTimeout(600);}
await tapW(g5[0],g5[1]); await p.waitForTimeout(1500);
let started=false;for(let k=0;k<20&&!(started=await busy());k++)await p.waitForTimeout(150);check(started,'guangzong: walking up to the spot, the scene starts');
console.log(`scene-arming: ${fails} failed`);
await b.close();})();
