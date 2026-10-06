// Phone: the way to somewhere new lights up (showRoute). Book 12 from its start (test mode): the first goal,
// then a1 -> a2 (out of Chang'an by Wang Yun's door, then inside to the spot), and the crown errand's legs (the
// steward, the jeweller, then a3 by Lu Bu's door). Each new destination lights once, never under a line or a
// scene, ends where the goal is (a way out when the goal is on another map), and not again after a reload.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'')+'#/tk/12';
// a watch on the page: each lighting (a run of '@route' images appearing), and what was on screen then
const watch=()=>p.evaluate(()=>{window.__lit=[];const seen=new WeakSet();setInterval(()=>{const w=window.__w;if(!w||!w.children)return;const ims=w.children.list.filter(o=>o.texture&&o.texture.key==='@route'&&!seen.has(o));ims.forEach(o=>seen.add(o));   // new lights (an earlier run may still be fading)
  if(ims.length){const end=ims.reduce((a,o)=>o.scale>a.scale?o:a,ims[0]);window.__lit.push({place:w.placeId,dots:ims.length-1,end:[end.x|0,end.y|0],goal:w.goalAt&&[w.goalAt.x|0,w.goalAt.y|0],busy:w.ui.busy(),cine:!!w.cine,
    exit:(w.exits.find(e=>Math.hypot(e.rect.centerX-end.x,e.rect.centerY-end.y)<12)||{}).to||null});}},50);});
const lit=()=>p.evaluate(()=>{const l=window.__lit||[];window.__lit=[];return l;});
const settle=async(ms=1500)=>{for(let i=0;i<120;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await p.waitForTimeout(600);await g.first().tap().catch(()=>{});}
    const st=await p.evaluate(()=>{const w=window.__w;return w&&w.player?{busy:w.ui.busy(),cine:!!w.cine,leaving:w.leaving}:null;});
    if(st&&!st.leaving&&!st.cine&&!st.busy)break;if(st&&st.busy&&!st.cine){await p.waitForTimeout(500);await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());}await p.waitForTimeout(150);}
  await p.waitForTimeout(ms);};
await p.goto(URL);await p.waitForTimeout(500);
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);localStorage.setItem('tk-guide','off');});
await p.reload();await watch();await settle(2500);
// 1. the book's first goal
let l=await lit();
check(l.length===1,`the first goal lights once on arriving (${l.length}: ${JSON.stringify(l)})`);
if(l[0])check(!l[0].busy&&!l[0].cine,`  not under the opening scroll or a line (busy ${l[0].busy}, scene ${l[0].cine})`);
if(l[0])check(Math.hypot(l[0].end[0]-l[0].goal[0],l[0].end[1]-l[0].goal[1])<4&&l[0].dots>=1,`  a run of ${l[0].dots} lights ending at the goal (${l[0].end} / ${l[0].goal})`);
// the same goal, walked about: no second lighting
await p.evaluate(()=>{const w=window.__w;w.setGoal();w.setGoal();});await p.waitForTimeout(1200);
check((await lit()).length===0,'the same goal set again: no second lighting');
// 2. a1 done: a2 is in Wang Yun's residence, another map: the way to its door
const next=async(fn,label)=>{await p.evaluate(fn);await p.evaluate(()=>window.__w.setGoal());await settle(1200);return lit();};
l=await next(()=>TK.markCleared('12-a1'),'a1');
check(l.length===1&&!!l[0].exit,`a1 done: lights the way out to the next map (${JSON.stringify(l.map(x=>x.exit))})`);
// into the residence: the spot itself, once
await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('changan--wangyun');});await p.waitForTimeout(1300);await settle(1500);
l=await lit();check(l.length===1&&l[0].place==='changan--wangyun'&&!l[0].exit,`inside: lights the way to a2's spot (${JSON.stringify(l.map(x=>[x.place,x.exit,x.end]))})`);
// reload in the same place: nothing
await p.reload();await watch();await settle(2500);
check((await lit()).length===0,'after a reload, the same destination does not light again');
// 3. the crown errand: a2 done; the steward (pearls), the jeweller (crown), then a3
await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('changan');});await p.waitForTimeout(1300);await settle(800);await lit();
const leg=async(fn,what)=>{const l=await next(fn);check(l.length===1&&!l[0].busy&&!l[0].cine,`${what}: lights once (${JSON.stringify(l.map(x=>({to:x.exit||x.end,busy:x.busy})))})`);return l;};
// a2 done: the steward is in Wang Yun's house, whose door was lit for a2 already; in the street nothing new, inside the way to him
{const l=await next(()=>TK.markCleared('12-a2'));const door=await p.evaluate(()=>{const w=window.__w,e=w.exits.find(e=>w.goalAt&&Math.hypot(e.rect.centerX-w.goalAt.x,e.rect.centerY-w.goalAt.y)<12);return e&&e.to;});
  check(l.length===0&&door==='changan--wangyun',`a2 done: the goal is Wang Yun's door again, already lit, so nothing new in the street (${l.length}, goal at the door to ${door})`);
  await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('changan--wangyun');});await p.waitForTimeout(1300);await settle(1500);
  const l2=await lit();const who=await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(n=>w.goalAt&&Math.hypot(n.spr.x-w.goalAt.x,n.spr.y-8-w.goalAt.y)<4);return n?n.id:(w.exits.find(e=>w.goalAt&&Math.hypot(e.rect.centerX-w.goalAt.x,e.rect.centerY-w.goalAt.y)<12)||{}).to||'?';});
  check(l2.length===1&&!l2[0].busy,`  inside the house: the way to the pearls lights once (to ${who})`);
  await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('changan');});await p.waitForTimeout(1300);await settle(800);await lit();}
await leg(()=>WorldItems.add(window.__w.w,'pearls'),'pearls in hand, off to the jeweller');
await leg(()=>WorldItems.add(window.__w.w,'crown'),'the crown made, off to a3');
// a line on screen when the goal moves to somewhere new: the lighting waits for it (a3 done, in the house: the
// way to the front hall for a5)
await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('changan--wangyun');});await p.waitForTimeout(1300);await settle(800);await lit();
await p.evaluate(()=>{const w=window.__w;w.talk([["n","A line to read.","一句话。"],["n","Another.","又一句。"]],()=>{});});
await p.evaluate(()=>{TK.markCleared('12-a3');TK.markCleared('12-a4');window.__w.setGoal();});await p.waitForTimeout(1500);
check((await lit()).length===0,'a4 done (a5 is in the front hall, not lit yet) while a line is up: nothing lights under it');
await settle(1500);l=await lit();
check(l.length===1&&!l[0].busy,`then, once the line is read, it lights (${JSON.stringify(l.map(x=>x.exit||x.end))})`);
console.log(`route-lights: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
