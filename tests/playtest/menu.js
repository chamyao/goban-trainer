// Phone, taps: the in-game menu. Every button fits on screen; voice cycles zh -> en -> off and is
// remembered; music toggles and is remembered; the art switch cycles every kit and the world comes
// back in the same place with the same progress; Chronicle opens and closes; Map goes out onto the
// overworld; Start over asks first (Cancel keeps everything, OK forgets it). After closing the menu
// a tap on the ground still moves Liu Bei.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1';
await p.goto(URL);await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');localStorage.removeItem('tk-kit');});await p.reload();await p.waitForTimeout(1500);
const scrolls=async()=>{for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}};
const ready=async()=>{for(let i=0;i<75;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&window.__w.sys.isActive())))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
await scrolls();await ready();
await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();
const menu=async open=>{const t=p.locator('.tk-menu-btn',{hasText:'Menu'});const isOpen=await p.evaluate(()=>!document.querySelector('.tk-menu-panel').hidden);if(isOpen!==open){await t.tap();await p.waitForTimeout(300);}};
const btn=re=>p.locator('.tk-menu-panel button').filter({hasText:re}).first();
await menu(true);await p.screenshot({path:SP+'/menu-open.png'});
const btns=await p.evaluate(()=>[...document.querySelectorAll('.tk-menu-panel button')].filter(b=>!b.hidden).map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent.trim(),in:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,h:Math.round(r.height)};}));
console.log('menu buttons:',btns.map(x=>x.t).join(' | '));
check(btns.length>=5&&btns.every(x=>x.in),'every menu button is on screen'+(btns.filter(x=>!x.in).length?' — off: '+btns.filter(x=>!x.in).map(x=>x.t).join(', '):''));
console.log((btns.every(x=>x.h>=32)?'ok   ':'NOTE ')+'menu buttons at least 32 px tall (thumb size): '+btns.map(x=>x.h).join(','));
// voice
const vt=async()=>(await btn(/voice|Voice/).textContent()).trim();
const v0=await vt(),seq=[v0];for(let i=0;i<3;i++){await btn(/voice|Voice/).tap();await p.waitForTimeout(200);seq.push(await vt());}
check(/Chinese/.test(seq[0])&&/English/.test(seq[1])&&/off/.test(seq[2])&&seq[3]===seq[0],'voice cycles: '+seq.join(' -> '));
check(!(await p.evaluate(()=>document.querySelector('.tk-menu-panel').hidden)),'the menu stays open after a switch');
await btn(/voice|Voice/).tap();await p.waitForTimeout(200);   // English
// music
const m0=(await btn(/Music/).textContent()).trim();await btn(/Music/).tap();await p.waitForTimeout(200);const m1=(await btn(/Music/).textContent()).trim();
check(m0!==m1,`music toggles: ${m0} -> ${m1}`);
await p.reload();await p.waitForTimeout(1500);await scrolls();await ready();await menu(true);
check(/English/.test(await vt())&&(await btn(/Music/).textContent()).trim()===m1,'voice and music are remembered after a reload');
await btn(/Music/).tap();await p.waitForTimeout(200);
// art switch: every kit, same place and progress
const before=await p.evaluate(()=>({place:window.__w.placeId,cleared:['1-start','1-c1','1-n1','1-i1'].map(k=>TK.cleared(k)).join()}));
const kits=[];for(let i=0;i<4;i++){const t=(await btn(/画风/).textContent()).trim();kits.push(t);await btn(/画风/).tap();await p.waitForTimeout(1500);await scrolls();await ready();
  const now=await p.evaluate(()=>({place:window.__w.placeId,cleared:['1-start','1-c1','1-n1','1-i1'].map(k=>TK.cleared(k)).join()}));
  await p.screenshot({path:SP+`/menu-kit-${i}.png`});
  check(now.place===before.place&&now.cleared===before.cleared,`after switching from "${t}": still in ${now.place}, progress ${now.cleared}`);await menu(true);}
