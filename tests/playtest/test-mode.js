// The page's test mode (?test=1, kept in localStorage tk-test; ?test=0 clears it): problems get a
// "Skip (test)" key that wins them. Without test mode there's no such key.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
const open=async q=>{await p.goto(BASE+q+'#/tk/1');await p.waitForTimeout(1500);
  for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);await p.waitForTimeout(500);};
const duel=async key=>{await p.evaluate(k=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===k);w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.act();},key);
  for(let i=0;i<80&&!(await p.locator('.tk-duel svg').count());i++){await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());await p.waitForTimeout(100);}await p.waitForTimeout(600);};
const skipKey=()=>p.locator('.tk-duel-keys button',{hasText:'Skip'});
await p.goto(BASE+'#/tk/1');await p.waitForTimeout(1000);await p.evaluate(()=>{localStorage.clear();TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});
await open('');
const key=await p.evaluate(()=>window.__w.npcs.find(n=>n.challenge).challenge);
await duel(key);
check(await p.locator('.tk-duel svg').count()>0,'a challenger\'s problem opens');
check(await skipKey().count()===0,'without test mode there is no Skip key: '+(await p.locator('.tk-duel-keys button').allTextContents()).map(s=>s.trim()).join(' | '));
await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(800);
await open('?test=1');
check(await p.evaluate(()=>localStorage.getItem('tk-test')==='1'),'?test=1 is kept in localStorage tk-test');
await duel(key);
check(await skipKey().count()===1&&await skipKey().isVisible(),'in test mode the problem has a Skip key');
await skipKey().tap();await p.waitForTimeout(800);
const won=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return !!d&&d.classList.contains('win');});
check(won&&await p.evaluate(k=>TK.cleared(k),key),'Skip wins it: the win line shows and the problem is cleared');
if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap();await p.waitForTimeout(800);
await open('');
check(await p.evaluate(()=>localStorage.getItem('tk-test')==='1'),'test mode stays on after reloading without ?test');
await open('?test=0');
check(await p.evaluate(()=>localStorage.getItem('tk-test')!=='1'),'?test=0 turns it off');
const key2=await p.evaluate(()=>{const n=window.__w.npcs.find(n=>n.challenge&&!TK.cleared(n.challenge));return n&&n.challenge;});
if(key2){await duel(key2);check(await skipKey().count()===0,'and the Skip key is gone again');}
console.log(`test-mode: ${fails} failed`);await b.close();})();
