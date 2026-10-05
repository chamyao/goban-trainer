// Tap reach on phones (iPhone 13, iPhone SE): a tap near a person (up to about 22 screen px off their
// figure) or near a story spot's object picks them, a tap well clear doesn't; no "Tap" label; open story
// spots glow (gold main, pale blue side, none on shrines) and not during a talk; a tap on the goal line walks
// him to the goal and its scene starts; walking into a spot he stops, faces it, and the scene starts after a beat.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
for(const DEV of ['iPhone 13','iPhone SE']){
  console.log('== '+DEV);
  const ctx=await b.newContext({...devices[DEV]});const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
  await p.evaluate(()=>{['1-start','1-c1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
  for(let i=0;i<8;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(300);}}
  const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
  await ready();await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();
  // reach, measured through pick() at screen offsets from each target (no walking)
  const reach=await p.evaluate(()=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,k=cv.clientWidth/w.scale.width*cam.zoom;const out={people:[],spot:null};
    for(const n of w.npcs.filter(n=>n.spr.visible).slice(0,6)){n.wander=false;const right=n.spr.x+n.spr.width/2-2,mid=n.spr.y-n.spr.height/2;
      const hits=[0,10,18,26,40].map(d=>{const t=w.pick(right+d/k,mid);return t&&t.kind==='npc'&&t.n===n?'yes':t?(t.kind==='npc'?'('+t.n.sprite+')':'('+t.kind+')'):'no';});out.people.push({who:n.sprite,hits});}
    const s=Object.values(w.spots).find(s=>s.node==='1-n1');if(s)out.spot=[0,20,30,45,70].map(d=>{const t=w.pick(s.x+d/k,s.y);return t&&t.kind==='spot'&&t.s===s;});
    out.k=+k.toFixed(2);return out;});
  // a near tap picks them, or someone/something even nearer (the nearest wins); a far one picks nothing of theirs
  for(const r of reach.people)check(r.hits.slice(0,3).every(x=>x!=='no')&&r.hits[4]!=='yes',`${r.who}: a tap 0/10/18/26/40 px right of the figure picks: ${r.hits.join('/')}`);
  if(reach.spot)check(reach.spot[0]&&reach.spot[1]&&!reach.spot[4],`the notice (1-n1): a tap 0/20/30/45/70 px from it picks it: ${reach.spot.map(x=>x?'yes':'no').join('/')}`);
  // no Tap label anywhere near him
  await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(n=>n.spr.visible);w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';});await p.waitForTimeout(700);
  check(!(await p.evaluate(()=>{const h=document.querySelector('.town-hint');return !!h&&!h.hidden;})),'no "Tap" label in front of a villager');
  check(await p.evaluate(()=>!!window.__w.focusMark&&window.__w.focusMark.visible),'a soft ring marks the villager he would talk to');
  // glow: the open main spot glows gold; the shrine doesn't
  const gl=await p.evaluate(()=>{const w=window.__w;return Object.entries(w.spots).map(([k,s])=>({k,node:s.node,glow:!!(s.glow&&s.glow.visible),col:s.glow&&s.glow.fillColor,open:!!(s.node&&w.openQuest(s)),shrine:s.use==='shrine'}));});
  const n1=gl.find(x=>x.node==='1-n1');check(n1&&n1.glow&&n1.col===0xffd27a,'the open main spot (the notice) glows gold');
  check(gl.filter(x=>x.shrine).every(x=>!x.glow),'the shrine has no glow');
  check(gl.filter(x=>x.glow).every(x=>x.open),'only open story spots glow');
  // a tap on the goal line walks him there, and the scene starts
  await p.evaluate(()=>{const w=window.__w;w.player.setPosition(w.player.x,w.player.y);const s=Object.values(w.spots).find(s=>s.node==='1-n1');const G=w.walkGrid();for(const [dx,dy] of [[-150,40],[150,40],[0,140],[-120,-60],[120,-60]]){const x=s.x+dx,y=s.y+dy;if(G.free(Math.floor(x/G.C),Math.floor((y-3)/G.C))){w.player.setPosition(x,y);break;}}});
  await p.waitForTimeout(800);const d0=await p.evaluate(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-n1');return Math.round(Math.hypot(w.player.x-s.x,w.player.y-s.y));});
  await p.locator('.town-goal').tap();let started=0,stopAt=0,startAt=0,faced=null;const t0=Date.now();
  for(let i=0;i<120;i++){await p.waitForTimeout(100);const s=await p.evaluate(()=>{const w=window.__w;return {busy:w.ui.busy()||!!w.cine,walk:!!w.walk,appr:!!w.approaching,f:w.player.facing};});
    if(!s.walk&&!stopAt&&Date.now()-t0>300)stopAt=Date.now();if(s.busy){startAt=Date.now();faced=s.f;started=1;break;}}
  check(started,`a tap on the goal line walks him ${d0} px to the notice and its scene starts (${((startAt-t0)/1000).toFixed(1)} s)`);
  if(started)check(startAt-stopAt>=200,`he stops and the scene starts after a beat (${startAt-stopAt} ms), facing ${faced}`);
  // the glow is hidden while the scene plays
  if(started)check(await p.evaluate(()=>Object.values(window.__w.spots).every(s=>!s.glow||!s.glow.visible)),'no glow while the scene plays');
  await ctx.close();}
console.log(`tap-reach: ${fails} failed`);await b.close();})();