check(new Set(kits.slice(0,3)).size===3&&kits[3]===kits[0],'the art switch cycles every kit and comes back: '+kits.join(' -> '));
// chronicle: a scroll listing the scenes; seen ones replay
const chronOpen=()=>p.evaluate(()=>!!document.querySelector('.tk-scroll-wrap .tk-chron'));
await btn(/Chronicle/).tap();await p.waitForTimeout(800);await p.screenshot({path:SP+'/menu-chronicle.png'});
check(await chronOpen(),'Chronicle opens');
const seen=await p.evaluate(()=>[...document.querySelectorAll('.tk-chron button')].filter(b=>!b.disabled).map(b=>b.querySelector('b').textContent));
console.log('     seen scenes listed:',seen.join(' | '));
await p.touchscreen.tap(8,8);await p.waitForTimeout(400);   // a tap outside the scroll
console.log((await chronOpen()?'NOTE a tap outside the Chronicle leaves it open':'ok   a tap outside closes the Chronicle'));
if(await chronOpen()){const closeY=await p.evaluate(()=>{const b=[...document.querySelectorAll('.tk-scroll-wrap .tk-scroll-go')].pop();const r=b.getBoundingClientRect();return Math.round(r.top);});
  console.log((closeY>(await p.evaluate(()=>innerHeight))?'NOTE':'ok  ')+' the Close button starts '+closeY+' px down (screen '+(await p.evaluate(()=>innerHeight))+')');
  await p.locator('.tk-scroll-wrap .tk-scroll-go',{hasText:'Close'}).tap();await p.waitForTimeout(400);}
check(!(await chronOpen()),'Chronicle closes');
// replay the prologue from the Chronicle, then play on
await menu(true);await btn(/Chronicle/).tap();await p.waitForTimeout(600);
await p.locator('.tk-chron button:not([disabled])').first().tap();await p.waitForTimeout(600);
let steps=0;for(let i=0;i<300;i++){await p.waitForTimeout(150);const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();steps++;continue;}
  const busy=await p.evaluate(()=>!!document.querySelector('.tk-story .town-dlg:not([hidden]), .tk-cut, .tk-story')||(window.TKStory&&TKStory.busy));if(!busy&&i>10)break;
  await p.touchscreen.tap(195,560);steps++;}
check(steps>0,'the Prologue replays from the Chronicle ('+steps+' taps)');
await ready();
// after the menu: a tap on the ground moves him
await menu(false);
const p0=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y]);
const tgt=await p.evaluate(()=>{const w=window.__w,G=w.walkGrid();for(const [dx,dy] of [[40,0],[-40,0],[0,40],[0,-40]]){const x=w.player.x+dx,y=w.player.y+dy;if(G.free(Math.floor(x/G.C),Math.floor((y+1)/G.C))&&!w.pick(x,y))return [x,y];}return null;});
if(tgt){const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k,r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},tgt);await p.touchscreen.tap(...s);await p.waitForTimeout(1200);}
const p1=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y]);
check(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])>6,'after using the menu, a tap on the ground moves Liu Bei');
// map: out onto the overworld
await menu(true);await btn(/Map/).tap();await p.waitForTimeout(2000);await ready();await p.screenshot({path:SP+'/menu-map.png'});
check(await p.evaluate(()=>window.__w.place.archetype==='overworld'),'Map goes out onto the overworld: '+await p.evaluate(()=>window.__w.placeId));
// start over: Cancel keeps progress, OK forgets it
await menu(true);p.once('dialog',d=>d.dismiss());await btn(/Start over/).tap();await p.waitForTimeout(800);
check(await p.evaluate(()=>TK.cleared('1-n1')),'Start over, Cancel: progress kept');
await menu(true);p.once('dialog',d=>d.accept());await btn(/Start over/).tap();await p.waitForTimeout(2000);await scrolls();await ready();
const after=await p.evaluate(()=>({n1:TK.cleared('1-n1'),start:TK.cleared('1-start'),place:window.__w&&window.__w.placeId,goal:document.querySelector('.town-goal')&&document.querySelector('.town-goal').textContent}));
check(!after.n1&&!after.start&&after.place==='lousang-village','Start over, OK: progress gone, back in '+after.place+', goal "'+(after.goal||'').slice(0,40)+'"');
console.log(`menu: ${fails} failed`);await b.close();})();
