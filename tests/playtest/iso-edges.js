// Phone upright, the Genshin (isometric) kit: with the camera kept inside the diamond, Liu Bei stays on
// screen and clear of the HUD wherever he stands: near each corner and edge of every outdoor map, and at
// every way out (the road off the edge, a building's door). Each spot: the nearest cell he can walk to, a moment for
// the camera, then where he and the exit are drawn.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices[process.env.DEV||'iPhone 13']});const p=await ctx.newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok){fails++;console.log('FAIL '+what);}return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?kit='+(process.env.PLAYTEST_KIT||'genshin')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<75;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(700);};
await ready();
const places=process.env.PLACES?process.env.PLACES.split(','):await p.evaluate(()=>window.__w.region.places.map(x=>x.id).filter(id=>!id.includes('--')&&id!=='overworld'));
const settle=()=>p.evaluate(()=>new Promise(r=>{const cam=window.__w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>60){clearInterval(t);r();}},40);}));
for(const place of places){
  await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},place);await p.waitForTimeout(1200);await ready();
  for(let i=0;i<10&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);}
  const spots=await p.evaluate(()=>{const w=window.__w,G=w.walkGrid(),C=G.C,W=w.physics.world.bounds.width,H=w.physics.world.bounds.height,out=[];
    // the cells he can walk to from where he arrived
    const seen=new Set(),q=[[Math.floor(w.player.x/C),Math.floor((w.player.y-3)/C)]];const key=(x,y)=>x+','+y;
    for(const [x,y] of q.splice(0)){q.push([x,y]);}
    for(let i=0;i<q.length;i++){const [x,y]=q[i];if(seen.has(key(x,y)))continue;seen.add(key(x,y));for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!seen.has(key(nx,ny))&&G.free(nx,ny))q.push([nx,ny]);}}
    const near=(x,y)=>{const cx=Math.floor(x/C),cy=Math.floor(y/C);for(let r=0;r<40;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(seen.has(key(cx+dx,cy+dy)))return [(cx+dx)*C+C/2,(cy+dy)*C+C/2];return null;};
    for(const [n,fx,fy] of [['NW corner',0,0],['NE corner',1,0],['SW corner',0,1],['SE corner',1,1],['N edge',.5,0],['S edge',.5,1],['W edge',0,.5],['E edge',1,.5]]){const q=near(fx*W,fy*H);if(q)out.push({n,at:q});}
    for(const e of w.exits){const r=e.rect,inX=Math.min(Math.max(r.centerX,C),W-C),inY=Math.min(Math.max(r.centerY+(e.side==='N'?12:0),C),H-C);const q=near(inX,inY);if(q)out.push({n:'exit to '+e.to,at:q,exit:[Math.min(Math.max(q[0],r.x),r.right),Math.min(Math.max(q[1],r.y),r.bottom)]});   /* the exit's point nearest him (a road off the edge is a long strip) */}
    return out;});
  let bad=0;
  for(const s of spots){
    await p.evaluate(([x,y])=>{const w=window.__w;w.walk=null;w.player.body.reset(x,y);(w.followers||[]).forEach(F=>F.spr.setPosition(x,y));},s.at);await p.waitForTimeout(150);await settle();
    const r=await p.evaluate(([at,ex])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,cr=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;
      const toS=(x,y)=>{const v=w.view(x,y);return [cr.left+(v.x-cam.worldView.x)*cam.zoom*k,cr.top+(v.y-cam.worldView.y)*cam.zoom*k];};
      const hud=Math.max(0,...[...document.querySelectorAll('.town-goal,.tk-menu-btn,.tk-head-btns')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().bottom));
      const P=toS(w.player.x,w.player.y),head=[P[0],P[1]-w.player.displayHeight*cam.zoom*k];
      const E=ex?toS(ex[0],ex[1]):null;
      return {P:P.map(Math.round),head:head.map(Math.round),E:E&&E.map(Math.round),W:Math.round(cr.width),H:Math.round(cr.height),L:cr.left,T:cr.top,hud:Math.round(hud)};},[s.at,s.exit||null]);
    const m=8,inX=x=>x>=r.L+m&&x<=r.L+r.W-m,inY=y=>y>=r.T+m&&y<=r.T+r.H-m;
    const ok1=check(inX(r.P[0])&&inY(r.P[1])&&r.head[1]>=r.hud-4,`${place} ${s.n}: Liu Bei drawn at ${r.P} (head ${r.head[1]}, HUD to ${r.hud}, screen ${r.W}x${r.H})`);
    const ok2=!r.E||check(inX(r.E[0])&&inY(r.E[1])&&r.E[1]>=r.hud,`${place} ${s.n}: the way out drawn at ${r.E} (HUD to ${r.hud})`);
    if(!ok1||!ok2)bad++;
  }
  console.log(`${bad?'FAIL':'ok  '} ${place}: ${spots.length-bad}/${spots.length} spots`);
}
console.log(`iso-edges: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
