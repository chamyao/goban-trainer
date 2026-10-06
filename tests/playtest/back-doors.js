// Phone, taps: rooms folded into one residence (a front hall, a rear hall, a secret room behind them…). For every
// room-to-room door in a book (BOOK, default 12; a test book opens in test mode): standing in the room, a tap on
// the way through walks him to the next room; he arrives on open floor, not on the door back (no bounce), with
// the room's way back on screen; and the same door the other way brings him back.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?'+(BOOK>9?'test=1&':'')+(process.env.PLAYTEST_KIT?'kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/'+BOOK);await p.waitForTimeout(1500);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}await p.waitForTimeout(500);
  for(let i=0;i<30&&await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);i++){await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(150);}};
await ready();
const pairs=await p.evaluate(()=>{const R=window.__w.region,rooms=R.places.filter(x=>x.parent),out=[];for(const r of rooms)for(const l of r.links||[])if(l!==r.parent&&rooms.some(x=>x.id===l))out.push([r.id,l]);return out;});
console.log(`room-to-room doors in Book ${BOOK}: ${pairs.map(x=>x.join(' -> ')).join(', ')||'none'}`);
const settle=()=>p.evaluate(()=>new Promise(r=>{const cam=window.__w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));
const toS=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width,v=w.view(x,y);return [r.left+(v.x-cam.worldView.x)*cam.zoom*k,r.top+(v.y-cam.worldView.y)*cam.zoom*k,r.width,r.height,r.left,r.top];},[x,y]);
for(const [from,to] of pairs){
  // into the room as if from its own way in (the parent, or the room before)
  // the residence's town first (a building's doors are open once its town has been reached), then the room
  await p.evaluate(pl=>{const w=window.__w,r=w.region.places.find(x=>x.id===pl);if(r&&r.parent&&!w.st.visited.includes(r.parent))w.st.visited.push(r.parent);w.save();w.leaving=false;w.cine=null;w.go(pl);},from);await p.waitForTimeout(1200);await ready();
  const ex=await p.evaluate(to=>{const w=window.__w,e=w.exits.find(e=>e.to===to);return e&&{x:e.rect.centerX,y:e.rect.centerY,r:[e.rect.x,e.rect.y,e.rect.width,e.rect.height].map(Math.round),side:e.side};},to);
  if(!check(!!ex,`${from}: a way through to ${to}`))continue;
  // a big compound: the door may be off screen where he comes in; he walks toward it first, as a player would
  const onS=s=>s[0]>=s[4]+8&&s[0]<=s[4]+s[2]-8&&s[1]>=s[5]+60&&s[1]<=s[5]+s[3]-8;
  await settle();let s=await toS(ex.x,ex.y),walks=0;
  for(;!onS(s)&&walks<6;walks++){const cx=s[4]+s[2]/2,cy=s[5]+s[3]/2,k=Math.min(1,(s[2]/2-30)/Math.max(1,Math.abs(s[0]-cx)),(s[3]/2-80)/Math.max(1,Math.abs(s[1]-cy)));
    await p.touchscreen.tap(cx+(s[0]-cx)*k,cy+(s[1]-cy)*k);await p.waitForTimeout(1800);await settle();s=await toS(ex.x,ex.y);}
  check(onS(s),`${from}: the door to ${to} is on screen${walks?` after ${walks} tap(s) toward it`:''} (at ${s.slice(0,2).map(Math.round)})`);
  await p.touchscreen.tap(s[0],s[1]);let t0=Date.now(),arrived=false;for(let i=0;i<50;i++){await p.waitForTimeout(150);if(await p.evaluate(to=>window.__w.placeId===to&&!window.__w.leaving&&!!window.__w.player,to)){arrived=true;break;}}
  if(!check(arrived,`${from}: a tap on the door walks him through to ${to}${arrived?` (${((Date.now()-t0)/1000).toFixed(1)} s)`:` (still in ${await p.evaluate(()=>window.__w.placeId)})`}`))continue;
  await ready();await p.waitForTimeout(900);
  const a=await p.evaluate(from=>{const w=window.__w,G=w.walkGrid(),P=w.player,back=w.exits.find(e=>e.to===from);
    const free=G.free(Math.floor(P.x/G.C),Math.floor((P.y-3)/G.C))||G.free(Math.floor(P.x/G.C),Math.floor((P.y-3)/G.C)-1);
    const onBack=back&&P.x>back.rect.x-2&&P.x<back.rect.right+2&&P.y>back.rect.y-2&&P.y<back.rect.bottom+4;
    return {place:w.placeId,P:[Math.round(P.x),Math.round(P.y)],free,onBack:!!onBack,back:back&&{x:back.rect.centerX,y:back.rect.centerY}};},from);
  check(a.place===to&&a.free,`${to}: he arrives on open floor (${a.P})${a.onBack?' (on the doorway back, as when walking in from the street)':''}`);
  // his first step from there, a tap on the floor further in, keeps him in the room (no bounce back through the door)
  const inner=await p.evaluate(from=>{const w=window.__w,G=w.walkGrid(),P=w.player,bk=w.exits.find(e=>e.to===from);/* away from the door he came in by, whichever wall it's in */const [ux,uy]={N:[0,1],S:[0,-1],W:[1,0],E:[-1,0]}[bk&&bk.side]||[0,-1];for(const d of [40,32,24,48,16])for(const [dx,dy] of [[ux*d,uy*d],[ux*d-uy*d,uy*d+ux*d],[ux*d+uy*d,uy*d-ux*d]]){const x=P.x+dx,y=P.y+dy;if(G.free(Math.floor(x/G.C),Math.floor(y/G.C))&&!w.pick(x,y))return [x,y];}return null;},from);
  if(inner){await settle();const si=await toS(inner[0],inner[1]);await p.touchscreen.tap(si[0],si[1]);await p.waitForTimeout(1500);
    const st=await p.evaluate(()=>({place:window.__w.placeId,leaving:window.__w.leaving,P:[Math.round(window.__w.player.x),Math.round(window.__w.player.y)]}));
    check(st.place===to&&!st.leaving,`${to}: his first step further in keeps him in the room (now ${st.place} at ${st.P})`);}
  if(!check(!!a.back,`${to}: a way back to ${from}`))continue;
  await settle();const s2=await toS(a.back.x,a.back.y);check(s2[0]>=s2[4]&&s2[0]<=s2[4]+s2[2]&&s2[1]>=s2[5]+60&&s2[1]<=s2[5]+s2[3],`${to}: the way back is on screen (at ${s2.slice(0,2).map(Math.round)})`);
  await p.touchscreen.tap(s2[0],s2[1]);let back=false;for(let i=0;i<50;i++){await p.waitForTimeout(150);if(await p.evaluate(f=>window.__w.placeId===f&&!window.__w.leaving,from)){back=true;break;}}
  check(back,`${to}: a tap on the way back brings him to ${from}`);
  await p.screenshot({path:require('path').join(__dirname,'out',`back-door-${from}-${to}.png`)});
}
console.log(`back-doors: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
