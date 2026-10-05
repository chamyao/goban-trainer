const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await b.newPage({viewport:{width:1280,height:800}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const scr=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);
const n=await p.evaluate(()=>{const s=window.__w.npcs.find(n=>n.spr.visible).spr;return [s.x,s.y-8];});
let [a,b2]=await scr(n[0],n[1]); await p.mouse.move(a,b2); await p.waitForTimeout(100);
console.log('cursor over a person:',await p.evaluate(()=>window.__w.game.canvas.style.cursor||'(default)'));
const P0=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y]);
[a,b2]=await scr(P0[0]+30,P0[1]+30); await p.mouse.move(a,b2); await p.waitForTimeout(100);
console.log('cursor over ground:',await p.evaluate(()=>window.__w.game.canvas.style.cursor||'(default)'));
// hold and drag: press, then sweep right in steps
await p.mouse.down(); 
const path=[];
for(let i=0;i<12;i++){await p.mouse.move(a+i*25,b2+(i<6?0:i*8),{steps:3});await p.waitForTimeout(200);path.push(await p.evaluate(()=>[Math.round(window.__w.player.x),Math.round(window.__w.player.y)]));}
await p.mouse.up();
console.log('drag: player went',JSON.stringify(path[0]),'->',JSON.stringify(path[5]),'->',JSON.stringify(path[11]));
await b.close();})();
