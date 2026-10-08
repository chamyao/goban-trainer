// Phone, taps, test mode: finishing a book's last main beat hands on to the next book by itself; if side
// stories are still open there (Book 2's Diaochan chain opens with its last beat), it says how many, stays,
// and hands on once the last of them is done.
// Book 1's last beat (1-ax2) played with its problem skipped: the goal line says the book is complete,
// the page moves to #/tk/2 without a tap, Book 2's opening scroll comes up, and after it Book 2's world.
// Then #/tk with no number opens Book 2 (the book last played), and #/tk/1 still opens Book 1.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const F=+(process.env.FROM||1),T=+(process.env.TO||F+1);   // FROM=2: Book 2's last beat hands on to Book 3; TO when a book names its next (13 → 12)
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/'+F);await p.waitForTimeout(1500);
const LAST=await p.evaluate(F=>{const w=TK.world(F);localStorage.clear();localStorage.setItem('tk-test','1');localStorage.setItem('tk-guide','off');for(let n=1;n<F;n++){const W=TK.world(n);if(W)W.nodes.forEach(x=>{TK.markCleared(x.key);TK.markSeen(n+':'+x.scene);});}
  // the last main beat: the last main beat in the book with nothing after it; everything else done
  const main=w.nodes.filter(n=>!['side','short'].includes(n.role)).map(n=>n.key),last=[...main].reverse().find(k=>!w.edges.some(e=>e[0]===k&&main.includes(e[1])));
  const after=new Set([last]);for(let ch=true;ch;){ch=false;for(const [a,b] of w.edges)if(after.has(a)&&!after.has(b)){after.add(b);ch=true;}}   // what comes after it (its side stories) stays to play
  for(const n of w.nodes)if(!after.has(n.key)){TK.markCleared(n.key);TK.markSeen(`${F}:${n.scene}`);}
  TK.markSeen(F+':opening');localStorage.setItem('tk-book',String(F));return last;},F);
console.log(`last main beat of Book ${F}:`,LAST);
await p.reload();await p.waitForTimeout(1500);
const scroll=()=>p.evaluate(()=>{const h=document.querySelector('.tk-scroll h3');return h&&h.textContent;});
const ready=async()=>{for(let i=0;i<75&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++){const x=p.getByText('Cancel',{exact:true});if(await x.count()&&await x.first().isVisible())await x.first().tap();if(await scroll())await p.locator('.tk-scroll-go').first().tap().catch(()=>{});await p.waitForTimeout(200);}await p.waitForTimeout(800);};
await ready();
check(await p.evaluate(L=>{const q=window.__w.nextMain();return q&&q.node===L;},LAST),'the next beat is the last one');
await p.evaluate(L=>{const w=window.__w,q=w.region.quests.find(q=>q.node===L);w.leaving=false;w.go(q.place);},LAST);await p.waitForTimeout(1800);await ready();
if(!(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)))await p.evaluate(L=>{const w=window.__w,q=w.region.quests.find(q=>q.node===L),s=Object.values(w.spots).find(s=>s.node===L);if(q&&s)w.playQuest(q,s);},LAST);
// play a beat through by taps (Skip the problem); stop when the page hands on, or when the book is done
// and the world has stood idle 6 s without handing on (side stories still open: it waits)
const seen=[];
const playOut=async(maxMs)=>{const lines=[];let goal='',t0=0,handed=false;const start=Date.now();
  while(Date.now()-start<maxMs){await p.waitForTimeout(150);
    const h=await p.evaluate(()=>location.hash);if(h==='#/tk/'+T){handed=true;break;}
    const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.textContent.replace(/\s+/g,' ').trim():'';});if(l&&lines[lines.length-1]!==l)lines.push(l);
    const g=await p.evaluate(()=>{const e=document.querySelector('.town-goal');return e?e.textContent:'';});if(/complete/.test(g)&&!goal){goal=g;t0=Date.now();}
    const t=await scroll();if(t){if(seen[seen.length-1]!==t)seen.push(t);await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
    const sk=p.locator('.tk-duel-keys button',{hasText:'Skip'});if(await sk.count()){await sk.first().tap().catch(()=>{});await p.waitForTimeout(500);continue;}
    const box=await p.evaluate(()=>{const w=window.__w;if(!w||!(w.ui.busy()||w.cine))return null;const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});
    if(box){await p.waitForTimeout(250);await p.touchscreen.tap(...box);continue;}
    if(goal&&Date.now()-t0>6000&&!(await p.evaluate(()=>window.__w&&(window.__w.ui.busy()||!!window.__w.cine||window.__w.leaving))))break;}
  return {lines,goal,t0,handed};};
