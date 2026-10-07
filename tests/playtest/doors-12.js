// Phone: Book 2's doors that depend on who you are or where the story is (BOOK, default 12; test mode).
// The Chancellor's residence lets Diaochan in and turns Wang Yun away with the gatekeeper's line; the Xuanping
// tower stair is barred until a17; the road between Meiwu and Liangzhou is shut each way by the map's state
// (Meiwu's west road until a16m, Liangzhou's east road until a17). Walking into a barred way: the line, a step
// back, still here; into an open one: through. (It sets the story and stands him on the doorstep: the rule at
// each door. Reaching the doors on foot, through the story as played, is walk-playthrough.js.)
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/'+BOOK);await p.waitForTimeout(1500);
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}
  for(let i=0;i<30&&await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);i++){await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(150);}};
// the story up to a beat (the main beats before it cleared), with this lead, standing in this place
const at=async(stop,lead,place)=>{await p.evaluate(([stop,lead,B])=>{for(const k of Object.keys(localStorage))if(/^tk-(progress|cleared|world|rest|seen|party)/.test(k)||k==='gt-progress')localStorage.removeItem(k);localStorage.setItem('tk-guide','off');
    const w=TK.world(B),keys=w.nodes.map(n=>n.key),i=keys.indexOf(B+'-'+stop);for(const [j,n] of w.nodes.entries())if(j<i&&!['side','short'].includes(n.role))TK.markCleared(n.key);
    TK.markSeen(B+':opening');TK.setParty(w,[lead]);},[stop,lead,BOOK]);
  await p.reload();await p.waitForTimeout(1200);await ready();
  await p.evaluate(pl=>{const w=window.__w;if(!w.st.visited.includes(pl))w.st.visited.push(pl);w.save();w.leaving=false;w.cine=null;w.go(pl);},place);await p.waitForTimeout(1300);await ready();
  return p.evaluate(()=>({place:window.__w.placeId,lead:window.__w.lead}));};
// walk into the way to `to`: from a step outside it, onto it
const tryWay=async to=>{const r=await p.evaluate(to=>{const w=window.__w,e=w.exits.find(e=>e.to===to);if(!e)return null;const P=w.player,[dx,dy]={N:[0,-1],S:[0,1],W:[-1,0],E:[1,0]}[e.side]||[0,1];
    // a building's door faces out (you come at it from that side); a way in a wall is crossed going out that way
    const out=e.rect.width<16||e.rect.height<16?1:-1;w.walk=null;w.auto=null;P.body.reset(e.rect.centerX+dx*out*20,e.rect.centerY+3+dy*out*20);
    return {x:e.rect.centerX,y:e.rect.centerY+3};},to);
  if(!r)return {none:true};await p.waitForTimeout(300);
  await p.evaluate(r=>{const w=window.__w;w.player.body.reset(r.x,r.y);},r);
  let line='';for(let i=0;i<25;i++){await p.waitForTimeout(120);const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.querySelector('.town-en').textContent:'';});if(l)line=l;if(await p.evaluate(()=>window.__w.leaving))break;}
  const leaving=await p.evaluate(()=>!!window.__w.leaving);await p.waitForTimeout(1300);await ready();
  return {through:leaving||await p.evaluate(to=>window.__w.placeId===to,to),place:await p.evaluate(()=>window.__w.placeId),line};};
const cases=[
  ['a7','wangyun','changan','changan--xiangfu',false,"the Chancellor's residence turns Wang Yun away"],
  ['a7','diaochan','changan','changan--xiangfu',true,"the Chancellor's residence lets Diaochan in"],
  ['a17','wangyun','changan','changan--xuanping-top',false,'the Xuanping tower stair before a17'],
  ['a18p','wangyun','changan','changan--xuanping-top',true,'the Xuanping tower stair after a17'],
  ['a16m','jiaxu','meiwu','liangzhou',false,"Meiwu's west road before a16m"],
  ['a17','lijue','meiwu','liangzhou',true,"Meiwu's west road after a16m"],
  ['a17','lijue','liangzhou','meiwu',false,"Liangzhou's east road before a17"],
  ['a18p','wangyun','liangzhou','meiwu',true,"Liangzhou's east road after a17"],
  // the Meiwu Road (a road: open once two of the places it links are open): shut before Meiwu's beats, open at a13
  ['a2','wangyun','changan','meiwu-road',false,'the Meiwu Road out of Chang\'an at a2'],
  ['a13','lisu','changan','meiwu-road',true,'the Meiwu Road out of Chang\'an at a13'],
];
for(const [stop,lead,place,to,open,what] of cases){
  const s=await at(stop,lead,place);if(!check(s.place===place,`${what}: set up in ${place} as ${lead} (in ${s.place} as ${s.lead})`))continue;
  const r=await tryWay(to);if(!check(!r.none,`${what}: a way from ${place} to ${to}`))continue;
  if(open)check(r.through,`${what}: through to ${to} (now ${r.place})`);
  else check(!r.through&&r.place===place&&!!r.line,`${what}: barred, still in ${r.place}, with a line ("${r.line.slice(0,70)}")`);
}
console.log(`doors-12: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
