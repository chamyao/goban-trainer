// Phone upright, Genshin: the isometric apron (ground, trees and rocks past the map's edge). For a few
// places: load time (go() to ready), frame rate over 3 s standing and walking, sprites drawn, how much of
// the screen is beyond the map (flat void colour vs apron), and that taps out on the apron neither walk
// Liu Bei off the map nor pick anything. FPS here is headless software GL: compare runs, not absolutes.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?kit=genshin#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<100;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&window.__w.sys.isActive())))break;await p.waitForTimeout(100);}};
await ready();await p.waitForTimeout(800);
const fps=()=>p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(Math.round(n/((performance.now()-t0)/1000)));};requestAnimationFrame(f);}));
for(const place of (process.env.PLACES||'lousang-village,envoys-road,yangcheng').split(',')){
  const t0=Date.now();await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},place);await p.waitForTimeout(300);await ready();const load=Date.now()-t0;
  for(let i=0;i<10&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);}
  await p.waitForTimeout(800);
  const still=await fps();
  const info=await p.evaluate(()=>{const w=window.__w,cam=w.cameras.main,vw=cam.worldView,wb=w.physics.world.bounds;
    const drawn=w.children.list.filter(o=>o.visible&&o.texture).length;
    let out=0,n=0;for(let i=0;i<20;i++)for(let j=0;j<20;j++){const f=w.flat(vw.x+vw.width*(i+.5)/20,vw.y+vw.height*(j+.5)/20);n++;if(f.x<0||f.y<0||f.x>wb.width||f.y>wb.height)out++;}
    return {drawn,beyond:Math.round(100*out/n)};});
  // the screen's colours: how much is the flat void colour (nothing drawn there)
  const shot=await p.screenshot();const flat=await p.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;
    const bg=(window.__w.kit&&window.__w.kit.isoVoid)||'#549842';const R=parseInt(bg.slice(1,3),16),G=parseInt(bg.slice(3,5),16),B=parseInt(bg.slice(5,7),16);let k=0,n=0;for(let i=0;i<d.length;i+=4*37){n++;if(Math.abs(d[i]-R)<3&&Math.abs(d[i+1]-G)<3&&Math.abs(d[i+2]-B)<3)k++;}return Math.round(100*k/n);},shot.toString('base64'));
  await p.screenshot({path:require('path').join(__dirname,'out',`apron-${place}.png`)});
  // walk a little: frame rate while the camera follows
  await p.evaluate(()=>{const w=window.__w,P=w.player;w.tapAt(P.x+80,P.y+40);});const moving=await fps();
  // taps out on the apron, past each side of the map: nothing picked, and he stays on the map
  const r=await p.evaluate(async()=>{const w=window.__w,wb=w.physics.world.bounds,res=[];
    for(const [fx,fy] of [[-40,wb.height/2],[wb.width+40,wb.height/2],[wb.width/2,-40],[wb.width/2,wb.height+40],[-60,-60],[wb.width+60,wb.height+60]]){
      const v=w.view(fx,fy);const t=w.pick(fx,fy,v.x,v.y);w.walk=null;w.tapAt(fx,fy,v.x,v.y);await new Promise(r=>setTimeout(r,1500));
      const P=w.player;res.push({at:[fx,fy].map(Math.round),picked:t?t.kind:null,P:[Math.round(P.x),Math.round(P.y)],inside:P.x>=0&&P.y>=0&&P.x<=wb.width&&P.y<=wb.height+4,place:w.placeId});}
    return res;});
  console.log(`${place}: load ${load} ms, ${info.drawn} sprites, fps still ${still} / walking ${moving}, beyond the map ${info.beyond}% of the screen, bare void colour ${flat}%`);
  for(const x of r)check(!x.picked&&x.inside,`${place}: tap on the apron at ${x.at}: picks ${x.picked||'nothing'}, he ends at ${x.P} in ${x.place}${x.inside?'':' (OFF THE MAP)'}`);
}
console.log(fails?`iso-apron: ${fails} failed`:'iso-apron: all ok');await b.close();process.exit(fails?1:0);})();
