// A tool, not a test: every place of Book 1 on a phone (KIT=genshin by default, DEV="iPhone 13"), a screenshot
// each in out/tour/ and a line of numbers: share of the screen beyond the map, where the party, people, exits and spots land.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const path=require('path'),OUT=path.join(__dirname,'out','tour');require('fs').mkdirSync(OUT,{recursive:true});
const V=path.join(__dirname,'vendor/phaser.min.js');
const PLACES=(process.env.PLACES||'').split(',').filter(Boolean);
const DEV=process.env.DEV||'iPhone 13';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
const ctx=await b.newContext({...devices[DEV]});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200));});
await p.route('**/phaser.min.js',r=>r.fulfill({path:V,contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?kit='+(process.env.KIT||'genshin')+'#/tk/1');await p.waitForTimeout(1500);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1800);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(900);};
await ready();
const places=PLACES.length?PLACES:await p.evaluate(()=>window.__w.region.places.map(x=>x.id).filter(id=>id!=='overworld'));
const dev=(process.env.KIT||'genshin')+'-'+DEV.replace(/ /g,'_');
for(const place of places){
  await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},place);await p.waitForTimeout(1200);await ready();
  for(let i=0;i<8&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);}
  const r=await p.evaluate(()=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,cr=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width,iso=w.iso;
    const toS=(x,y)=>{const v=w.view(x,y);return [Math.round(cr.left+(v.x-cam.worldView.x)*cam.zoom*k),Math.round(cr.top+(v.y-cam.worldView.y)*cam.zoom*k)];};
    const wb=w.physics.world.bounds,P=w.player,G=w.walkGrid();
    // how much of the screen shows beyond the map (void)
    let out=0,n=0;const vw=cam.worldView;for(let i=0;i<20;i++)for(let j=0;j<20;j++){const sx=vw.x+vw.width*(i+.5)/20,sy=vw.y+vw.height*(j+.5)/20;const f=w.flat(sx,sy);n++;if(f.x<0||f.y<0||f.x>wb.width||f.y>wb.height)out++;}
    const inView=([x,y])=>x>=cr.left&&x<=cr.right&&y>=cr.top&&y<=cr.bottom;
    const npcs=w.npcs.filter(n=>n.spr.visible).map(n=>({who:n.sprite||n.id,s:toS(n.spr.x,n.spr.y),solid:!G.free(Math.floor(n.spr.x/G.C),Math.floor(n.spr.y/G.C))}));
    const exits=w.exits.map(e=>({to:e.to,side:e.side,s:toS(e.rect.centerX,e.rect.centerY)}));
    const spots=Object.values(w.spots).map(s=>({node:s.node,s:toS(s.x,s.y),solid:!G.free(Math.floor(s.x/G.C),Math.floor(s.y/G.C))}));
    return {iso:!!iso,zoom:+cam.zoom.toFixed(2),void:Math.round(100*out/n),map:[wb.width,wb.height],player:toS(P.x,P.y),pin:inView(toS(P.x,P.y)),cv:[cr.width,cr.height].map(Math.round),
      npcs,exits,spots,bg:cam.backgroundColor&&cam.backgroundColor.rgba};});
  await p.screenshot({path:path.join(OUT,`${dev}-${place}.png`)});
  console.log(place,JSON.stringify(r));
}
await b.close();})();
