// Every scene with a ["problem"] step shows its board when it plays (Books 1 and 2), and so does the
// first beat of every book (a node nothing comes before). For each: clear what comes before, play its
// beat by taps, and wait for the duel's board. (Found: Book 2's Pingyuan scene closed without a board,
// because a book with no start node had no open node.)
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message,'@',(String(e.stack).split('\n')[1]||'').trim()));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/1');await p.waitForTimeout(1500);
const cases=await p.evaluate(()=>{const out=[];for(const n of [1,2]){const w=TK.world(n);if(!w)continue;for(const node of w.nodes){const sc=w.scenes[node.scene];const first=!w.edges.some(e=>e[1]===node.key);const prob=!!(sc&&sc.steps.some(s=>s[0]==='problem'));if(prob||first)out.push({w:n,key:node.key,scene:node.scene,first,prob});}}return out;});
const only=process.env.ONLY?process.env.ONLY.split(','):null;
console.log(`${cases.length} beats: ${cases.filter(c=>c.prob).length} scenes with a problem, first beats ${cases.filter(c=>c.first).map(c=>c.key).join(' ')}`);
for(const c of cases.filter(c=>!only||only.includes(c.key))){
  await p.goto(BASE+'#/tk/'+c.w);await p.waitForTimeout(800);
  await p.evaluate(c=>{localStorage.clear();localStorage.setItem('tk-test','1');localStorage.setItem('tk-guide','off');for(let n=1;n<c.w;n++)TK.world(n).nodes.forEach(x=>TK.markCleared(x.key));
    const w=TK.world(c.w),seen=new Set(),st=w.edges.filter(e=>e[1]===c.key).map(e=>e[0]);while(st.length){const k=st.pop();if(seen.has(k))continue;seen.add(k);TK.markCleared(k);st.push(...w.edges.filter(e=>e[1]===k).map(e=>e[0]));}
    for(const k of seen)TK.markSeen(`${c.w}:${(w.nodes.find(x=>x.key===k)||{}).scene}`);TK.markSeen(`${c.w}:opening`);},c);
  await p.reload();await p.waitForTimeout(1500);
  const titles=[];const grab=async()=>{const t=await p.evaluate(()=>{const h=document.querySelector('.tk-scroll h3');return h&&h.textContent;});if(t&&titles[titles.length-1]!==t)titles.push(t);return t;};
  for(let i=0;i<8;i++){const x=p.getByText('Cancel',{exact:true});if(await x.count()&&await x.first().isVisible())await x.first().tap();if(await grab()){await p.locator('.tk-scroll-go').first().tap();await p.waitForTimeout(300);}}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);
  const before=titles.length;
  const ok=await p.evaluate(c=>{const w=window.__w,q=w.region.quests.find(q=>q.node===c.key);if(!q)return 'no quest';
    // a gated beat: bring what it needs (its items and marks), so the beat itself plays, not its "not yet" scene
    for(const g of q.gate||[])for(const n of [].concat(g.needs||[])){const [k,v]=String(n).split(':');if(k==='item')WorldItems.add(w.w,v);if(k==='mark')WorldMarks.add(w.w,v);if(k==='node')TK.markCleared(/^\d+-/.test(v)?v:w.w.n+'-'+v);}
    w.leaving=false;w.go(q.place);return 'go';},c);
  await p.waitForTimeout(1800);for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);
  await p.waitForTimeout(1200);
  if(!(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)))await p.evaluate(c=>{const w=window.__w,q=w.region.quests.find(q=>q.node===c.key),s=Object.values(w.spots).find(s=>s.node===c.key);if(q&&s&&w.available(q))w.playQuest(q,s);},c);
  let board=false;
  for(let i=0;i<400;i++){await p.waitForTimeout(150);
    if(await p.evaluate(()=>!!(document.querySelector('.tk-duel')&&window.__trainer&&window.__trainer.goban&&document.querySelector('.tk-duel canvas, .tk-duel svg')))){board=true;break;}
    if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
    const s=await p.evaluate(()=>({busy:window.__w&&(window.__w.ui.busy()||!!window.__w.cine)}));
    if(s.busy){const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});if(box)await p.touchscreen.tap(...box);continue;}
    if(await p.evaluate(k=>TK.cleared(k),c.key)&&i>10)break;
    if(i>40&&!s.busy&&!(await p.evaluate(()=>!!document.querySelector('.tk-duel'))))break;   // the scene is over and no board came
  }
  const st=await p.evaluate(k=>({place:window.__w&&window.__w.placeId,cleared:TK.cleared(k)}),c.key);
  check(board,`${c.key} (${c.scene||'no scene'}${c.first?', first beat':''}): ${board?'board shown':'NO BOARD'}${board?'':' — at '+st.place+(st.cleared?', cleared anyway':'')}`);
}
console.log(`boards-open: ${fails} failed`);await b.close();process.exit(fails?1:0);})();
