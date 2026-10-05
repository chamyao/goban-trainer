// Tap a story spot from a few steps away: its scene starts as he walks into it, and once it's over
// he must not finish that walk and set the spot off again ("…: done." with no tap).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county--office');});await p.waitForTimeout(1500);await ready();
// walk in a little so the spot is armed, then tap the spot from where he stands
const info=await p.evaluate(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-c1');return {P:[w.player.x,w.player.y],S:[s.x,s.y]};});console.log('start',JSON.stringify(info));
const tapW=async(x,y)=>{const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k,r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
await tapW(info.S[0],info.S[1]);
for(let i=0;i<100;i++){await p.waitForTimeout(100);const s=await p.evaluate(()=>{const w=window.__w;return {busy:w.ui.busy(),cine:!!w.cine,walk:w.walk&&{aim:w.walk.aim&&w.walk.aim.kind,n:w.walk.path.length},P:[Math.round(w.player.x),Math.round(w.player.y)]};});if(s.busy||s.cine){console.log('scene started; walk still pending:',JSON.stringify(s));break;}}
// play the scene through without tapping the world: advance dialogue programmatically, win the problem
for(let i=0;i<300;i++){if(await p.locator('.tk-duel svg').count())break;await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(100);}
await p.waitForTimeout(600);await p.evaluate(()=>window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'})));await p.waitForTimeout(300);await p.locator('.tk-duel-go').tap();
const lines=[];for(let i=0;i<200;i++){await p.waitForTimeout(100);const s=await p.evaluate(()=>{const w=window.__w;const d=document.querySelector('.town-ui .town-dlg');return {busy:w.ui.busy(),cine:!!w.cine,line:d&&!d.hidden?document.querySelector('.town-ui .town-en').textContent:null,walk:!!w.walk};});
  if(s.line&&lines[lines.length-1]!==s.line){lines.push(s.line);console.log(' line:',s.line.slice(0,100));}
  if(s.busy)await p.evaluate(()=>window.__w.ui.advance());}
console.log(lines.some(l=>/: done\.\)/.test(l))?'FAIL the spot went off again by itself after its scene (no taps)':'ok: the spot stayed quiet after its scene');
await p.screenshot({path:SP+'/spot-tap-once.png'});await b.close();})();
