// Phone, Book 3, Xiapi: the Huainan road gate (3-m13c). Tapping the road before the shrine under the pine
// (3-m13b) plays its "not yet" scene, no board; a road side before the shrine says no one is posted. After the
// shrine: the hint line ("Shut every door, and wait."), a marker on each road side; tapping the road plays the
// second "not yet" (no board). Posting Guan Yu west and Zhang Fei east (deliverAt): their lines, markers and
// hint go; then the road opens its board.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/');await p.waitForTimeout(1200);
await p.evaluate(async()=>{await TK.load();localStorage.setItem('tk-guide','off');for(const n of [1,2])TK.world(n).nodes.forEach(x=>{TK.markCleared(x.key);TK.markSeen(n+':'+x.scene);});
  const w=TK.world(3);for(const x of w.nodes){if(x.key==='3-m13b')break;if(['side','short'].includes(x.role))continue;TK.markCleared(x.key);TK.markSeen('3:'+x.scene);}TK.markSeen('3:opening');});
await p.goto(BASE+'#/tk/3');await p.waitForTimeout(1500);
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
await ready();
await p.evaluate(()=>{const w=window.__w;w.leaving=false;w.go('xiapi');});await p.waitForTimeout(1500);await ready();
const lines=[];const through=async()=>{for(let i=0;i<200;i++){const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.textContent.replace(/\s+/g,' ').trim():'';});if(l&&lines[lines.length-1]!==l)lines.push(l);
  if(await p.locator('.tk-duel svg').count())return 'board';
  if(!(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)))return 'done';await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}return 'stuck';};
await through();
const state=()=>p.evaluate(()=>{const w=window.__w,h=document.querySelector('.town-goal-hint');return {goal:(document.querySelector('.town-goal')||{}).textContent||'',hint:h?h.textContent:'',marked:[...(w.actMarks||new Map()).keys()].map(k=>(Object.entries(w.spots).find(([,s])=>s===k)||['npc'])[0]).sort(),m13c:TK.cleared('3-m13c')};});
const tapSpot=async k=>{await p.evaluate(k=>{const w=window.__w,s=w.spots[k];w.walk=null;w.player.body.reset(s.x,s.y+14);w.player.facing='up';},k);await p.waitForTimeout(400);lines.length=0;await p.evaluate(()=>window.__w.act());await p.waitForTimeout(500);return through();};
// 1. before the shrine
let r=await tapSpot('road');check(r==='done'&&!(await state()).m13c,`before the shrine, the road: its "not yet" scene, no board (${r}; "${(lines[1]||lines[0]||'').slice(0,70)}")`);
r=await tapSpot('road_west');check(/No one is posted|没有人/.test(lines.join(' ')),`before the shrine, the west side: "${(lines[0]||'').slice(0,80)}"`);
let s=await state();check(!s.hint&&!s.marked.length,`before the shrine: no hint line ("${s.hint}"), nothing marked (${s.marked.join(',')||'none'})`);
// 2. the shrine done
await p.evaluate(()=>{TK.markCleared('3-m13b');const w=window.__w;w.refreshStory();w.setGoal();});await p.waitForTimeout(400);
s=await state();
check(/Shut every door/.test(s.hint),`after the shrine: the hint line "${s.hint}"`);
check(/Guan Yu|west/i.test(s.goal),`the goal says what to do: "${s.goal.slice(0,110)}"`);
check(s.marked.join(',')==='road_east,road_west',`a marker on each road side, nobody else (${s.marked.join(',')})`);
r=await tapSpot('road');check(r==='done'&&!(await state()).m13c,`the road before the sides are held: the second "not yet", no board (${r}; "${(lines[1]||lines[0]||'').slice(0,70)}")`);
// 3. post the brothers
for(const [k,who] of [['road_west','Guan Yu'],['road_east','Zhang Fei']]){lines.length=0;await p.evaluate(k=>{const w=window.__w;w.deliverAt(w.spots[k]);},k);await through();
  s=await state();check(lines.some(l=>l.includes(who))&&!s.marked.includes(k),`${k}: ${who} posted ("${(lines.find(l=>l.includes(who))||'').slice(0,70)}"), its marker gone (${s.marked.join(',')||'none'})`);}
s=await state();check(!s.hint,`both sides held: the hint line is gone ("${s.hint}")`);
r=await tapSpot('road');check(r==='board',`then the road opens its board (${r})`);
await p.screenshot({path:require('path').join(__dirname,'out','huainan-gate.png')});
console.log(fails?`huainan-gate: ${fails} failed`:'huainan-gate: all ok');await b.close();process.exit(fails?1:0);})();
