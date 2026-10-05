// Phone: "keeping hints present" at the Hills of Black Wind. Before the shrine (1-n7b): no hint line, nothing
// marked. After it: the goal line has its quieter second line (the shrine's hint, "Pigs, sheep, dogs. Blood."),
// and a marker (a gold ring at the feet) on each villager who will give blood (and nobody else). As each gives
// (through the game's own giveFrom), his marker goes; with all the blood held, the two ridges get one; as each
// ridge is supplied (deliverAt) its marker goes; with both supplied the hint line is gone. Markers are checked
// where they are drawn (PLAYTEST_KIT=genshin for the isometric view).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
// everything up to the Black Wind done; the shrine (1-n7b) not yet
await p.evaluate(()=>{localStorage.setItem('tk-guide','off');const w=TK.world(1);for(const n of w.nodes){if(n.key==='1-n7b')break;if(['side','short'].includes(n.role))continue;TK.markCleared(n.key);TK.markSeen('1:'+n.scene);}TK.markCleared('1-bs');TK.markSeen('1:opening');TK.setParty({n:1},['liubei','guanyu','zhangfei']);});
await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<8;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<100;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}await p.waitForTimeout(600);};
await ready();
await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('hills-of-black-wind');});await p.waitForTimeout(1500);await ready();
const through=async()=>{for(let i=0;i<40&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}await p.waitForTimeout(300);};
await through();
const state=()=>p.evaluate(()=>{const w=window.__w;const h=document.querySelector('.town-goal-hint');
  const name=t=>{const n=w.npcs.find(n=>n.spr===t);if(n)return 'giver:'+(n.gives||n.sprite);const s=Object.entries(w.spots).find(([k,s])=>s===t);return s?'spot:'+s[0]:'?';};
  return {goal:(document.querySelector('.town-goal')||{}).textContent||'',hint:h&&!h.hidden&&h.offsetParent?h.textContent:'',italic:h?getComputedStyle(h).fontStyle:'',marked:[...(w.actMarks||new Map()).keys()].map(name).sort()};});
// the markers as drawn: a ring at each marked target's feet, where the view draws them (in the isometric view
// the ring is moved like everything else, so its own x, y must be the flat map's)
const drawn=()=>p.evaluate(()=>{const w=window.__w,out={};
  for(const [k,m] of w.actMarks){const id=(w.npcs.find(n=>n.spr===k)||{}).gives||(Object.entries(w.spots).find(([,s])=>s===k)||[])[0];const feet=w.view(k.x,k.y);
    const rings=w.children.list.filter(o=>(o.type==='Ellipse')&&o.visible);   /* the ring at the feet (a diamond over the head may come with it) */let best=1e9;for(const o of rings){const at=o.isoFixed?{x:o.x,y:o.y}:w.view(o.x,o.y);best=Math.min(best,Math.hypot(at.x-feet.x,at.y-feet.y));}
    out[id]=Math.round(best);}return out;});
let s=await state();
check(!s.hint&&s.marked.length===0,`before the shrine: no hint line ("${s.hint}"), nothing marked (${s.marked.join(', ')||'none'})`);
// the shrine done
await p.evaluate(()=>{TK.markCleared('1-n7b');const w=window.__w;w.refreshStory();w.setGoal();});await p.waitForTimeout(500);
s=await state();
check(/Pigs, sheep, dogs/.test(s.hint)&&/猪/.test(s.hint)&&s.italic==='italic',`after the shrine: the hint line under the goal: "${s.hint}" (${s.italic})`);
const givers=await p.evaluate(()=>window.__w.npcs.filter(n=>n.gives&&n.spr.visible).map(n=>n.gives).sort());
check(s.marked.length===givers.length&&s.marked.every(m=>m.startsWith('giver:')),`a marker on each villager who will give (${givers.join(', ')}), nobody else: ${s.marked.join(', ')}`);
const d=await drawn();check(givers.every(g=>d[g]<=4),`a ring is drawn at each one's feet (px from his feet as drawn: ${JSON.stringify(d)})`);
await p.screenshot({path:require('path').join(__dirname,'out','hints-after-shrine.png')});
// each gives, through the game's own giveFrom
for(const g of givers){await p.evaluate(g=>{const w=window.__w;w.giveFrom(w.npcs.find(n=>n.gives===g));},g);await through();
  s=await state();check(!s.marked.includes('giver:'+g),`${g} given: his marker goes (${s.marked.join(', ')||'none'})`);}
const ridges=await p.evaluate(()=>Object.entries(window.__w.spots).filter(([,s])=>s.needs).map(([k])=>k).sort());
s=await state();
check(ridges.length===2&&ridges.every(r=>s.marked.includes('spot:'+r))&&s.marked.length===ridges.length,`with all the blood held, a marker on each ridge (${ridges.join(', ')}), nobody else: ${s.marked.join(', ')}`);
check(/Pigs, sheep, dogs/.test(s.hint),`the hint line stays while the ridges wait: "${s.hint}"`);
const d2=await drawn();check(ridges.every(r=>d2[r]<=4),`a ring is drawn at each ridge (px off: ${JSON.stringify(d2)})`);
await p.screenshot({path:require('path').join(__dirname,'out','hints-ridges.png')});
for(const r of ridges){await p.evaluate(r=>{const w=window.__w;w.deliverAt(w.spots[r]);},r);await through();
  s=await state();check(!s.marked.includes('spot:'+r),`${r} supplied: its marker goes (${s.marked.join(', ')||'none'})`);}
s=await state();
check(!s.hint,`both ridges supplied: the hint line is gone ("${s.hint}"); goal "${s.goal.slice(0,60)}"`);
check(s.marked.length===0,`nothing marked any more (${s.marked.join(', ')||'none'})`);
const rings=await p.evaluate(()=>{const w=window.__w,mk=new Set([...w.actMarks.values()]);return w.children.list.filter(o=>o.visible&&(o.type==='Ellipse'||o.type==='Polygon'||o.type==='Triangle')&&o.depth<9000&&o.strokeColor===0xf2cf6a).length;});
check(rings===0,`no marker rings left over (${rings})`);
console.log(fails?`hints: ${fails} failed`:'hints: all ok');await b.close();process.exit(fails?1:0);})();
