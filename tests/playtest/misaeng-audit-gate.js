// Book 1's m21b waits on the audit board's mark (Oh's desk). With the clues held: the Bag shows (the board opens from
// it), and reaching m21b's spot opens the board there; linking every pair and closing it plays m21b.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(BASE+'/index.html#/');await p.waitForTimeout(400);
await p.evaluate(async()=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);TK.migrate21();
  localStorage.setItem('tk-guide','off');localStorage.setItem('gt-username','pt-audit');await TK.load();const w=TK.world(21);
  for(const n of w.nodes){if(n.key==='21-m21b')break;TK.markCleared(n.key);}TK.markSeen('21:opening');
  TK.lsSet('tk-items',{21:['waybill_scrap','borrowed_glue','cabinet_key']});
  localStorage.setItem('tk-world-21',JSON.stringify({place:'jongno',party:['ms_oh']}));});
await p.goto(BASE+'/index.html#/tk/21');
for(let i=0;i<120&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.cine&&!window.__w.ui.busy())));i++){await p.evaluate(()=>{const g=document.querySelector('.tk-scroll-go');if(g)g.click();if(window.__w&&window.__w.ui&&window.__w.ui.busy())window.__w.ui.advance();}).catch(()=>{});await p.waitForTimeout(250);}
await p.waitForTimeout(2500);
const bag=await p.evaluate(()=>[...document.querySelectorAll('.tk-chron-btn')].find(x=>/Bag/.test(x.textContent)));
check(await p.evaluate(()=>{const b=[...document.querySelectorAll('.tk-chron-btn')].find(x=>/Bag/.test(x.textContent));return !!b&&!b.hidden;}),'the Bag shows with the clues held');
// walk to m21b's spot
await p.evaluate(()=>{const s=window.__w,sp=s.spots.m21b;s.player.setPosition(sp.x,sp.y+40);});
for(let i=0;i<40&&!(await p.evaluate(()=>!!document.querySelector('.tk-audit')));i++){await p.evaluate(()=>{const s=window.__w,sp=s.spots.m21b;if(s.ui.busy())s.ui.advance();else if(!document.querySelector('.tk-audit'))s.player.setPosition(sp.x,sp.y+8);});await p.waitForTimeout(300);}
check(await p.evaluate(()=>!!document.querySelector('.tk-audit')),'at m21b, the audit board opens');
const links=await p.evaluate(()=>TK.world(21).audit.links.map(L=>L.pair.map(c=>(WorldItems.defs(TK.world(21))[c]||{}).name||c)));
for(const pair of links){for(const name of pair){await p.evaluate(n=>{const b=[...document.querySelectorAll('.tk-audit-card')].find(x=>x.textContent.includes(n));b&&b.click();},name);await p.waitForTimeout(250);}await p.waitForTimeout(400);}
check(await p.evaluate(()=>WorldMarks.has(window.__w.w,'audit')),'every link made: the audit mark');
await p.evaluate(()=>document.querySelector('.tk-audit-close').click());
let played=false;for(let i=0;i<80&&!played;i++){played=await p.evaluate(()=>TK.cleared('21-m21b'));await p.evaluate(()=>{const s=window.__w;if(s&&s.ui.busy())s.ui.advance();}).catch(()=>{});await p.waitForTimeout(300);}
check(played,'closing it plays m21b');
console.log(fails?`misaeng-audit-gate: ${fails} FAILED`:'misaeng-audit-gate: all ok');await b.close();process.exit(fails?1:0);})();
