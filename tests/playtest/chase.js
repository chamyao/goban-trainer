// The chase (book 13, Cao Cao out of Luoyang): a rider who sees you rides up and a one-try board opens; a slip restarts the chase at its start spot, a solve drops that rider. Riders and the chase spec are injected here until Places and Plot add theirs.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto('http://localhost:8765/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');const D=await TK.load();const w=TK.world(13);for(const n of w.nodes){if(n.key==='13-c17')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 localStorage.setItem('tk-world-13',JSON.stringify({place:'luoyang',party:['caocao']}));});
await p.reload();
for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().click();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.ui.busy())))break;await p.waitForTimeout(200);}
await p.waitForTimeout(1500);
const st=await p.evaluate(()=>{const w=window.__w;const node=TK.world(13).nodes.find(n=>n.key==='13-c17');
 node.chase={from:Object.keys(w.spots)[0],caught:[["n","A rider catches up!","追兵赶上！"]],solved:[["n","He falls behind.","甩掉了。"]],restart:[["n","Back to the gate.","回到起点。"]]};
 const n=w.npcs.find(m=>!m.challenge&&!m.watch&&m.spr);if(!n)return {err:'no npc'};
 n.rider={chase:'13-c17',cone:6,dir:'down',pts:[{x:n.spr.x,y:n.spr.y}],leg:0};n.home={x:n.spr.x,y:n.spr.y};
 w.player.setPosition(n.spr.x,n.spr.y+40);return {place:w.placeId,npc:n.id,from:node.chase.from,chase:!!w.chaseNow()};});
console.log(JSON.stringify(st));
check(st.chase,'the chase is on in Luoyang after c16');
let opened=false;for(let i=0;i<40;i++){if(await p.locator('.tk-duel').count()){opened=true;break;}const t=p.locator('.town-dlg:not([hidden])');if(await t.count())await p.keyboard.press('Enter');await p.waitForTimeout(250);}
check(opened,'a rider who sees you rides up, says his line, and the board opens');
// fail it: one try only
await p.waitForTimeout(1200);await p.evaluate(()=>dispatchEvent(new CustomEvent('tczw:result',{detail:'fail'})));await p.waitForTimeout(500);
const before=await p.evaluate(()=>({x:window.__w.player.x,y:window.__w.player.y}));
await p.locator('.tk-duel .tk-duel-go',{hasText:'Continue'}).first().click();await p.waitForTimeout(1500);
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(250);}
const after=await p.evaluate(()=>{const w=window.__w,s=w.spots[w.chase.spec.from];return {x:w.player.x,y:w.player.y,sx:s&&s.x,sy:s&&s.y,tries:w.chase.tries};});
check(after.tries===1&&Math.abs(after.x-after.sx)<2,`failing restarts the chase at its start spot (${JSON.stringify(after)})`);
// caught again, solve it: that rider drops out
await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(m=>m.rider);w.player.setPosition(n.spr.x,n.spr.y+30);});
opened=false;for(let i=0;i<40;i++){if(await p.locator('.tk-duel').count()){opened=true;break;}if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(250);}
check(opened,'caught again: a board again');
await p.waitForTimeout(1200);await p.evaluate(()=>{if(window.__trainer)window.__trainer.flawed=null;dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(500);
await p.locator('.tk-duel button',{hasText:'Continue'}).first().click().catch(()=>{});await p.waitForTimeout(1500);
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(250);}
const dropped=await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(m=>m.rider);return {dropped:w.chase.dropped.has(n.id),visible:n.spr.visible,c17:TK.cleared('13-c17')};});
check(dropped.dropped&&!dropped.visible&&!dropped.c17,`solving drops that rider for the run, and the gate beat is still to play (${JSON.stringify(dropped)})`);
await b.close();console.log(fails?`chase: ${fails} failed`:'chase: all ok');})();
