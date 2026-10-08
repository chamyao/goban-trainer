// (Book 12, the live book: a player can't reach Books 1-3 without test mode; run.sh runs this with PLAYTEST_LIVE=1)
// The page's test mode: problems get a "Skip (test)" key that wins them; without it there's no such key. ?test=1 lasts
// the browser tab (sessionStorage tk-test): reloads keep it, a new tab doesn't; a player's old for-good localStorage
// tk-test is cleared on load (the user was stuck in test mode from one link); Menu -> Exit test mode and ?test=0 end it.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
const open=async q=>{await p.goto(BASE+q+'#/tk/12');await p.reload();await p.waitForTimeout(1500);   /* a real load each time (the same address would only move the hash) */
  for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);await p.waitForTimeout(500);};
const duel=async key=>{await p.evaluate(k=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===k);w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.act();},key);
  for(let i=0;i<80&&!(await p.locator('.tk-duel svg').count());i++){await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());await p.waitForTimeout(100);}await p.waitForTimeout(600);};
const skipKey=()=>p.locator('.tk-duel-keys button',{hasText:'Skip'});
await p.goto(BASE+'#/tk/12');await p.waitForTimeout(1000);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('tk-guide','off');});
await open('');
const key=await p.evaluate(()=>window.__w.npcs.find(n=>n.challenge&&n.spr.visible&&!TK.cleared(n.challenge)).challenge);
await duel(key);
check(await p.locator('.tk-duel svg').count()>0,'a challenger\'s problem opens');
check(await skipKey().count()===0,'without test mode there is no Skip key: '+(await p.locator('.tk-duel-keys button').allTextContents()).map(s=>s.trim()).join(' | '));
await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(800);
const on=()=>p.evaluate(()=>typeof TK_TEST!=='undefined'&&TK_TEST===true);
await open('?test=1');
check(await on()&&await p.evaluate(()=>sessionStorage.getItem('tk-test')==='1'&&localStorage.getItem('tk-test')===null),'?test=1 turns it on for this tab (sessionStorage tk-test), nothing kept in localStorage');
check(await p.locator('.tk-test-badge').count()>0,'and the page says so: '+((await p.locator('.tk-test-badge').first().textContent().catch(()=>''))||'').trim());
await duel(key);
check(await skipKey().count()===1&&await skipKey().isVisible(),'in test mode the problem has a Skip key');
await skipKey().tap();await p.waitForTimeout(800);
const won=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return !!d&&d.classList.contains('win');});
check(won&&await p.evaluate(k=>TK.cleared(k),key),'Skip wins it: the win line shows and the problem is cleared');
if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap();await p.waitForTimeout(800);
await open('');
check(await on(),'reloading the same tab without ?test: still on');
// a new tab: off
const p0=p;{const p2=await ctx.newPage();await p2.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p2.goto(BASE+'#/tk/12');await p2.waitForTimeout(2000);check(!(await p2.evaluate(()=>typeof TK_TEST!=='undefined'&&TK_TEST)),'a new tab without ?test: off');await p2.close();}
// a player's stale for-good flag (from before): cleared on load, off
await p0.evaluate(()=>{sessionStorage.removeItem('tk-test');localStorage.setItem('tk-test','1');localStorage.removeItem('tk-harness');});
await open('');
check(!(await on())&&await p.evaluate(()=>localStorage.getItem('tk-test')===null),'a stale localStorage tk-test=1 (no harness) is cleared on load, and test mode is off');
// Menu -> Exit test mode
await open('?test=1');
let exit=p.getByText('Exit test mode');if(!(await exit.first().isVisible().catch(()=>false))){const m=p.getByText('Menu',{exact:false});if(await m.count())await m.first().tap().catch(()=>{});await p.waitForTimeout(300);}
const hadExit=await exit.count()>0;await exit.first().tap().catch(()=>{});await p.waitForTimeout(2500);
for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
check(hadExit&&!(await on())&&!(await p.locator('.tk-test-badge').count()),'Menu -> Exit test mode turns it off (and the badge goes)');
await open('');
check(!(await on()),'and it stays off on reloading');
await open('?test=1');await open('?test=0');
check(!(await on()),'?test=0 turns it off');
const key2=await p.evaluate(()=>{const n=window.__w.npcs.find(n=>n.challenge&&n.spr.visible&&!TK.cleared(n.challenge));return n&&n.challenge;});
if(key2){await duel(key2);check(await skipKey().count()===0,'and the Skip key is gone again');}
console.log(`test-mode: ${fails} failed`);await b.close();})();
