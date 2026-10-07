// Phone: Book 2's stealth beats (BOOK, default 12; test mode): every beat that has watchers who can catch you
// (lines or somewhere to send you). Coming into the place doesn't start the beat's scene by itself (a residence
// is walked, not entered like a room); step into a watcher's sight and he says his line and sends you where he
// sends you; wait for the cones to pass and walk on, and the beat's scene begins at its spot.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'')+'#/tk/'+BOOK);await p.waitForTimeout(1500);
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}};
const settled=async()=>{for(let i=0;i<40&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);}};
// the stealth beats: from the region's quests and the maps' watchers (found by visiting each place)
await ready();
const quests=await p.evaluate(()=>window.__w.region.quests.map(q=>({node:q.node,place:q.place,spot:q.spot})));
// where each beat's catchers stand (read from the maps): the beat's own place, or the compound you cross to reach it
const fs=require('fs'),path=require('path'),KIT=process.env.PLAYTEST_KIT||'jade',dir=path.join(__dirname,'..','..',`data/tk_maps/w${BOOK}/${KIT}`),at={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.tmj'))){const m=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  for(const o of m.layers.filter(l=>l.type==='objectgroup').flatMap(l=>l.objects)){const pr=Object.fromEntries((o.properties||[]).map(x=>[x.name,x.value]));if(!pr.watch)continue;
    const w=JSON.parse(pr.watch);if(!((w.seen||[]).length||w.back_to))continue;for(const k of w.in_beats||[])(at[k]=at[k]||new Set()).add(f.replace('.tmj',''));}}
const beats=quests.filter(q=>at[q.node]).flatMap(q=>[...at[q.node]].map(pl=>({...q,cross:pl})));
console.log('stealth beats:',beats.map(q=>`${q.node} in ${q.cross}`).join(', '));
const lead0={};   // who plays each beat: the party the story has by then (the playthrough's "after it" leads)
const setUp=async(node,place,from)=>{await p.evaluate(([node,B])=>{for(const k of Object.keys(localStorage))if(/^tk-(progress|cleared|world|rest|seen|party)/.test(k)||k==='gt-progress')localStorage.removeItem(k);localStorage.setItem('tk-guide','off');
    const w=TK.world(B),keys=w.nodes.map(n=>n.key),i=keys.indexOf(node);for(const [j,n] of w.nodes.entries())if(j<i&&!['side','short'].includes(n.role))TK.markCleared(n.key);TK.markSeen(B+':opening');},[node,BOOK]);
  await p.reload();await p.waitForTimeout(1200);await ready();await settled();
  // the lead the story gives this beat: the last party step before it
  await p.evaluate(node=>{const w=window.__w,ks=TK.world(w.w.n).nodes.map(n=>n.key),i=ks.indexOf(node);let party=null;
    for(const k of ks.slice(0,i)){const sc=w.story[(TK.world(w.w.n).nodes.find(n=>n.key===k)||{}).scene];for(const s of (sc&&sc.steps)||[])if(s[0]==='party')party=s[1];}
    if(party){w.st.party=party;w.setParty(party);}const top=w.region.places.find(x=>x.id===w.region.quests.find(q=>q.node===node).place);for(const id of [top&&top.parent,top&&top.id])if(id&&!w.st.visited.includes(id))w.st.visited.push(id);
    // what the beat's gate asks for (a3: the pearls and the crown from the errand), as the playthrough supplies it
    for(const g of (w.region.quests.find(q=>q.node===node)||{}).gate||[])for(const c of [].concat(g.needs||[])){const [k,v]=String(c).split(':');if(k==='item')WorldItems.add(w.w,v);if(k==='mark')WorldMarks.add(w.w,v);}
    w.save();},node);
  if(from){await p.evaluate(f=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(f);},from);await p.waitForTimeout(1300);await ready();await settled();}
  await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},place);await p.waitForTimeout(1300);await ready();};
