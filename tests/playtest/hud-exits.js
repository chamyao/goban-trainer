// Phone upright: every way off the edge of every map can be seen and tapped. With Liu Bei walked up to
// it (the camera as close as it goes), some part of the exit is on screen, not under the goal line and
// not under a button (a tap there would press the button, e.g. leave full window).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices[process.env.PLAYTEST_DEVICE||'iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.world(1).nodes.forEach(n=>TK.markCleared(n.key));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<8;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(400);};
await ready();
const places=await p.evaluate(()=>window.__w.region.places.filter(x=>!x.parent).map(x=>x.id));
let fails=0,checked=0;
for(const pl of places){
  await p.evaluate(pl=>{const w=window.__w;w.ui.busy=()=>false;w.cine=null;w.leaving=false;w.go(pl);},pl);await p.waitForTimeout(1200);await ready();
  const exits=await p.evaluate(()=>window.__w.exits.map((e,i)=>({i,to:e.to,side:e.side,door:e.side==='N'&&e.rect.width<16})).filter(e=>!e.door));
  for(const e of exits){
    const r=await p.evaluate(i=>{const w=window.__w,e=w.exits[i],G=w.walkGrid(),V={N:[0,1],S:[0,-1],E:[-1,0],W:[1,0]}[e.side]||[0,0];
      for(const back of [20,28,36,48,64]){const x=e.rect.centerX+V[0]*back,y=e.rect.centerY+V[1]*back+3;if(G.free(Math.floor(x/G.C),Math.floor((y-3)/G.C))){w.player.setPosition(x,y);return true;}}return false;},e.i);
    if(!r)continue;await p.waitForTimeout(500);
    const s=await p.evaluate(i=>{const w=window.__w,e=w.exits[i],cam=w.cameras.main,cv=w.game.canvas,R=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;
      const toS=(x,y)=>[R.left+(x-cam.worldView.x)*cam.zoom*k,R.top+(y-cam.worldView.y)*cam.zoom*k];
      const g=document.querySelector('.town-goal');const gb=g&&!g.hidden?g.getBoundingClientRect():null;let ok=0,n=0,under='';
      for(let a=0.1;a<1;a+=0.2)for(let c=0.1;c<1;c+=0.2){const [sx,sy]=toS(e.rect.x+e.rect.width*a,e.rect.y+e.rect.height*c);if(sx<0||sy<0||sx>innerWidth||sy>innerHeight)continue;n++;
        const el=document.elementFromPoint(sx,sy),inGoal=gb&&sx>gb.left&&sx<gb.right&&sy>gb.top&&sy<gb.bottom;
        // clear and a finger's room from the screen's edge, the goal line and every button
        const M=12,near=q=>sx>q.left-M&&sx<q.right+M&&sy>q.top-M&&sy<q.bottom+M;
        const hud=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>b.getBoundingClientRect());if(gb)hud.push(gb);
        const room=sx>M&&sy>M&&sx<innerWidth-M&&sy<innerHeight-M&&!hud.some(near);
        if(el===cv&&!inGoal&&room)ok++;else under=inGoal?'the goal line':el!==cv?(el&&(el.className||el.tagName)):!room?'the screen edge or a button\'s margin':'';}
      return {ok,n,under};},e.i);
    checked++;const good=s.ok>0;if(!good)fails++;
    if(!good||process.env.VERBOSE)console.log(`${good?'ok  ':'FAIL'} ${pl} -> ${e.to} (${e.side} edge): ${s.ok} of ${s.n} points of the exit on screen and clear of the HUD${good?'':', the rest under '+s.under}`);
  }
}
console.log(`hud-exits: ${checked} exits, ${fails} hidden`);if(!checked)console.log('FAIL nothing checked');await b.close();})();
