// The chase redesign (the user's): a wave out of the gate on your trail, a little slower than you (it reaching you: taken, restart, no board); ambushers springing from doorways (a collision: one-try board; solved, knocked aside); the chase pauses under a board. Wave and ambusher injected until Plot and Places land theirs.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto('http://localhost:8765/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);for(const n of w.nodes){if(n.key==='13-c17')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 const node=w.nodes.find(n=>n.key==='13-c17');node.chase=Object.assign({},node.chase,{wave:{count:5,delay:1,pace:.92}});
 localStorage.setItem('tk-world-13',JSON.stringify({place:'luoyang',party:['caocao']}));});
await p.reload();
for(let i=0;i<100;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.ui.busy())))break;await p.waitForTimeout(200);}
// a TK.load() in the reloaded page lost our injected wave: inject again on the live data and restart the chase
await p.evaluate(()=>{const w=window.__w,node=TK.world(13).nodes.find(n=>n.key==='13-c17');node.chase=Object.assign({},node.chase,{wave:{count:5,delay:1,pace:.92}});w.waveClear();w.chase=null;for(const m of w.npcs)if(m.rider){m.rider=null;m.spr.setVisible(false);m.spr.body.enable=false;}});
await p.waitForTimeout(500);
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(200);}
const s1=await p.evaluate(()=>{const w=window.__w,C=w.chase;return {on:!!C,wave:C&&C.wave&&C.wave.length,place:w.placeId};});
check(s1.on&&s1.wave===5,`the chase comes with its wave (${JSON.stringify(s1)})`);
// stand still: the wave reaches him, he's taken, back at the start, no board
await p.waitForTimeout(6000);
for(let i=0;i<20;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(250);}
await p.waitForTimeout(1500);
const s2=await p.evaluate(()=>({tries:window.__w.chase.tries,duel:!!document.querySelector('.tk-duel')}));
check(s2.tries>=1&&!s2.duel,`standing still, the wave overruns him: restart, no board (${JSON.stringify(s2)})`);
// an ambusher: make one npc an ambusher near him, he springs out, collision → board
const amb=await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(m=>!m.challenge&&!m.watch&&!m.rider&&m.spr);n.ambush={chase:'13-c17',reach:5,dash:2500,t:0,armed:true};n.home={x:n.spr.x,y:n.spr.y};
 w.chase.wt=-60000; w.player.setPosition(n.spr.x+40,n.spr.y);return n.id;});
let opened=false;for(let i=0;i<40;i++){if(await p.locator('.tk-duel').count()){opened=true;break;}if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(200);}
check(opened,'an ambusher springs out and catches him: a one-try board');
await p.waitForTimeout(1200);const wd0=await p.evaluate(()=>window.__w.chase.wd);await p.waitForTimeout(1500);const wd1=await p.evaluate(()=>window.__w.chase.wd);
check(wd0===wd1,`the chase pauses while the board is up (wave ${wd0} → ${wd1})`);
await p.evaluate(()=>{if(window.__trainer)window.__trainer.flawed=null;dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(500);
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(200);}
const s3=await p.evaluate(id=>{const w=window.__w,n=w.npcs.find(m=>m.id===id);return {dropped:w.chase.dropped.has(id),vis:n.spr.visible};},amb);
check(s3.dropped&&!s3.vis,`solved: that soldier is knocked aside (${JSON.stringify(s3)})`);
await b.close();console.log(fails?`wave: ${fails} failed`:'wave: all ok');})();
