// Black Wind (docs/mechanics-spec.md §8, checks 1-10), on the phone, by taps: Liu Bei walks by taps
// toward each target (no teleports inside the stretch), talks by tapping people, solves boards by
// tapping the key's moves. Times each leg of the intended path for check 10.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2','1-as','1-n3','1-n4','1-t1','1-n5','1-bs','1-n6'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);localStorage.setItem('tk-guide','off');});
await p.reload();await p.waitForTimeout(1500);
const scrolls=async()=>{for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}};
const ready=async()=>{for(let i=0;i<75;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&window.__w.sys.isActive())))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
const W=f=>p.evaluate(f);
const st=()=>W(()=>{const w=window.__w;return {place:w.placeId,busy:w.ui.busy()||!!w.cine,P:[w.player.x,w.player.y],leaving:w.leaving};});
const toS=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k,r.top+(y-cam.worldView.y)*cam.zoom*k,r.left,r.top,r.width,r.height];},[x,y]);
const line=()=>W(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?((d.querySelector('.town-who').textContent||'')+': '+d.querySelector('.town-en').textContent):null;});
let LINES=0;
// tap through whatever is talking (dialogue, cutscene, scrolls); stops when the world is free or a board opens
const through=async(max=600)=>{const seen=[];try{await dupCheck('scene start');}catch{}for(let i=0;i<max;i++){if(await p.locator('.tk-duel svg').count())return {lines:seen,duel:true};
  const g=p.locator('.tk-scroll-go');if(await g.count()){seen.push('[scroll]');await g.first().tap();await p.waitForTimeout(300);continue;}
  const s=await st();if(!s.busy&&!s.leaving){if(i>6)break;await p.waitForTimeout(150);continue;}
  const l=await line();if(l&&seen[seen.length-1]!==l){seen.push(l);LINES++;}
  const box=await W(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}const c=window.__w.game.canvas.getBoundingClientRect();return [c.left+c.width/2,c.top+c.height*.85];});
  await p.touchscreen.tap(...box);await p.waitForTimeout(250);}
  try{await dupCheck('after a scene');}catch{}
  return {lines:seen.filter((x,i)=>!seen.slice(i+1).some(y=>y.startsWith(x.slice(0,x.length))&&y!==x)),duel:false};};
// walk there by taps (the target itself if it's on screen, else toward it at the screen's edge)
const walkTo=async(get,{near=18,tapTarget=true,max=60}={})=>{let last=null,stuck=0;
  for(let i=0;i<max;i++){const s=await st();if(s.busy||await p.locator('.tk-duel svg').count())return 'talk';if(s.leaving){await ready();return 'left';}
    const t=await W(get);if(!t)return 'gone';const d=Math.hypot(t[0]-s.P[0],t[1]-s.P[1]);if(d<near&&!tapTarget)return 'there';
    const [sx,sy,L,T,Wd,H]=await toS(t[0],t[1]),m=44,on=sx>L+m&&sx<L+Wd-m&&sy>T+110&&sy<T+H-m;
    let tx=sx,ty=sy;if(!on){const [px,py]=await toS(s.P[0],s.P[1]);const dx=sx-px,dy=sy-py;let f=1;
      for(const [lim,dd,c0] of [[L+m,dx,px],[L+Wd-m,dx,px],[T+110,dy,py],[T+H-m,dy,py]])if(dd){const ff=(lim-c0)/dd;if(ff>0)f=Math.min(f,ff);}tx=px+dx*f;ty=py+dy*f;}
    if(last&&Math.hypot(s.P[0]-last[0],s.P[1]-last[1])<3)stuck++;else stuck=0;if(stuck>2){tx+=(Math.random()-.5)*120;ty+=(Math.random()-.5)*120;}
    last=s.P;await p.touchscreen.tap(tx,ty);await p.waitForTimeout(on?1500:900);}
  return 'stuck';};
