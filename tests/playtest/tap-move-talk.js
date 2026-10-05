const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.locator('.tk-map').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
console.log('game size', await p.evaluate(()=>[window.__w.scale.width,window.__w.scale.height]), '| map box', JSON.stringify(await p.locator('.tk-map').boundingBox()), '| hint:', await p.locator('.tk-menu-keys').textContent());
// world point -> page point
const toPage=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);
const pos=()=>p.evaluate(()=>[Math.round(window.__w.player.x),Math.round(window.__w.player.y)]);
// tap the ground some way off
const start=await pos(); const tgt=await p.evaluate(()=>{const w=window.__w,P=w.player,G=w.walkGrid();for(const [dx,dy] of [[60,30],[-60,30],[60,-30],[-60,-30],[0,50]]){const x=P.x+dx,y=P.y+dy;if(G.free(Math.floor(x/8),Math.floor((y-3)/8)))return [x,y];}return [P.x,P.y+40];});
let [tx,ty]=await toPage(tgt[0],tgt[1]); await p.touchscreen.tap(tx,ty); await p.waitForTimeout(1600);
const end=await pos(); console.log('tap ground', start,'->',end,'target',tgt.map(Math.round),'| dist left', Math.round(Math.hypot(end[0]-tgt[0],end[1]-tgt[1])));
await p.screenshot({path:SP+'/mobile1.png'});
// tap a townsperson: walk up and talk
const n=await p.evaluate(()=>{const w=window.__w,n=w.npcs.filter(n=>n.say&&n.say.length&&!n.challenge).sort((a,b)=>Math.hypot(a.spr.x-w.player.x,a.spr.y-w.player.y)-Math.hypot(b.spr.x-w.player.x,b.spr.y-w.player.y))[0];return [n.spr.x,n.spr.y-8,n.id];});
[tx,ty]=await toPage(n[0],n[1]); await p.touchscreen.tap(tx,ty);
for(let i=0;i<40&&!(await p.evaluate(()=>window.__w.ui.busy()));i++) await p.waitForTimeout(150);
console.log('tap person', n[2], '-> talking:', await p.evaluate(()=>window.__w.ui.busy()), '|', await p.locator('.town-ui .town-zh').textContent());
await p.waitForTimeout(1500); await p.screenshot({path:SP+'/mobile2.png'});
await p.touchscreen.tap(tx,ty); await p.waitForTimeout(300); await p.touchscreen.tap(tx,ty); await p.waitForTimeout(400);
console.log('tapped through: still talking', await p.evaluate(()=>window.__w.ui.busy()));
await b.close();})();
