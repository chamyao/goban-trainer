// The lit route keeps to the drawn roads (Book 2's maps: "paths" by tile, "ways" the streets' centre lines).
// On each outdoor Book 2 map, many pairs of open ground: the route reaches the goal, never crosses anything
// solid, runs on road more than the walking path does where that's practical, and is never an absurd detour
// (over 2x the walking path, or 3x the straight line). Walking itself (findPath without prefer) is unchanged:
// tap-walk's call has no prefer. Prints the share on road, route vs walk, per map.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12),N=+(process.env.PAIRS||80);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}};
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1#/tk/'+BOOK);await p.waitForTimeout(800);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));await p.reload();await p.waitForTimeout(1200);await ready();
check(await p.evaluate(()=>!/prefer|, *true\)/.test(String(window.__w.walkTo))),'tap-walk calls findPath without prefer (walking is unchanged)');
const places=await p.evaluate(()=>window.__w.region.places.filter(x=>!x.parent&&x.archetype!=='overworld').map(x=>x.id));
for(const pl of places){
  await p.evaluate(pl=>{const w=window.__w;if(!w.st.visited.includes(pl))w.st.visited.push(pl);w.leaving=false;w.cine=null;w.go(pl);},pl);await p.waitForTimeout(1100);await ready();
  if(await p.evaluate(pl=>window.__w.placeId!==pl,pl))continue;
  const r=await p.evaluate(N=>{const w=window.__w,G=w.walkGrid(),C=G.C,T=w.tw||16;if(!w.pathRows||!w.pathRows.length)return {none:true};
    const road=(x,y)=>{const r=w.pathRows[Math.floor(y/T)];return !!r&&r[Math.floor(x/T)]==='1';};
    const len=pts=>{let s=0;for(let i=1;i<pts.length;i++)s+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);return s;};
    const share=pts=>{let on=0,all=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/4));for(let k=0;k<n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n;all++;if(road(x,y))on++;}}return all?on/all:0;};
    const solid=pts=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/3));for(let k=1;k<n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n;
      // shut in the tight grid there and at its neighbours all round: inside something, not grazing it
      let shut=true;for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]])if(G.free(Math.floor(x/C)+dx,Math.floor(y/C)+dy))shut=false;if(shut)return {x:x|0,y:y|0};}}return null;};
    let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    const free=()=>{for(let i=0;i<400;i++){const x=rnd()*G.cols*C,y=rnd()*G.rows*C;if(G.free(Math.floor(x/C),Math.floor(y/C))&&G.roomy(Math.floor(x/C),Math.floor(y/C)))return {x,y};}return null;};
    const out={pairs:0,stuck:[],through:[],detour:[],roadR:0,roadW:0,lenR:0,lenW:0,ms:0,worst:[]};
    for(let i=0;i<N;i++){const a=free(),b2=free();if(!a||!b2||Math.hypot(a.x-b2.x,a.y-b2.y)<48)continue;
      const wp=w.findPath(a.x,a.y,b2.x,b2.y);if(!wp)continue;   // no walking way either (an island, a walled yard): not the route's doing
      const W=[a,...wp];const t0=performance.now();const R=w.routePoints(a,b2);out.ms=Math.max(out.ms,performance.now()-t0);out.pairs++;
      if(!R||!R.length||Math.hypot(R[R.length-1].x-b2.x,R[R.length-1].y-b2.y)>16){out.stuck.push([a.x|0,a.y|0,b2.x|0,b2.y|0]);continue;}
      const hit=solid(R);if(hit)out.through.push({from:[a.x|0,a.y|0],to:[b2.x|0,b2.y|0],at:hit});
      const lr=len(R),lw=len(W),st=Math.hypot(a.x-b2.x,a.y-b2.y);out.lenR+=lr;out.lenW+=lw;const sr=share(R),sw=share(W);out.roadR+=sr;out.roadW+=sw;
      if(lr>2*lw+32&&lr>3*st)out.detour.push({from:[a.x|0,a.y|0],to:[b2.x|0,b2.y|0],route:lr|0,walk:lw|0});
      out.worst.push(lr/lw);}
    out.worst.sort((x,y)=>y-x);out.worst=out.worst.slice(0,3).map(v=>+v.toFixed(2));return out;},N);
  if(r.none){console.log(`     ${pl}: no drawn roads`);continue;}
  console.log(`     ${pl}: ${r.pairs} routes; on road ${(100*r.roadR/r.pairs).toFixed(0)}% (walking ${(100*r.roadW/r.pairs).toFixed(0)}%); length ${(r.lenR/r.lenW).toFixed(2)}x the walk (worst ${r.worst.join(', ')}); slowest ${r.ms.toFixed(0)} ms`);
  check(!r.stuck.length,`${pl}: every route reaches its goal (${r.stuck.length} don't${r.stuck.length?': '+JSON.stringify(r.stuck.slice(0,2)):''})`);
  check(!r.through.length,`${pl}: no route runs through anything solid (${r.through.length}${r.through.length?': '+JSON.stringify(r.through.slice(0,2)):''})`);
  check(!r.detour.length,`${pl}: no absurd detour (${r.detour.length}${r.detour.length?': '+JSON.stringify(r.detour.slice(0,2)):''})`);
  check(r.roadR>=r.roadW-0.02*r.pairs,`${pl}: the route keeps to the roads at least as much as walking does`);
  check(r.ms<150,`${pl}: a route takes under 150 ms to find (slowest ${r.ms.toFixed(0)})`);
}
console.log(`route-roads: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
