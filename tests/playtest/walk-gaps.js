// Phone, taps: the walk grid matches what his feet can do. Every narrow gap between two solids (a one-tile
// gap in a wall, between two trees on the road) that his body fits through is open in the grid, and a tap
// across it walks him through it. Before, a cell any solid touched was shut, which closed every such gap:
// a tap an inch away sent him round the whole compound ("walls in thin air"). BOOK, default 12.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;if(!ok||process.env.VERBOSE)console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}
  for(let i=0;i<30&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}};
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(BOOK>9?'?test=1':'');
await p.goto(BASE+'#/tk/'+BOOK);await p.waitForTimeout(1500);
if(BOOK>1)await p.evaluate(B=>{for(let n=1;n<Math.min(B,4);n++)if(TK.world(n))TK.world(n).nodes.forEach(x=>{TK.markCleared(x.key);TK.markSeen(n+':'+x.scene);});localStorage.setItem('tk-book',String(B));},BOOK);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));await p.reload();await p.waitForTimeout(1200);await ready();
const places=await p.evaluate(()=>window.__w.region.places.filter(x=>x.archetype!=='overworld').map(x=>x.id));let gapsAll=0,walkedAll=0;
for(const pl of places){
  await p.evaluate(pl=>{const w=window.__w;if(!w.st.visited.includes(pl))w.st.visited.push(pl);w.leaving=false;w.cine=null;w.go(pl);},pl);await p.waitForTimeout(1100);await ready();
  if(await p.evaluate(pl=>window.__w.placeId!==pl,pl))continue;
  const gaps=await p.evaluate(()=>{const w=window.__w;w.grid=null;const G=w.walkGrid(),C=G.C;
    const sol=w.solids.getChildren().filter(z=>z.body&&z.body.enable&&!(z.visibleWith&&!z.visibleWith.visible)).map(z=>z.body);
    const hit=(x,y)=>sol.some(b=>x+5>b.x&&x-5<b.right&&y>b.y&&y-6<b.bottom),out=[];
    for(const a of sol)for(const c of sol){if(a===c)continue;
      // side by side (passed going up or down), or one above the other (passed going across)
      const gx=c.x-a.right,ov=Math.min(a.bottom,c.bottom)-Math.max(a.y,c.y);
      if(gx>=11&&gx<=24&&ov>=4){const x=(a.right+c.x)/2,y=Math.max(a.y,c.y)+Math.min(ov,14)/2+3;if(!hit(x,y))out.push({x,y,w:gx,across:'up and down'});}
      const gy=c.y-a.bottom,ovx=Math.min(a.right,c.right)-Math.max(a.x,c.x);
      if(gy>=8&&gy<=24&&ovx>=4){const x=Math.max(a.x,c.x)+Math.min(ovx,14)/2,y=(a.bottom+c.y)/2+3;if(!hit(x,y))out.push({x,y,w:gy,across:'side to side'});}}
    return out.map(g=>({...g,open:[[0,0],[-4,0],[4,0],[0,-4],[0,4]].some(([dx,dy])=>G.free(Math.floor((g.x+dx)/C),Math.floor((g.y-3+dy)/C)))}));});
  for(const g of gaps){gapsAll++;check(g.open,`${pl}: the ${g.w|0}px gap at ${g.x|0},${g.y|0} (his feet fit) is open in the walk grid`);}
  // through it by a tap: both sides on open floor, inside the place (not past a room's outer wall)
  for(const g of gaps.filter(g=>g.open)){
    const r=await p.evaluate(g=>new Promise(done=>{const w=window.__w,G=w.walkGrid(),C=G.C,d=22,[a,b]=g.across==='up and down'?[[g.x,g.y-d],[g.x,g.y+d]]:[[g.x-d,g.y],[g.x+d,g.y]];
        const ok=q=>G.free(Math.floor(q[0]/C),Math.floor((q[1]-3)/C))&&!w.exits.some(e=>Phaser.Geom.Rectangle.Contains(e.rect,q[0],q[1]-3));if(!ok(a)||!ok(b)||!w.canMove()){done('skip');return;}   /* (a scene playing on arrival: he isn't free to walk) */
        const seg=new Phaser.Geom.Line(a[0],a[1]-3,b[0],b[1]-3);if(w.exits.some(e=>Phaser.Geom.Intersects.LineToRectangle(seg,e.rect))){done('skip');return;}   // a doorway: across it is out of the place
        if(w.npcs.some(n=>n.spr.visible&&Phaser.Geom.Line.GetNearestPoint&&Phaser.Math.Distance.Between(n.spr.x,n.spr.y,...(()=>{const q=Phaser.Geom.Line.GetNearestPoint(seg,{x:n.spr.x,y:n.spr.y});return [q.x,q.y];})())<14)){done('skip');return;}   // someone standing in it
        w.walk=null;w.player.body.reset(a[0],a[1]);if(!w.walkTo(b[0],b[1],{ring:false})){done('no path');return;}
        const len=w.walk.path.reduce((s,q,i,arr)=>s+Math.hypot(q.x-(i?arr[i-1].x:a[0]),q.y-(i?arr[i-1].y:a[1])),0);if(len>4*d){w.walk=null;done('skip');return;}   // the far side is another part of the map
        const here=w.placeId;setTimeout(()=>{const P=w.player;if(w.placeId!==here||w.leaving||!w.canMove()){done('skip');return;}done(Math.hypot(P.x-b[0],P.y-b[1])<12?'ok':`stopped at ${P.x|0},${P.y|0}`);},2200);}),g);
    if(r==='skip')continue;walkedAll++;check(r==='ok',`${pl}: a tap across the gap at ${g.x|0},${g.y|0} walks him through (${r})`);}
}
console.log(`walk-gaps: ${checked-fails}/${checked} (${gapsAll} narrow gaps, ${walkedAll} walked through by a tap)`);await b.close();process.exit(fails?1:0);})();
