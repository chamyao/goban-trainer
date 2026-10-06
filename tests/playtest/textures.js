// Every place in a book (BOOK, default 12; a test book in test mode): nothing on the map is drawn with Phaser's
// missing-texture box (the black square with a green line). Two Book 2 soldiers were: their maps gave their
// facing as a compass point ("W"), and the engine looked for an "h-f_soldier-W-0" picture.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}};
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(BOOK>9?'?test=1':'')+(process.env.PLAYTEST_KIT?(BOOK>9?'&':'?')+'kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/'+BOOK);await p.waitForTimeout(1200);
if(BOOK>1)await p.evaluate(B=>{for(let n=1;n<Math.min(B,4);n++)if(TK.world(n))TK.world(n).nodes.forEach(x=>{TK.markCleared(x.key);TK.markSeen(n+':'+x.scene);});localStorage.setItem('tk-book',String(B));},BOOK);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));await p.reload();await p.waitForTimeout(1200);await ready();
const places=await p.evaluate(()=>window.__w.region.places.map(x=>x.id));
for(const pl of places){
  await p.evaluate(pl=>{const w=window.__w;if(!w.st.visited.includes(pl))w.st.visited.push(pl);w.leaving=false;w.cine=null;w.go(pl);},pl);await p.waitForTimeout(900);await ready();
  if(await p.evaluate(pl=>window.__w.placeId!==pl,pl))continue;checked++;
  const miss=await p.evaluate(()=>{const w=window.__w;return w.children.list.filter(o=>o.texture&&o.texture.key==='__MISSING').map(o=>{const n=w.npcs.find(n=>n.spr===o);return n?`${n.id} (${n.sprite}, facing ${n.dir})`:`${o.type} at ${o.x|0},${o.y|0}`;});});
  if(miss.length){fails++;console.log(`FAIL ${pl}: missing picture for ${miss.join(', ')}`);}
}
console.log(`textures: ${checked-fails}/${checked} places`);await b.close();process.exit(fails?1:0);})();
