const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();
await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('the-peach-garden');});await p.waitForTimeout(1500);await ready();
const stars=()=>p.evaluate(()=>window.__w.npcs.filter(n=>n.until==='1-n2').map(n=>n.who+':'+(n.spr.visible?'shown':'hidden')+'@'+n.spr.alpha.toFixed(1)).join(' '));
const s=await p.evaluate(()=>{const s=Object.values(window.__w.spots).find(s=>s.node==='1-n2');window.__w.player.setPosition(s.x,s.y+40);return [s.x,s.y];});
await p.waitForTimeout(1000);
console.log('before:',await stars());
const scr=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);
let [a,c]=await scr(s[0],s[1]); await p.touchscreen.tap(a,c);
const center=async()=>{const r=await p.evaluate(()=>{const c=window.__w.game.canvas.getBoundingClientRect();return [c.left+c.width/2,c.top+c.height*.6]});await p.touchscreen.tap(r[0],r[1]);};
let shotStar=false;
for(let i=0;i<80 && !(await p.locator('.tk-duel svg').count());i++){
  await p.waitForTimeout(350);
  const line=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?(d.querySelector('.town-who').textContent+': '+d.querySelector('.town-en').textContent):''});
  if(!shotStar && /Old man|Star|老人/.test(line)){shotStar=true;console.log('the immortals speak:',line.slice(0,80),'|',await stars());await p.screenshot({path:SP+'/stars-speak.png'});}
  if(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)) await center();
}
await p.waitForTimeout(800);
console.log('problem up:',await p.locator('.tk-duel svg').count(),'|',await stars());
await p.screenshot({path:SP+'/stars-problem.png'});
await p.waitForTimeout(900);await p.evaluate(()=>window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'})));await p.waitForTimeout(400);
console.log('just solved, board still up:',await stars());await p.locator('.tk-duel-go').tap(); await p.waitForTimeout(350);console.log('board closed:',await p.locator('.tk-duel').count(),'|',await stars());await p.screenshot({path:SP+'/stars-closed.png'});
for(let i=0;i<10;i++){const line=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?(d.querySelector('.town-who').textContent+': '+d.querySelector('.town-en').textContent):''});
  if(line){console.log('after the win:',line.slice(0,80),'|',await stars());await p.screenshot({path:SP+'/stars-after.png'});break;} await p.waitForTimeout(300);}
for(let i=0;i<14;i++){const line=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.querySelector('.town-en').textContent:''});
  if(/old men are gone/.test(line)){console.log('narration "gone":',await stars());await p.screenshot({path:SP+'/stars-gone.png'});break;}
  await center();await p.waitForTimeout(400);}
console.log('then:',await stars());
await b.close();})();
