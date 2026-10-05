const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await b.newPage({viewport:{width:1280,height:900}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(n=>n.challenge);w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.act();});
for(let i=0;i<60&&!(await p.locator('.tk-duel svg').count());i++){await p.evaluate(()=>window.__w.act());await p.waitForTimeout(100);}
await p.waitForTimeout(500);
const stones=()=>p.evaluate(()=>window.__trainer?window.__trainer.grid.flat().filter(Boolean).length:-1);
const start=await stones();
// play a stone so the position differs, then fail
await p.evaluate(()=>window.dispatchEvent(new CustomEvent('tczw:result',{detail:'bad'}))); await p.waitForTimeout(400);
console.log('right after the slip: rest chip', await p.locator('.tk-rest-chip').count(), '| line:', await p.locator('.tk-duel-dlg .town-en').textContent());
await p.waitForTimeout(2200);
const bg=await p.evaluate(()=>{const r=document.querySelector('.tk-rest');return r?getComputedStyle(r).backgroundColor:'none';});
console.log('after 2 s: board reset to start', (await stones())===start, '| held:', await p.locator('.tk-rest').count(), '| overlay background:', bg, '| chip:', await p.locator('.tk-rest-chip').textContent(), '| line:', await p.locator('.tk-duel-dlg .town-en').textContent());
await p.screenshot({path:SP+'/rest2.png',clip:await p.locator('.tk-map').boundingBox()});
await p.evaluate(()=>{const d=TK.ls('tk-rest');for(const k in d)d[k]=Date.now()+600;TK.lsSet('tk-rest',d);}); await p.waitForTimeout(1200);
console.log('rest over: held', await p.locator('.tk-rest').count(), '| line:', await p.locator('.tk-duel-dlg .town-en').textContent());
await b.close();})();