let r=await playOut(105000);
const untold=r.lines.find(l=>/still untold/.test(l));
console.log('scrolls on the way:',seen.join(' | ')||'none');
check(await p.evaluate(L=>TK.cleared(L),LAST),`${LAST} is cleared`);
check(!!r.goal,`the goal line says the book is complete: "${r.goal.trim().slice(0,90)}"`);
if(untold){
  // side stories still open: it says how many, stays, and goes on once the last of them is done
  const open=await p.evaluate(()=>{const w=window.__w;return w.region.quests.filter(x=>(x.role==='side'||x.role==='short')&&w.available(x)).map(x=>x.node);});
  const K=(untold.match(/(\d+) stories|one story/)||[])[0];
  check(!r.handed&&(await p.evaluate(()=>location.hash))==='#/tk/'+F,`side stories open (${open.join(', ')}): it stays in Book ${F} ("${untold.slice(0,150)}")`);
  check(K===(open.length===1?'one story':`${open.length} stories`),`the line's count (${K}) matches the open side stories (${open.length})`);
  check(new RegExp('Book '+T+' is open').test(r.goal),`the goal says Book ${T} is open: "${r.goal.trim().slice(0,90)}"`);
  // all but one of them done (the last of one thread left): playing it hands on
  const leaf=await p.evaluate(()=>{const w=window.__w,Q=w.region.quests,done=k=>w.done(k);
    const pend=Q.filter(q=>(q.role==='side'||q.role==='short')&&!done(q.node));const leaves=pend.filter(q=>!Q.some(x=>x.after.includes(q.node)&&!done(x.node)));
    const L=leaves[leaves.length-1];for(const q of pend)if(q!==L){TK.markCleared(q.node);TK.markSeen(w.w.n+':'+q.scene);}return L&&L.node;});
  await p.reload();await p.waitForTimeout(1500);await ready();
  check(await p.evaluate(L=>{const w=window.__w,q=w.region.quests.find(q=>q.node===L);return !!q&&w.available(q);},leaf),`the last side story left (${leaf}) can be played`);
  await p.evaluate(L=>{const w=window.__w,q=w.region.quests.find(q=>q.node===L);w.leaving=false;w.go(q.place);},leaf);await p.waitForTimeout(1800);await ready();
  if(!(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)))await p.evaluate(L=>{const w=window.__w,q=w.region.quests.find(q=>q.node===L),s=Object.values(w.spots).find(s=>s.node===L);if(q&&s)w.playQuest(q,s);},leaf);
  r=await playOut(105000);
  check(await p.evaluate(L=>TK.cleared(L),leaf),`${leaf} is cleared`);
}
check(r.handed,`the page moves on to #/tk/${T} by itself${r.t0?` (${((Date.now()-r.t0)/1000).toFixed(1)} s after the goal line)`:''}`);
// Book 2's opening scroll, then its world
let open2='';for(let i=0;i<60&&!open2;i++){open2=await scroll()||'';await p.waitForTimeout(200);}
check(!!open2,`Book ${T}'s opening scroll comes up: "${open2}"`);
await ready();
check(await p.evaluate(T=>window.__w&&window.__w.w.n===T&&!!window.__w.player,T),`and then Book ${T}'s world, ready to walk`);
// #/tk with no number: the book last played
await p.goto(BASE+'#/tk');await p.waitForTimeout(1500);await ready();
check(await p.evaluate(T=>window.__w&&window.__w.w.n===T,T),`#/tk opens Book ${T} (tk-book ${await p.evaluate(()=>localStorage.getItem('tk-book'))})`);
await p.goto(BASE+'#/tk/'+F);await p.waitForTimeout(1500);await ready();
check(await p.evaluate(F=>window.__w&&window.__w.w.n===F,F),`#/tk/${F} still opens Book ${F}`);
console.log(fails?`book-handoff: ${fails} failed`:'book-handoff: all ok');await b.close();process.exit(fails?1:0);})();
