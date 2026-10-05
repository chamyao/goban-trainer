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
// tap an empty point on the board: a stone should go down (or the result fire)
const before=await p.evaluate(()=>window.__trainer.grid.flat().filter(Boolean).length);
const bb=await p.locator('.tk-duel svg').boundingBox(); await p.touchscreen.tap(bb.x+bb.width*0.5, bb.y+bb.height*0.9); await p.waitForTimeout(700);
console.log('stones before/after a tap on the board:', before, await p.evaluate(()=>window.__trainer.grid.flat().filter(Boolean).length));
await p.locator('.tk-duel-key',{hasText:'Leave'}).tap(); await p.waitForTimeout(600); console.log('left the duel:', !(await p.locator('.tk-duel').count()));
await b.close();})();
