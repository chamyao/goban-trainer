// Phone, test mode, Book 12 (the Book 2 draft): its road challengers. For each, by story state: before its "when"
// he isn't there and no "!" floats where he would stand; between "when" and "until" he stands with his "!", talking
// to him gives his intro and opens his board, and winning takes the "!" away; after "until" he's gone, "!" and all.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const BOOK=+(process.env.BOOK||12);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?'+(BOOK>9?'test=1':'');
await p.goto(BASE+'#/tk/'+BOOK);await p.waitForTimeout(1500);await p.evaluate(()=>localStorage.setItem('tk-guide','off'));
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(150);}await p.waitForTimeout(500);
  for(let i=0;i<40&&await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);i++){await p.evaluate(()=>{const w=window.__w;if(w.ui.busy())w.ui.advance();});await p.waitForTimeout(120);}};
await ready();
// the challengers, by place (from the maps as loaded): go to each place once to read them
const places=await p.evaluate(()=>[...new Set(window.__w.region.places.filter(x=>!x.parent&&x.id!=='overworld').map(x=>x.id))]);
const list=[];
for(const pl of places){await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},pl);await p.waitForTimeout(1000);await ready();
  list.push(...await p.evaluate(pl=>window.__w.npcs.filter(n=>n.challenge).map(n=>({place:pl,ch:n.challenge,when:n.when||'',until:n.until||'',x:Math.round(n.spr.x),y:Math.round(n.spr.y)})),pl));}
console.log(`challengers: ${list.map(c=>`${c.ch}@${c.place} (${c.when||'always'} .. ${c.until||'never'})`).join(', ')}`);
// set the story: every main beat before the given one cleared (and its challenge not yet beaten)
const setUpTo=(stop,inclusive)=>p.evaluate(([stop,inc])=>{const w=TK.world(window.__w.w.n);const keys=w.nodes.map(n=>n.key);const all=JSON.parse(localStorage.getItem('tk-progress')||'null');
  for(const n of w.nodes){if(TK.cleared(n.key))TK.unclear?TK.unclear(n.key):0;}
  const i=stop?keys.indexOf(stop):-1;for(const [j,n] of w.nodes.entries()){if(['side','short'].includes(n.role))continue;if(i<0||j<i||(inc&&j===i))TK.markCleared(n.key);}},[stop,inclusive]);