const npc=g=>`(()=>{const n=window.__w.npcs.find(n=>${g});return n&&n.spr.visible?[n.spr.x,n.spr.y-8]:null;})()`;
const spot=k=>`(()=>{const s=window.__w.spots[${JSON.stringify(k)}]||Object.values(window.__w.spots).find(s=>s.node===${JSON.stringify(k)});return s?[s.x,s.y]:null;})()`;
const exitTo=to=>`(()=>{const e=window.__w.exits.find(e=>e.to===${JSON.stringify(to)});return e?[e.rect.centerX,e.rect.centerY]:null;})()`;
const travel=async to=>{const r=await walkTo(new Function('return '+exitTo(to)),{max:80});for(let i=0;i<30;i++){if((await st()).place===to)break;await p.waitForTimeout(200);}await ready();await scrolls();await dupCheck('arriving');return (await st()).place===to;};
const best=()=>W(()=>{const t=window.__trainer;if(!t||t.done||t.engineBusy||t.played.length%2)return null;
  const n=t.played.length,memo=new Map(),open=L=>L.length-1>n&&t.played.every((m,i)=>m===L[i+1]);
  const ms=[...new Set([...t.p.lines.filter(L=>L[0]===1&&open(L)),...t.p.lines.filter(L=>L[0]===2&&open(L))].map(L=>L[n+1]))];if(!ms.length)return null;
  const m=ms.find(m=>t.outcome([...t.played,m],memo)==='ok')||ms[0],c=m.charCodeAt(0)-97,r=m.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));
  if(!el)return {m};const R=el.getBoundingClientRect();return {m,x:R.left+R.width/2,y:R.top+R.height/2};});
const solve=async()=>{await p.waitForTimeout(800);const mv=[];for(let i=0;i<40;i++){if(await p.locator('.tk-duel-go').count())break;if(await p.locator('.tk-rest').count()){await p.waitForTimeout(500);continue;}const m=await best();if(m&&m.x){await p.touchscreen.tap(m.x,m.y);mv.push(m.m);await p.waitForTimeout(900);}else await p.waitForTimeout(400);}
  const won=await W(()=>{const d=document.querySelector('.tk-duel-dlg');return !!d&&d.classList.contains('win');});if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap();await p.waitForTimeout(600);return {won,mv};};
const items=()=>W(()=>WorldItems.owned(TK.world(1)).filter(k=>/blood/.test(k)).sort().join(',')||'none');
const marks=()=>W(()=>WorldMarks.all(TK.world(1)).sort().join(',')||'none');
const goal=()=>W(()=>document.querySelector('.town-goal').textContent);
const shrine=()=>W(()=>window.__w.shrineState());
const DUPS=[];const dupCheck=async tag=>{const d=await W(()=>{const w=window.__w;if(!w||!w.followers)return null;const npcs=new Set(w.npcs.filter(n=>n.spr.visible).map(n=>n.who||n.sprite));
  const twice=w.followers.filter(F=>F.spr.visible&&npcs.has(F.who)).map(F=>F.who);return twice.length?w.placeId+': '+twice.join(','):null;});if(d&&!DUPS.includes(tag+' '+d))DUPS.push(tag+' '+d);};
