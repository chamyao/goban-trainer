const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await b.newPage({viewport:{width:1280,height:900}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
const shot=n=>p.screenshot({path:SP+'/duel_'+n+'.png'});
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))return;await p.waitForTimeout(200);}console.log('not ready');};
const busy=()=>p.evaluate(()=>!!(window.__w&&window.__w.ui.busy()));
const drain=async()=>{for(let i=0;i<400;i++){if(!(await busy()))break;await p.evaluate(()=>window.__w.act());await p.waitForTimeout(100);}};
const near=sel=>p.evaluate(sel=>{const w=window.__w;let t;if(sel.npc){const n=w.npcs.find(n=>n.challenge&&n.challenge.endsWith(sel.npc));t={x:n.spr.x,y:n.spr.y};}else{const s=Object.values(w.spots).find(s=>s.node===sel.node);t={x:s.x,y:s.y};}
  for(const [dx,dy,f] of [[0,14,'up'],[0,-12,'down'],[-14,2,'right'],[14,2,'left']]){w.player.setPosition(t.x+dx,t.y+dy);w.player.facing=f;const tg=w.target();if(tg&&(sel.npc?tg.kind==='npc':tg.kind==='spot'))return f;}return 'none';},sel);
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(300);}}
await ready(); await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county')}); await p.waitForTimeout(1200); await ready();
await near({node:'1-n1'}); await p.evaluate(()=>window.__w.act()); await p.waitForTimeout(150); await drain(); await p.waitForTimeout(1200);
console.log('overlay', await p.locator('.tk-duel').count(), 'hash', await p.evaluate(()=>location.hash), 'board', await p.locator('.tk-duel svg').count()); await shot('1_board');
await p.evaluate(()=>window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}))); await p.waitForTimeout(300);
await shot('1b_win'); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
console.log('overlay after', await p.locator('.tk-duel').count(), 'cleared', await p.evaluate(()=>TK.cleared('1-n1')), 'scene talking', await busy()); await shot('2_scene');
await drain(); console.log('party', await p.evaluate(()=>JSON.stringify(window.__w.st.party)));
console.log('face', await near({npc:'elder'})); await p.evaluate(()=>window.__w.act()); await drain(); await p.waitForTimeout(1200);
console.log('challenger overlay', await p.locator('.tk-duel').count()); await p.waitForTimeout(500); await shot('3_elder'); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
console.log('after escape', await p.locator('.tk-duel').count(), 'can move', await p.evaluate(()=>!window.__w.leaving), 'elder cleared', await p.evaluate(()=>TK.cleared('1-zhuo-county-c-elder')));
await b.close();})();
