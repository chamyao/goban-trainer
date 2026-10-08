// Replay from a beat (the menu's 重玩一段): undoes that beat and all after, puts you where it starts with the party and
// possessions you had then; a stale copy merged from the server (another device) doesn't bring the undone beats back.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/13');await p.waitForTimeout(800);
const stale=await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c23')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.lsSet(WorldItems.KEY,{13:['horse','redhare','gold','sevenstar','weihong']});TK.setParty(w,['caocao','chengong']);
 localStorage.setItem('tk-world-13',JSON.stringify({place:'chenliu',party:['caocao','chengong'],crowd:15}));
 return JSON.parse(JSON.stringify(loadProgress()));});
await p.reload();await p.waitForTimeout(2500);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.locator('.tk-menu-btn',{hasText:'Menu'}).click().catch(()=>{});await p.waitForTimeout(300);
await p.locator('button',{hasText:'Replay from'}).first().click();await p.waitForTimeout(400);
const opts=await p.evaluate(()=>[...document.querySelectorAll('.tk-replay-sel option')].map(o=>o.value));
check(opts.includes('13-c17')&&!opts.includes('13-c23'),`the menu offers the beats played (${opts.length}, last ${opts[opts.length-1]})`);
await p.selectOption('.tk-replay-sel','13-c17');await p.locator('.tk-replay button',{hasText:'Replay'}).last().click();await p.waitForTimeout(3500);
const s=await p.evaluate(()=>({c16:TK.cleared('13-c16'),c17:TK.cleared('13-c17'),c20:TK.cleared('13-c20'),place:window.__w&&window.__w.placeId,party:TK.party(TK.world(13)),items:WorldItems.owned(TK.world(13)),chase:!!(window.__w&&window.__w.chaseNow())}));
check(s.c16&&!s.c17&&!s.c20,`c17 on are undone, c16 kept (${JSON.stringify({c16:s.c16,c17:s.c17,c20:s.c20})})`);
check(s.place==='luoyang'&&s.party.join()==='caocao'&&s.items.includes('horse')&&!s.items.includes('weihong'),`back in Luoyang as Cao Cao alone, with the horse and nothing after (${JSON.stringify({place:s.place,party:s.party,items:s.items})})`);
check(s.chase,'the chase is on again');
const fol=await p.evaluate(()=>({crowd:window.__w.st.crowd,followers:window.__w.followers.length}));
check(fol.crowd===0&&fol.followers===0,`no crowd from later in the book follows him (${JSON.stringify(fol)})`);

// replay from earlier, then forward again to a beat that earlier replay undid: it puts back what came before
// (the chase is on now, and its wave or a line can cover the menu: open the picker directly)
await p.evaluate(()=>WorldTravel.replayPick(TK.world(13)));await p.waitForTimeout(300);
await p.selectOption('.tk-replay-sel','13-c15');await p.locator('.tk-replay button',{hasText:'Replay'}).last().click();await p.waitForTimeout(3000);
await p.evaluate(()=>WorldTravel.replayPick(TK.world(13)));await p.waitForTimeout(300);
const o2=await p.evaluate(()=>[...document.querySelectorAll('.tk-replay-sel option')].map(o=>o.value));
check(o2.includes('13-c17'),'after replaying from c15, c17 is still offered');
await p.selectOption('.tk-replay-sel','13-c17');await p.locator('.tk-replay button',{hasText:'Replay'}).last().click();await p.waitForTimeout(3000);
const f=await p.evaluate(()=>({c15:TK.cleared('13-c15'),c16:TK.cleared('13-c16'),c17:TK.cleared('13-c17'),place:window.__w&&window.__w.placeId,horse:WorldItems.owned(TK.world(13)).includes('horse'),chase:!!(window.__w&&window.__w.chaseNow())}));
check(f.c15&&f.c16&&!f.c17&&f.place==='luoyang'&&f.horse&&f.chase,`forward again to c17: c15 and c16 back, at the chase, mounted (${JSON.stringify(f)})`);
// a stale copy (another device, the server) merged in doesn't bring them back
const after=await p.evaluate(st=>{const local=loadProgress();Sync.mergeInto(local,st);localStorage.setItem('gt-progress',JSON.stringify(local));return {c17:TK.cleared('13-c17'),c20:TK.cleared('13-c20'),c16:TK.cleared('13-c16')};},stale);
check(!after.c17&&!after.c20&&after.c16,`a stale copy merged in keeps them undone (${JSON.stringify(after)})`);
// clearing again wins over the undo
const again=await p.evaluate(()=>{TK.markCleared('13-c17');return TK.cleared('13-c17');});
check(again,'clearing c17 again counts');
await b.close();console.log(fails?`replay: ${fails} failed`:'replay: all ok');})();