const T={},leg=(k,t0)=>{T[k]=(T[k]||0)+(Date.now()-t0)/1000;};
await scrolls();await ready();
// 9. a dark shrine in another town
await W(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();
await W(()=>{const s=window.__w.spots.shrine_;window.__w.player.setPosition(s.x,s.y+40);});await p.waitForTimeout(500);
await walkTo(new Function('return '+spot('shrine_')));const z=await through();
check(z.lines.some(l=>/The board is quiet/.test(l)),'9. Zhuo County\'s shrine (no node): "'+(z.lines[0]||'').slice(0,40)+'"');
// arrive at Black Wind from Dong Zhuo's camp, as the story does
await W(()=>{window.__w.leaving=false;window.__w.go('dong-zhuos-camp');});await p.waitForTimeout(1500);await ready();
await W(()=>{window.__w.leaving=false;window.__w.go('hills-of-black-wind');});await p.waitForTimeout(1500);await ready();await scrolls();
await dupCheck('arriving');console.log('     arrived:',JSON.stringify(await st()),'goal:',(await goal()).slice(0,60));
const sh0=await shrine();
// 1. the first try at n7: a scene, no board; the shrine lights
let t0=Date.now();const START=Date.now();
await walkTo(new Function('return '+spot('1-n7')));let r=await through();leg('1 first try (walk + scene)',t0);
check(!r.duel&&await W(()=>TK.cleared('1-n7')),`1. the first try at n7 plays with no board (${r.lines.length} lines) and clears it`);
check(sh0==='dark'&&await shrine()==='lit',`1. the roadside shrine: ${sh0} -> ${await shrine()}`);
await p.screenshot({path:SP+'/blackwind-1-lit.png'});
console.log('     goal now:',(await goal()).slice(0,80));
// 2. before the shrine is solved: the village gives nothing, the ridges are empty
let td=Date.now();
for(const g of ['pigblood','sheepblood','dogblood']){await walkTo(new Function('return '+npc(`n.gives==='${g}'`)));const x=await through();console.log(`     ${g} giver before: "${(x.lines[x.lines.length-1]||'').slice(0,60)}"`);}
check((await items())==='none','2. no blood given before the shrine is solved: '+await items());
for(const k of ['ridge_left','ridge_right']){await walkTo(new Function('return '+spot(k)));const x=await through();console.log(`     ${k} before: "${(x.lines[0]||'').slice(0,60)}"`);}
const ridgeFolk=await W(()=>window.__w.npcs.filter(n=>n.when&&n.spr.visible).length);
check(ridgeFolk===0&&(await marks())==='none','2. the ridges are empty: '+ridgeFolk+' people up there, marks '+await marks());
// 3. Yangcheng early: bossearly, no board, no cooldown chip
const travelled=await travel('yangcheng');check(travelled,'walked east to Yangcheng by taps');
await walkTo(new Function('return '+spot('1-boss')));r=await through();
const rest3=await W(()=>!!document.querySelector('.tk-rest-chip, .tk-rest'));
check(!r.duel&&!rest3&&r.lines.some(l=>/fight a wind/.test(l)),`3. Yangcheng early: bossearly ("${(r.lines.find(l=>/wind/.test(l))||r.lines[0]||'').slice(0,50)}"), board ${r.duel}, cooldown ${rest3}`);
const nb=await W(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-boss');return {place:w.placeId,d:Math.round(Math.hypot(w.player.x-s.x,w.player.y-s.y)),P:[Math.round(w.player.x),Math.round(w.player.y)],S:[s.x,s.y]};});
await p.screenshot({path:SP+'/blackwind-3-after-defeat.png'});
check(nb.place==='yangcheng'&&nb.d<60,`3. after the defeat he stays by the keep: in ${nb.place}, ${nb.d} px from the spot (at ${nb.P}, spot ${nb.S}); goal: "${(await goal()).slice(0,50)}"`);
// the defeat again: skippable from the second time? (spec) count its lines the second time
await walkTo(new Function('return '+spot('1-boss')));const r3b=await through();console.log(`     second defeat: ${r3b.lines.length} lines (first ${r.lines.length})`);
await travel('hills-of-black-wind');leg('detour (checks 2-3)',td);
// 4. the shrine: its scene and board; it settles; touching it again repeats the hint
t0=Date.now();await walkTo(new Function('return '+spot('1-n7b')));r=await through();
check(r.duel,'4. the lit shrine plays its scene into a board ('+r.lines.length+' lines)');
const sv=await solve();leg('2 shrine (walk + scene; board solved instantly)',t0);await through();
check(sv.won&&await shrine()==='settled','4. shrine board solved ('+sv.mv.join(' ')+'): it settles');
console.log('     goal now:',(await goal()).slice(0,80));
td=Date.now();await walkTo(new Function('return '+spot('1-n7b')));r=await through();leg('detour (checks 2-3)',td);
check(r.lines.some(l=>/Pigs, sheep, dogs/.test(l)),'4. touching the settled shrine repeats the hint: '+r.lines.map(l=>'"'+l.slice(0,40)+'"').join(' '));
// 5. each giver gives once; the count reaches 3/3; the items stay when he leaves the map
t0=Date.now();const counts=[];
for(const g of ['pigblood','sheepblood','dogblood']){await walkTo(new Function('return '+npc(`n.gives==='${g}'`)));await through();counts.push((await goal()).match(/\d\/\d/)?.[0]||'?');
  if(g==='pigblood'){const tw=Date.now();await walkTo(new Function('return '+npc(`(n.who||n.sprite)==='zhangfei'`)));const x=await through();leg('detour (checks 2-3)',tw);T['3 gather (3 givers)']=(T['3 gather (3 givers)']||0)-(Date.now()-tw)/1000;
    check((await marks())==='none'&&x.lines.length>0,`7. Zhang Fei with only the pig's blood: no delivery, "${(x.lines[x.lines.length-1]||'').slice(0,60)}"`);}}
leg('3 gather (3 givers)',t0);
check((await items())==='dogblood,pigblood,sheepblood','5. all three given: '+await items()+'; goal counts '+counts.join(' '));
td=Date.now();await walkTo(new Function('return '+npc(`n.gives==='pigblood'`)));r=await through();leg('detour (checks 2-3)',td);
check((await items())==='dogblood,pigblood,sheepblood','5. talking again gives nothing more: "'+(r.lines[0]||'').slice(0,50)+'"');
// 6. Yangcheng before both ridges: bossearly2
td=Date.now();await travel('yangcheng');await walkTo(new Function('return '+spot('1-boss')));r=await through();
check(!r.duel&&r.lines.length>0,`6. Yangcheng before the ridges: no board; "${(r.lines[r.lines.length-1]||'').slice(0,60)}"`);
check((await items())==='dogblood,pigblood,sheepblood','5. the blood is kept after leaving the map');
await travel('hills-of-black-wind');leg('detour (checks 2-3)',td);
// 7. the ridges, right first then left
t0=Date.now();for(const [k,who] of [['ridge_right','zhangfei'],['ridge_left','guanyu']]){await walkTo(new Function('return '+npc(`(n.who||n.sprite)==='${who}'`)));const x=await through();console.log(`     ${k}: "${(x.lines[x.lines.length-1]||'').slice(0,70)}" — goal "${(await goal()).slice(0,50)}"`);}
leg('4 ridges (right, then left)',t0);
check((await marks())==='ridge_left,ridge_right','7. both ridges supplied by talking to Zhang Fei, then Guan Yu: '+await marks());
// Yangcheng opens the board; a slip keeps the problem and holds it 30 s
t0=Date.now();await travel('yangcheng');await walkTo(new Function('return '+spot('1-boss')));r=await through();leg('5 Yangcheng (walk + scene to the board)',t0);
const TOTAL=(Date.now()-START)/1000;
check(r.duel,'7. with both ridges, Yangcheng opens the board');
await p.screenshot({path:SP+'/blackwind-7-board.png'});
const pid=await W(()=>window.__trainer.p.id);
const wrong=await W(()=>{const t=window.__trainer,first=new Set(t.p.lines.map(L=>L[1]));const els=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')];
  for(const el of els){const cx=+el.getAttribute('cx'),cy=+el.getAttribute('cy');let c=-1,rr=-1;for(let i=0;i<19;i++){if(t.goban.px(i)===cx)c=i;if(t.goban.py(i)===cy)rr=i;}
    const m=String.fromCharCode(97+c)+String.fromCharCode(97+rr);if(c>=0&&rr>=0&&!first.has(m)&&!t.grid[rr][c]){const R=el.getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2,m];}}return null;});
if(wrong){await p.touchscreen.tap(wrong[0],wrong[1]);await p.waitForTimeout(3000);}
const rest=await W(()=>({held:!!document.querySelector('.tk-rest'),chip:(document.querySelector('.tk-rest-chip')||{}).textContent||''}));
const pid2=await W(()=>window.__trainer&&window.__trainer.p.id);
check(!!wrong&&rest.held&&pid2===pid,`7. a slip (${wrong&&wrong[2]}): same problem ${pid2===pid}, held ${rest.held} "${rest.chip}"`);
await W(()=>{const d=TK.ls('tk-rest');for(const k in d)d[k]=Date.now()-1;TK.lsSet('tk-rest',d);});await p.waitForTimeout(1500);
const sb=await solve();const after=await through();
check(sb.won&&await W(()=>TK.cleared('1-boss')),'7. then the boss board is won ('+sb.mv.join(' ')+')');
// 8. the supply items are gone after the win; Start over resets everything
check((await items())==='none','8. after the win, the blood is gone: '+await items());
await scrolls();await ready();
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);p.once('dialog',d=>d.accept());
await p.locator('.tk-menu-panel button',{hasText:'Start over'}).tap();await p.waitForTimeout(2000);
const reset=await W(()=>({items:WorldItems.owned(TK.world(1)).length,marks:WorldMarks.all(TK.world(1)).length,n7:TK.cleared('1-n7'),n7b:TK.cleared('1-n7b')}));
check(!reset.items&&!reset.marks&&!reset.n7&&!reset.n7b,'8. Start over clears items, marks and the shrine: '+JSON.stringify(reset));
check(!DUPS.length,'no hero shown twice (a follower and the same hero standing in the place): '+(DUPS.join('; ')||'none seen'));
// 10. timing
console.log('\n10. timing, phone, taps (dialogue tapped through at about 4 taps a second; boards solved at once):');
for(const [k,v] of Object.entries(T))console.log(`     ${k.padEnd(48)} ${v.toFixed(0)} s`);
const intended=Object.entries(T).filter(([k])=>!k.startsWith('detour')).reduce((a,[,v])=>a+v,0);
console.log(`     intended path (no detours): ${intended.toFixed(0)} s walking and tapping; whole run incl. checks ${TOTAL.toFixed(0)} s; ${LINES} dialogue lines in all`);
console.log(`     estimate for a person: ${intended.toFixed(0)} s + reading (~2.5 s a line on the intended path) + two boards (~1 min each)`);
console.log(`blackwind: ${fails} failed`);await b.close();})();