const stateOf=c=>p.evaluate(c=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===c.ch);if(!n)return null;return {shown:n.spr.visible,mark:!!(n.mark&&n.mark.visible),beaten:TK.cleared(n.challenge)};},c);
let lostOnce=false;
const canUnclear=await p.evaluate(()=>typeof TK.unclear==='function'||typeof TK.markUncleared==='function');
for(const c of list){
  const whenNode=c.when.startsWith('node:')?(/^\d+-/.test(c.when.slice(5))?c.when.slice(5):BOOK+'-'+c.when.slice(5)):null;
  // fresh story each time: a new page state (clear progress), then the beats up to the state wanted
  const at=async(stop,inc)=>{await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^tk-(progress|cleared|world|rest|seen)/.test(k)||k==='gt-progress')localStorage.removeItem(k);localStorage.setItem('tk-guide','off');});
    await setUpTo(stop,inc);await p.evaluate(B=>TK.markSeen(B+':opening'),BOOK);await p.reload();await p.waitForTimeout(1200);await ready();
    await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.cine=null;w.go(pl);},c.place);await p.waitForTimeout(1200);await ready();return stateOf(c);};
  if(whenNode){const s=await at(whenNode,false);check(s&&!s.shown&&!s.mark,`${c.ch} (${c.place}) before ${whenNode}: not there, no "!" (${JSON.stringify(s)})`);}
  // no "when": there from the book's start (not after every beat, which is past his "until")
  const s2=whenNode?await at(whenNode,true):await at(await p.evaluate(()=>TK.world(window.__w.w.n).nodes[0].key),false);
  if(!check(s2&&s2.shown&&s2.mark,`${c.ch} (${c.place}) after ${whenNode||'the start'}: there, with his "!" (${JSON.stringify(s2)})`))continue;
  // he spots you: out of his sight nothing happens; step into it and he calls out ("!"), comes over, intro, his board
  const sight=await p.evaluate(c=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===c.ch),T=w.tw||16;return {view:n.view||0,cone:n.cone,face:n.face0,guard:n.guard,T,x:n.spr.x,y:n.spr.y};},c);
  const place=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w;w.walk=null;w.player.body.reset(x,y);},[x,y]);
  const engaged=()=>p.evaluate(ch=>!!(window.__w.engaged&&window.__w.engaged.challenge===ch)||!!document.querySelector('.tk-duel svg'),c.ch);   // this one (walked back, you may be in another's sight)
  const [fx,fy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[sight.face]||[0,1];
  const free=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,G=w.walkGrid();return G.free(Math.floor(x/G.C),Math.floor(y/G.C));},[x,y]);
  const spotAt=async k=>{for(const t of [0,.3,-.3,.6,-.6]){const x=sight.x+fx*k*sight.T-fy*t*sight.T*2,y=sight.y+fy*k*sight.T+fx*t*sight.T*2;if(await free(x,y))return [x,y];}return null;};
  let boardBy='talk';
  if(sight.view){
    const far=await spotAt(sight.view+3),near=await spotAt(Math.max(1.5,sight.view-1));
    if(far){await place(...far);await p.waitForTimeout(1200);check(!(await engaged()),`${c.ch}: ${sight.view+3} tiles off (sight ${sight.view}${sight.cone?', cone '+sight.face:''}), he doesn't see you`);}
    if(near){await place(...near);for(let i=0;i<20&&!(await engaged());i++)await p.waitForTimeout(100);
      if(check(await engaged(),`${c.ch}: ${Math.max(1.5,sight.view-1)} tiles in front of him, he sees you and comes over`))boardBy='sight';}
  }
  if(boardBy==='talk'){await p.evaluate(c=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===c.ch);w.walk=null;w.player.body.reset(n.spr.x,n.spr.y+14);w.player.facing='up';},c);await p.waitForTimeout(300);await p.evaluate(()=>window.__w.act());}
  let board=false;const intro=[];
  for(let i=0;i<80;i++){await p.waitForTimeout(150);const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.textContent.replace(/\s+/g,' ').trim():'';});if(l&&intro[intro.length-1]!==l)intro.push(l);
    if(await p.locator('.tk-duel svg').count()){board=true;break;}if(await p.evaluate(()=>window.__w.ui.busy()))await p.evaluate(()=>window.__w.ui.advance());}
  check(board,`${c.ch}: ${boardBy==='sight'?'spotted':'talked to'}, his intro ("${(intro[intro.length-1]||'').slice(0,60)}") then his board`);
  if(board&&boardBy==='sight'&&!lostOnce){lostOnce=true;
    // a loss: you're walked back, he goes home and doesn't come again while you stay
    const before=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y]);
    await p.evaluate(()=>{dispatchEvent(new CustomEvent('tczw:result',{detail:'fail'}));});await p.waitForTimeout(2600);
    const lv=p.locator('.tk-duel-keys button',{hasText:/Leave|离开/});if(await lv.count())await lv.first().tap().catch(()=>{});await p.waitForTimeout(1500);
    for(let i=0;i<20&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}
    for(let i=0;i<30&&await p.evaluate(c=>{const n=window.__w.npcs.find(n=>n.challenge===c.ch);return Math.hypot(n.spr.x-n.home.x,n.spr.y-n.home.y)>2;},c);i++)await p.waitForTimeout(200);   // his walk home (a long sight is a long walk)
    const af=await p.evaluate(c=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===c.ch);return {P:[w.player.x,w.player.y],home:Math.round(Math.hypot(n.spr.x-n.home.x,n.spr.y-n.home.y)),you:+(Math.hypot(w.player.x-n.home.x,w.player.y-n.home.y)/(w.tw||16)).toFixed(1),view:n.view,cool:!!n.cool,engaged:!!w.engaged,beaten:TK.cleared(n.challenge)};},c);
    check(!af.beaten&&af.home<=2&&(af.cool||af.you>af.view+2),`${c.ch}: lost, he goes back to his post (${af.home} px from it) and waits (cool ${af.cool}; you ${af.you} tiles from his post, his sight ${af.view})`);
    await p.waitForTimeout(1500);check(!(await engaged()),`${c.ch}: standing there, he doesn't come again`);
    // leave and come back: he can see you again
    await p.evaluate(pl=>{const w=window.__w;w.leaving=false;w.go(pl);},c.place);await p.waitForTimeout(1200);await ready();
    const near2=await spotAt(Math.max(1.5,sight.view-1));if(near2){await place(...near2);let again=false;for(let i=0;i<25&&!again;i++){await p.waitForTimeout(100);again=await engaged();}check(again,`${c.ch}: after leaving and coming back he sees you again`);
      for(let i=0;i<60&&!(await p.locator('.tk-duel svg').count());i++){await p.waitForTimeout(150);if(await p.evaluate(()=>window.__w.ui.busy()))await p.evaluate(()=>window.__w.ui.advance());}board=await p.locator('.tk-duel svg').count()>0;}
  }
  if(board){const pre=await p.evaluate(c=>{const n=window.__w.npcs.find(n=>n.challenge===c.ch);return [n.spr.x,n.spr.y];},c);
    await p.evaluate(()=>{window.__trainer&&(window.__trainer.flawed=null);dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(400);if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap().catch(()=>{});await p.waitForTimeout(1000);
    for(let i=0;i<20&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}
    const s3=await stateOf(c);const aside=await p.evaluate(c=>{const n=window.__w.npcs.find(n=>n.challenge===c.ch);return {solid:!!(n.spr.body&&n.spr.body.enable),pos:[n.spr.x,n.spr.y]};},c);
    check(s3&&s3.beaten&&!s3.mark,`${c.ch}: beaten, his "!" is gone (${JSON.stringify(s3)})`);
    if(boardBy==='sight')check(!aside.solid,`${c.ch}: he stands aside and is no longer in the way (solid ${aside.solid})`);}
  if(c.until){const s4=await at(c.until,true);check(!s4||(!s4.shown&&!s4.mark),`${c.ch} after ${c.until}: gone, no "!" (${JSON.stringify(s4)})`);}
}
console.log(`challengers-12: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