const watchersHere=node=>p.evaluate(node=>{const w=window.__w;return w.npcs.filter(n=>n.watch&&((n.watch.seen||[]).length||n.watch.back_to)&&(n.watch.in_beats||[]).includes(node)).map(n=>({id:n.id,back:n.watch.back_to||''}));},node);
let found=0;
for(const q of beats){
  // a quick look: does this beat's place have catchers for it?
  await setUp(q.node,q.cross,null);
  const ws=await watchersHere(q.node);if(!ws.length)continue;found++;
  const entryFrom=await p.evaluate(()=>window.__w.from||null);
  console.log(`\n${q.node} @ ${q.cross} (its scene in ${q.place}): watchers ${ws.map(x=>x.id+(x.back?'->'+x.back:'')).join(', ')} (lead ${await p.evaluate(()=>window.__w.lead)})`);
  // coming in: the scene doesn't start of itself
  await p.waitForTimeout(1500);
  check(!(await p.evaluate(n=>!!window.__w.cine||TK.cleared(n),q.node)),`${q.node}: coming into ${q.cross} doesn't start the scene; the watchers are about (${await p.evaluate(()=>window.__w.npcs.filter(n=>n.watch&&n.spr.visible).length)} on their beats)`);
  // caught: right in front of the first watcher, the way he faces
  const w0=ws[0];
  await p.evaluate(id=>{const w=window.__w,n=w.npcs.find(n=>n.id===id),[fx,fy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[n.watch.dir]||[0,1],T=w.tw||16;w.walk=null;w.player.body.reset(n.spr.x+fx*T*1.5,n.spr.y+fy*T*1.5);},w0.id);
  let line='';for(let i=0;i<30;i++){await p.waitForTimeout(120);const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.querySelector('.town-en').textContent:'';});if(l){line=l;break;}}
  await settled();await p.waitForTimeout(1600);await ready();await settled();
  const after=await p.evaluate(()=>({place:window.__w.placeId,caught:!!window.__w.caught}));
  check(!!line,`${q.node}: in front of ${w0.id} she is seen ("${line.slice(0,60)}")`);
  // sent where he sends her: that room, its door here, or out to a spot in another place (the palace's north gate)
  if(w0.back)check(!after.caught,`${q.node}: and sent back to ${w0.back} (now ${after.place}${after.place===q.cross?', at its door':''})`);
  // patient: back in, then on to the spot, a step at a time, waiting while a catcher would see the next one
  await setUp(q.node,q.cross,null);await p.waitForTimeout(800);
  // plan, then walk it: the patrols simulated ahead (their beats, pauses and turns, as the game moves them), and
  // a search over (place, time) for a way at his running pace that no catcher ever sees; the wait is how much
  // longer that takes than running straight there
  const planAt=walk=>p.evaluate(([spot,room,node,walk])=>{const w=window.__w,T=w.tw||16,C=16,DT=50,STEP=3,F=1200;
    const e=w.exits.find(e=>e.to===room),s=w.spots[spot];const goal=s?{x:s.x,y:s.y+10}:e&&{x:e.rect.centerX,y:e.rect.centerY+3};if(!goal)return {err:'no spot or door'};
    const G=w.walkGrid(),cols=Math.ceil(G.cols*G.C/C),rows=Math.ceil(G.rows*G.C/C),free=(cx,cy)=>G.free(Math.floor((cx*C+8)/G.C),Math.floor((cy*C+10)/G.C));
    const cat=w.npcs.filter(n=>n.watch&&((n.watch.seen||[]).length||n.watch.back_to)&&w.watching(n));
    // the patrols, frame by frame
    const tracks=cat.map(n=>{const W=n.watch,st={x:n.spr.x,y:n.spr.y,leg:W.leg,wait:W.wait,dir:W.dir,t:W.t,turn:W.turn},out=[];
      for(let f=0;f<F;f++){out.push({x:st.x,y:st.y,dir:st.dir});
        if(W.pts.length>1){if(st.wait>0)st.wait-=DT;else{const tg=W.pts[st.leg],dx=tg.x-st.x,dy=tg.y-st.y,d=Math.hypot(dx,dy),v=30*DT/1000;
          if(d<=v){st.x=tg.x;st.y=tg.y;const c=(W.beat||[])[st.leg],pz=W.pause;if(pz&&c&&c[0]===pz[0]&&c[1]===pz[1])st.wait=(pz[2]||2)*1000;st.leg=(st.leg+1)%W.pts.length;}
          else{st.x+=dx/d*v;st.y+=dy/d*v;st.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');}}}
        else if(W.turns.length){st.t+=DT;if(st.t>2600){st.t=0;st.turn=(st.turn+1)%W.turns.length;st.dir=W.turns[st.turn];}}}
      return {n,out};});
    const at=(cx,cy)=>({x:cx*C+8,y:cy*C+12});
    const seenAt=new Uint8Array(cols*rows*F);
    for(const {n,out} of tracks){const R=(n.watch.cone||4)*T+C;for(let f=0;f<F;f++){const o=out[f],stub={watch:{cone:n.watch.cone,dir:o.dir},spr:{x:o.x,y:o.y}};
      for(let cy=Math.max(0,Math.floor((o.y-R)/C));cy<=Math.min(rows-1,Math.floor((o.y+R)/C));cy++)for(let cx=Math.max(0,Math.floor((o.x-R)/C));cx<=Math.min(cols-1,Math.floor((o.x+R)/C));cx++)
        if(w.sees(stub,at(cx,cy)))seenAt[(f*rows+cy)*cols+cx]=1;}}
    const safe=(cx,cy,f)=>{for(let k=Math.max(0,f-2);k<=Math.min(F-1,f+STEP+2);k++)if(seenAt[(k*rows+cy)*cols+cx])return false;return true;};
    const P=w.player,sx=Math.floor(P.x/C),sy=Math.floor((P.y-4)/C),gx=Math.floor(goal.x/C),gy=Math.floor((goal.y-4)/C);
    // straight there, no one about: the shortest way in steps
    const par=new Int32Array(cols*rows).fill(-1);const bfs=()=>{const d=new Int32Array(cols*rows).fill(-1),q=[sx+sy*cols];d[q[0]]=0;for(let i=0;i<q.length;i++){const c=q[i],x=c%cols,y=(c-x)/cols;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=cols||Y>=rows||d[X+Y*cols]>=0)continue;if(!free(X,Y)&&!(X===gx&&Y===gy))continue;d[X+Y*cols]=d[c]+1;par[X+Y*cols]=c;q.push(X+Y*cols);}}return d[gx+gy*cols];};
    const direct=bfs();
    /* running the shortest way, not looking: is she seen? */let careless=false;{const ws=[];for(let c=gx+gy*cols;c>=0&&c!==sx+sy*cols;c=par[c])ws.unshift(c);ws.forEach((c,k)=>{const x=c%cols;if(!safe(x,(c-x)/cols,(k+1)*STEP))careless=true;});}if(direct<0)return {err:'no way to the goal at all'};
    // (cell, step) search: move or wait each step, never where a catcher sees
    let cur=new Map([[sx+sy*cols,null]]);const hist=[cur];let found=-1;
    for(let k=0;(k+1)*STEP<F;k++){const nx=new Map();for(const c of cur.keys()){const x=c%cols,y=(c-x)/cols;for(const [a,b] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,id=X+Y*cols;
        if(X<0||Y<0||X>=cols||Y>=rows||nx.has(id))continue;if(!free(X,Y)&&!(X===gx&&Y===gy))continue;if(!safe(X,Y,(k+1)*STEP))continue;nx.set(id,c);}}
      hist.push(nx);cur=nx;if(nx.has(gx+gy*cols)){found=k+1;break;}if(!nx.size)break;}
    if(found<0)return {err:'no unseen way within '+(F*DT/1000)+' s',direct,careless};
    const path=[];let c=gx+gy*cols;for(let k=found;k>=0;k--){path.unshift(c);c=hist[k].get(c);}
    const cells=path.map(c=>{const x=c%cols;return at(x,(c-x)/cols);});cells[cells.length-1]=goal;
    // walk it in step with the game's own clock
    if(!walk)return {steps:found,direct,careless,secs:found*STEP*DT/1000,wait:((found-direct)*STEP*DT/1000)};
    window.__plan={cells,i:0,acc:0,done:false};const h=(t,delta)=>{const pl=window.__plan;if(pl.done||w.caught||w.cine||w.leaving){w.events.off('update',h);return;}if(w.ui.busy())return;pl.acc+=delta;const k=Math.min(pl.cells.length-1,Math.floor(pl.acc/(STEP*DT)));const q=pl.cells[k];if(pl.k!==k){pl.k=k;w.walkTo(q.x,q.y,{ring:false});}   /* walked: the game's own tap-walk, a cell at a time, not set there */if(k>=pl.cells.length-1){pl.done=true;}};
    w.events.on('update',h);
    return {steps:found,direct,secs:found*STEP*DT/1000,wait:((found-direct)*STEP*DT/1000)};},[q.spot,q.place,q.node,walk]);
  // the wait depends on when she sets off: a few moments, a second and a half apart
  const sample=[];let caughtRuns=0;for(let k=0;k<6;k++){const r=await planAt(false);sample.push(r.err?null:r.wait);if(r.careless)caughtRuns++;await p.waitForTimeout(1500);}
  const ok=sample.filter(x=>x!=null);console.log(`  waits from 6 starting moments: ${sample.map(x=>x==null?'none':x.toFixed(1)+' s').join(', ')}; running the shortest way without looking, seen ${caughtRuns} of 6`);
  const plan=await planAt(true);
  if(!check(!plan.err,`${q.node}: an unseen way to ${q.spot&&!(await p.evaluate(s=>!!window.__w.spots[s],q.spot))?'the door of '+q.place:'the spot'} (${plan.err||`${plan.secs.toFixed(1)} s, of which ${plan.wait.toFixed(1)} s waiting for the cones; running straight would take ${(plan.direct*0.15).toFixed(1)} s`})`))continue;
  let res='timeout',t0=Date.now();
  while(Date.now()-t0<plan.secs*1000*4+20000){
    const st=await p.evaluate(([n,cross])=>({cine:!!window.__w.cine||!!document.querySelector('.tk-duel')||TK.cleared(n)||window.__w.placeId!==cross&&!window.__w.caught,caught:!!window.__w.caught}),[q.node,q.cross]);
    // a spot that starts on a tap (a3: knocking at Lu Bu's door), reached: tap it, as a player would
    if(await p.evaluate(spot=>{const w=window.__w,pl=window.__plan,s=w.spots[spot];return !!(pl&&pl.done&&s&&s.trigger==='talk'&&!w.ui.busy()&&!w.cine&&!w.walk);},q.spot))
      await p.evaluate(spot=>{const w=window.__w,s=w.spots[spot];w.tapAt(s.x,s.y);},q.spot);
    if(st.cine){res='scene';break;}if(st.caught){res='caught';if(process.env.DEBUG)console.log('  caught:',await p.evaluate(()=>{const w=window.__w,P=w.player,pl=window.__plan;return JSON.stringify({P:[P.x|0,P.y|0],step:pl&&Math.floor(pl.acc/150)+'/'+pl.cells.length,done:pl&&pl.done,goal:pl&&pl.cells[pl.cells.length-1],w:w.npcs.filter(n=>n.watch&&w.watching(n)).map(n=>[n.id,n.spr.x|0,n.spr.y|0,n.watch.dir,w.sees(n,P)]),spot:Object.values(w.spots).filter(s=>s.node==='12-a3').map(s=>[s.x,s.y,s.armed,s.trigger,!!w.openQuest(s)]),items:['pearls','crown'].map(i=>i+':'+w.cond('item:'+i)),next:w.nextMain().node,avail:w.available(w.nextMain()),gate:JSON.stringify(w.gateFor(w.nextMain())).slice(0,120),near:Math.hypot(P.x-856,P.y-603)|0});}));break;}if(await p.evaluate(()=>window.__w.ui.busy()&&!window.__w.cine))await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(100);}
  const waits=plan.wait.toFixed(1)+' s';
  check(res==='scene',`${q.node}: walking that way she isn't seen, and the scene begins (${res}, ${((Date.now()-t0)/1000).toFixed(0)} s)`);
}
check(found>0,`stealth beats found: ${found}`);
console.log(`stealth-12: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
