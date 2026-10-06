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
    if(party){w.st.party=party;w.setParty(party);}const top=w.region.places.find(x=>x.id===w.region.quests.find(q=>q.node===node).place);for(const id of [top&&top.parent,top&&top.id])if(id&&!w.st.visited.includes(id))w.st.visited.push(id);w.save();},node);
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
  const pts=await p.evaluate(([spot,room])=>{const w=window.__w,e=w.exits.find(e=>e.to===room),s=w.spots[spot]||(e&&{x:e.rect.centerX,y:e.rect.centerY-7});   /* into the doorway itself (the walk ends 10 px below its target) */if(!s)return null;const path=w.findPath(w.player.x,w.player.y,s.x,s.y+10)||[];let last=[w.player.x,w.player.y];const out=[];
    for(const q of path){const [x,y]=Array.isArray(q)?q:[q.x,q.y];const d=Math.hypot(x-last[0],y-last[1]),n=Math.max(1,Math.ceil(d/8));for(let k=1;k<=n;k++)out.push([last[0]+(x-last[0])*k/n,last[1]+(y-last[1])*k/n]);last=[x,y];}
    /* the path stops on open floor: the last steps into the doorway */if(!w.spots[spot]){const [x,y]=[s.x,s.y+10],d=Math.hypot(x-last[0],y-last[1]),n=Math.max(1,Math.ceil(d/8));for(let k=1;k<=n;k++)out.push([last[0]+(x-last[0])*k/n,last[1]+(y-last[1])*k/n]);}return out;},[q.spot,q.place]);
  if(!check(pts&&pts.length,`${q.node}: a way from where she comes in to the spot`))continue;
  let i=0,waits=0,res='timeout',t0=Date.now();
  while(Date.now()-t0<120000){
    const st=await p.evaluate(([n,cross])=>({cine:!!window.__w.cine||!!document.querySelector('.tk-duel')||TK.cleared(n)||window.__w.placeId!==cross&&!window.__w.caught,caught:!!window.__w.caught,busy:window.__w.ui.busy()}),[q.node,q.cross]);
    if(st.cine){res='scene';break;}if(st.caught){res='caught';if(process.env.DEBUG)console.log('  at the catch:',await p.evaluate(()=>{const w=window.__w;return JSON.stringify({P:[w.player.x|0,w.player.y|0],w:w.npcs.filter(n=>n.watch).map(n=>[n.id,n.spr.x|0,n.spr.y|0,n.watch.dir,n.watch.leg,w.sees(n,w.player),w.watching(n),n.spr.visible])});}));break;}if(st.busy){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);continue;}
    if(i>=pts.length){await p.waitForTimeout(300);if(++i>pts.length+15){res='no scene at the spot';break;}continue;}
    const mv=await p.evaluate(([nx,ny,bx,by])=>{const w=window.__w,T=w.tw||16;
      const danger=P=>w.npcs.some(n=>{if(!(n.watch&&((n.watch.seen||[]).length||n.watch.back_to)&&w.watching(n)))return false;if(w.sees(n,P))return true;
        /* about to turn (the end of his beat, or a pause): any way he may face next */const W=n.watch,tg=W.pts&&W.pts.length>1&&W.pts[W.leg];if(W.wait>0||tg&&Math.hypot(tg.x-n.spr.x,tg.y-n.spr.y)<4*T){const d0=W.dir;const any=['up','down','left','right'].some(d=>{W.dir=d;return w.sees(n,P);});W.dir=d0;if(any)return true;}
        const [fx,fy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[n.watch.dir]||[0,0],x0=n.spr.x,y0=n.spr.y;n.spr.x+=fx*T*1.5;n.spr.y+=fy*T*1.5;const r=w.sees(n,P);n.spr.x=x0;n.spr.y=y0;return r;});
      const P=w.player;if(!danger({x:nx,y:ny})){w.walk=null;P.body.reset(nx,ny);return 1;}if(bx!=null&&danger({x:P.x,y:P.y})&&!danger({x:bx,y:by})){w.walk=null;P.body.reset(bx,by);return -1;}return 0;},[...pts[i],...(i>0?pts[i-1]:[null,null])]);
    if(mv)i+=mv;else waits++;await p.waitForTimeout(mv?110:200);}
  check(res==='scene',`${q.node}: waiting out the cones (${waits} waits, ${((Date.now()-t0)/1000).toFixed(0)} s), she reaches the spot and the scene begins (${res})`);
}
check(found>0,`stealth beats found: ${found}`);
console.log(`stealth-12: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
