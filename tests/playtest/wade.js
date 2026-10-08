// Water and a horse that crosses it (Lü Bu's Red Hare, "crosses_water"): stopped on an ordinary horse, rides in on Red Hare, no dismounting in the water, taps path over it; ["lose", item] takes the horse; a state's water ("water:flood1") only stops him when its state is on.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const PT=__dirname;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:PT+'/vendor/phaser.min.js',contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto('http://localhost:8765/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c19')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.lsSet(WorldItems.KEY,{13:['horse']});TK.setParty(w,['caocao','chengong']);
 localStorage.setItem('tk-world-13',JSON.stringify({place:'the-east-road',party:['caocao','chengong']}));});
await p.reload();await p.waitForTimeout(3000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.waitForTimeout(1000);
// a water tile with dry land 2 tiles to its west
const spot=await p.evaluate(()=>{const s=window.__w,L=s.water,T=s.tw;let r=null;
 L.forEachTile(t=>{if(r||t.index===-1)return;const l1=L.getTileAt(t.x-1,t.y),l2=L.getTileAt(t.x-2,t.y),l3=L.getTileAt(t.x-3,t.y);
  if((!l1||l1.index===-1)&&(!l2||l2.index===-1)&&(!l3||l3.index===-1)){const x=(t.x-2+.5)*T,y=(t.y+.95)*T;
   if(!s.physics.overlapRect(x-4,y-6,8,6,false,true).some(b=>b.gameObject&&s.solids.contains(b.gameObject))) r={x,y,wx:t.pixelX};}});
 return {r,n:s.waters.length,place:s.placeId};});
console.log(JSON.stringify(spot));
const drive=async(ms=900)=>{await p.evaluate(sp=>{const s=window.__w;s.player.setPosition(sp.x,sp.y);s.player.body.reset(sp.x,sp.y);},spot.r);
 await p.keyboard.down('ArrowRight');await p.waitForTimeout(ms);await p.keyboard.up('ArrowRight');await p.waitForTimeout(100);
 return p.evaluate(()=>({x:Math.round(window.__w.player.x),on:window.__w.onWater(),mounts:window.__w.mounts.length,wades:window.__w.wades()}));};
let r=await drive();check(!r.on&&r.mounts,`on an ordinary horse the water stops him (${JSON.stringify(r)}, water at x ${spot.r.wx})`);
await p.evaluate(()=>{TK.world(13).items.horse.crosses_water=true;window.__w.mountSig=null;});
for(const ms of [200,260,320,400]){r=await drive(ms);if(r.on)break;}check(r.on&&r.wades,`on a horse that crosses water he rides into it (${JSON.stringify(r)})`);
await p.keyboard.press('r');await p.waitForTimeout(300);
const still=await p.evaluate(()=>WorldItems.riding(TK.world(13)));check(still,'no dismounting in the water');
await p.evaluate(()=>WorldItems.setRiding(TK.world(13),true));const G=await p.evaluate(sp=>{const s=window.__w;s.grid=null;const g=s.walkGrid();return g.free(Math.floor((sp.wx+8)/g.C),Math.floor((sp.y-3)/g.C));},spot.r);check(G,'taps can path over the water while he wades');
await p.evaluate(()=>{const s=window.__w;s.player.setPosition(s.player.x-60,s.player.y);});
await p.evaluate(()=>WorldItems.lose(window.__w,'horse'));await p.waitForTimeout(400);
const lost=await p.evaluate(()=>({items:WorldItems.owned(TK.world(13)),mounts:window.__w.mounts.length,note:[...document.querySelectorAll('.town-gain')].map(e=>e.textContent).join('|')}));
check(!lost.items.includes('horse')&&lost.mounts===0&&/Lost/.test(lost.note),`lose: the horse goes, he's afoot, with a notice (${JSON.stringify(lost)})`);
r=await drive();check(!r.on,`afoot, the water stops him again (${JSON.stringify(r)})`);
// a state's water: off, it doesn't stop him; on, it does
await p.evaluate(()=>{const s=window.__w;for(const w of s.waters){w.ids=['flood9'];}s.refreshStory();});
r=await drive();check(r.x>spot.r.wx,`a state's water, state off: walked over (${JSON.stringify(r)})`);
const vis=await p.evaluate(()=>window.__w.waters.every(w=>!w.layer.visible));check(vis,'and it is not drawn');
await p.evaluate(()=>{const s=window.__w;const ms=s.mapState;s.mapState=()=>({ids:['flood9']});s.refreshStory();s.mapState=ms;});
r=await drive();check(!r.on,`state on: it stops him (${JSON.stringify(r)})`);
await b.close();console.log(fails?`wade: ${fails} failed`:'wade: all ok');})();
