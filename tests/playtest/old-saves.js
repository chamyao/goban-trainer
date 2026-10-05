// Phone: saves an older version (or a broken browser store) could leave behind. Each one must load
// with no page error into a real place, with a sensible next goal, Liu Bei standing on open ground,
// and a tap on the ground moving him.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const CASES=[
  // [name, setup run in the page (before reload), what nextMain should be (or null to skip)]
  ['before the mulberry tree and indoor beats: only n1, n2 cleared', ()=>{TK.markCleared('1-n1');TK.markCleared('1-n2');}, '1-as'],
  ['a place id that no longer exists', ()=>{TK.markCleared('1-start');localStorage.setItem('tk-world-1',JSON.stringify({visited:['lousang-village','zhuo-county'],place:'zhuo-county--teahouse-old',pos:{place:'zhuo-county--teahouse-old',x:50,y:50,f:'down'}}));}, '1-c1'],
  ['a save in a place since renamed (Dong Zhuo\'s camp)', ()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-world-1',JSON.stringify({visited:['lousang-village','zhuo-county','dong-zhuos-camp'],place:'dong-zhuos-camp--tent-1',pos:{place:'dong-zhuos-camp--tent-1',x:60,y:60,f:'down'}}));}, '1-as', 'the-hills-north-of-guangzong--tent-1'],
  ['a stored position inside a wall', ()=>{TK.markCleared('1-start');localStorage.setItem('tk-world-1',JSON.stringify({visited:['lousang-village','zhuo-county'],place:'zhuo-county',pos:{place:'zhuo-county',x:4,y:4,f:'down'}}));}, '1-c1'],
  ['a stored position off the map', ()=>{TK.markCleared('1-start');localStorage.setItem('tk-world-1',JSON.stringify({visited:['lousang-village'],place:'lousang-village',pos:{place:'lousang-village',x:99999,y:-500,f:'up'}}));}, '1-c1'],
  ['an art kit that no longer exists', ()=>{TK.markCleared('1-start');localStorage.setItem('tk-kit','ninja-adventure-v1');}, '1-c1'],
  ['a party with a hero the game does not know', ()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhaoyun_old']);}, '1-as'],
  ['corrupt JSON in every campaign store', ()=>{for(const k of ['tk-world-1','tk-party','tk-items','tk-at','tk-ride','tk-rest','gt-progress'])localStorage.setItem(k,'{oops');}, '1-start'],
  ['a save with the whole book done', ()=>{TK.world(1).nodes.forEach(n=>TK.markCleared(n.key));}, null],
];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});let fails=0;
for(const [name,setup,expect,wantPlace] of CASES){
  const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>{errs.push(e.message);console.log('ERR',e.message);});
  await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('tk-guide','off');});
  await p.evaluate(setup);await p.reload();await p.waitForTimeout(1800);
  for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
  let up=false;for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))  {up=true;break;}await p.waitForTimeout(200);}
  await p.waitForTimeout(800);
  // a scene that starts on arrival (the mulberry tree) is fine: tap through it
  for(let i=0;i<60&&up&&await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);i++){await p.touchscreen.tap(195,560);await p.waitForTimeout(150);}
  if(up&&await p.locator('.tk-duel svg').count()){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap();await p.waitForTimeout(1200);}
  const s=up?await p.evaluate(()=>{const w=window.__w,G=w.walkGrid(),nm=w.nextMain();return {place:w.placeId,known:w.region.places.some(x=>x.id===w.placeId),next:nm?nm.node:null,goal:document.querySelector('.town-goal').textContent,
    onGround:G.free(Math.floor(w.player.x/G.C),Math.floor((w.player.y-3)/G.C))||(w.placeId.includes('--')&&G.free(Math.floor(w.player.x/G.C),Math.floor((w.player.y-3)/G.C)-1)),   /* a room's arrival is on its doorway, the cell below the floor */inMap:w.player.x>=0&&w.player.y>=0&&w.player.x<=w.physics.world.bounds.width&&w.player.y<=w.physics.world.bounds.height+4,P:[Math.round(w.player.x),Math.round(w.player.y)]};}):null;
  let moved=false;
  if(s){const tgt=await p.evaluate(()=>{const w=window.__w,G=w.walkGrid();for(const r of [40,60,24])for(const [dx,dy] of [[r,0],[-r,0],[0,r],[0,-r]]){const x=w.player.x+dx,y=w.player.y+dy;if(G.free(Math.floor(x/G.C),Math.floor((y+1)/G.C))&&!w.pick(x,y)){const pa=w.findPath(w.player.x,w.player.y-3,x,y+1);if(pa&&pa.length)return [x,y];}}return null;});
    if(tgt){const p0=s.P;const sc=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k,r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},tgt);
      await p.touchscreen.tap(...sc);await p.waitForTimeout(1300);const p1=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y]);moved=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])>6;}}
  const ok=!!s&&!errs.length&&(!wantPlace||s.place===wantPlace)&&s.known&&s.onGround&&s.inMap&&moved&&(expect===null?s.next===null:s.next===expect);
  if(!ok){fails++;await p.screenshot({path:SP+'/old-save-'+name.replace(/[^a-z]+/gi,'-').slice(0,40)+'.png'});}
  console.log(`${ok?'ok  ':'FAIL'} ${name}: ${s?`in ${s.place}${s.known?'':' (UNKNOWN)'} at ${s.P}${s.onGround?'':' (NOT ON OPEN GROUND)'}${s.inMap?'':' (OFF THE MAP)'}, next ${s.next} (want ${expect}), moves ${moved}, goal "${s.goal.slice(0,50)}"`:'the world never came up'}${errs.length?' errors: '+errs.join('; '):''}`);
  await ctx.close();
}
console.log(`old saves: ${CASES.length-fails}/${CASES.length}`);await b.close();})();
