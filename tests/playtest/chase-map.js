// The chase on Places' map layout (luoyang.tmj property "chase"): 12 ambushes and a wave of 8 come up mounted after c16; riding straight for the gate, an ambusher springs and catches him (a board).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto('http://localhost:8765/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);for(const n of w.nodes){if(n.key==='13-c17')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 WorldItems && TK.lsSet(WorldItems.KEY,{13:['horse']});localStorage.setItem('tk-world-13',JSON.stringify({place:'luoyang',party:['caocao']}));});
await p.reload();
for(let i=0;i<100;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.ui.busy())))break;await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const st=await p.evaluate(()=>{const w=window.__w,C=w.chase;return {on:!!C,map:!!(C&&C.map),amb:C&&C.amb&&C.amb.length,wave:C&&C.wave&&C.wave.length,mounted:!!(w.mounts&&w.mounts.length),px:Math.round(w.player.x),py:Math.round(w.player.y)};});
check(st.on&&st.map&&st.amb===12&&st.wave===8&&st.mounted,`the map's chase: 12 ambushes, a wave of 8, mounted (${JSON.stringify(st)})`);
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(200);}
// ride straight for the gate: an ambusher should get him
await p.evaluate(()=>{const w=window.__w,T=w.tw||16,to=w.chase.map.to;w.walkTo(to[0]*T,to[1]*T);});
let opened=false,over=false;for(let i=0;i<120;i++){if(await p.locator('.tk-duel').count()){opened=true;break;}if(await p.evaluate(()=>window.__w.chase.tries>0)){over=true;break;}if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(100);}
const which=await p.evaluate(()=>{const w=window.__w;return {eng:w.engaged&&w.engaged.id,sprung:w.chase.amb.filter(a=>a.st!=='wait').map(a=>a.id)};});
check(opened,`riding straight for the gate, an ambusher springs and catches him: board (${JSON.stringify(which)}${over?' overrun first':''})`);
await b.close();console.log(fails?`mapchase: ${fails} failed`:'mapchase: all ok');})();
