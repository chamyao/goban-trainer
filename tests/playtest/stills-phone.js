// Phone upright: the scene pictures (stills) on a screen much narrower than the picture. For a few scenes
// (the oath, Hulao, the garden): the picture never leaves a gap at the screen's sides as it pans, a blurred
// copy (when there is one) fills the screen, how much of the picture the pan shows, how much of it the dialogue box covers, and
// turning the phone on its side mid-picture (then back) still leaves no gap.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message,'@',(String(e.stack).split('\n')[1]||'').trim()));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/1');await p.waitForTimeout(1500);
const cases=(process.env.NODES||'1-n2,2-boss,2-d1').split(',').map(k=>({w:+k[0],key:k}));
const only=process.env.ONLY?process.env.ONLY.split(','):null;

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
  const measured=new Set();
  const measure=async(tag)=>p.evaluate(async()=>{const el=document.querySelector('.tk-still.on');if(!el)return null;const img=el.querySelector('img:not(.tk-still-bg)'),bg=el.querySelector('.tk-still-bg');
    const E=el.getBoundingClientRect(),id=(img.src.match(/stills\/([^.?]+)/)||[])[1];let minL=1e9,maxL=-1e9,gap=0,n=0;
    for(let i=0;i<22;i++){const r=img.getBoundingClientRect();minL=Math.min(minL,r.left);maxL=Math.max(maxL,r.left);if(r.left>E.left+1||r.right<E.right-1)gap++;n++;await new Promise(z=>setTimeout(z,500));}
    const R=img.getBoundingClientRect(),B=bg&&bg.getBoundingClientRect();
    const d=document.querySelector('.town-ui .town-dlg');const D=d&&!d.hidden&&d.offsetParent?d.getBoundingClientRect():null;
    const covered=D?Math.max(0,Math.min(R.bottom,E.bottom)-Math.max(R.top,D.top))/Math.min(R.height,E.height):0;
    return {id,wide:el.classList.contains('wide'),screen:[E.width,E.height].map(Math.round),img:[R.width,R.height,R.top].map(Math.round),seen:Math.round(100*Math.min(1,(maxL-minL+E.width)/R.width)),gap,n,
      hasBg:!!B,bgFills:!B||B.left<=E.left+1&&B.top<=E.top+1&&B.right>=E.right-1&&B.bottom>=E.bottom-1,covered:Math.round(100*covered),dlgTop:D&&Math.round(D.top)};});
  const gapNow=()=>p.evaluate(()=>{const el=document.querySelector('.tk-still.on');if(!el)return null;const img=el.querySelector('img:not(.tk-still-bg)'),E=el.getBoundingClientRect(),R=img.getBoundingClientRect(),bg=el.querySelector('.tk-still-bg');
    return {left:Math.round(R.left-E.left),right:Math.round(E.right-R.right),top:Math.round(R.top-E.top),h:Math.round(R.height),H:Math.round(E.height),wide:el.classList.contains('wide'),bgFills:!bg||(()=>{const B=bg.getBoundingClientRect();return B.right>=E.right-1&&B.bottom>=E.bottom-1;})()};});
  for(let i=0;i<500;i++){await p.waitForTimeout(150);
    const id=await p.evaluate(()=>{const el=document.querySelector('.tk-still.on img:not(.tk-still-bg)');return el?(el.src.match(/stills\/([^.?]+)/)||[])[1]:null;});
    if(id&&!measured.has(id)){measured.add(id);await p.waitForTimeout(800);
      const m=await measure();await p.screenshot({path:require('path').join(__dirname,'out',`still-${id}-upright.png`)});
      console.log(`     ${id}: picture ${m.img[0]}x${m.img[1]} at top ${m.img[2]} on ${m.screen}, pan shows ${m.seen}% of its width, dialogue box covers ${m.covered}% of it (box top ${m.dlgTop})`);
      check(m.wide,`${id}: shown as the upright-phone picture (wide)`);
      check(m.gap===0,`${id}: no gap at the sides while it pans (${m.gap}/${m.n} samples with a gap)`);
      if(m.hasBg)check(m.bgFills,`${id}: the blurred copy fills the screen`);
      check(m.covered<=34,`${id}: the dialogue box covers ${m.covered}% of the picture`);
      // on its side mid-picture, then back
      await p.setViewportSize(devices['iPhone 13 landscape'].viewport);await p.waitForTimeout(1500);const L=await gapNow();
      await p.screenshot({path:require('path').join(__dirname,'out',`still-${id}-turned.png`)});
      if(L)check(L.left<=1&&L.right<=1&&L.bgFills,`${id}: turned on its side mid-picture: gap left ${L.left} / right ${L.right} px, picture ${L.h} tall on ${L.H} (wide ${L.wide})`);
      await p.setViewportSize(devices['iPhone 13'].viewport);await p.waitForTimeout(1500);const U=await gapNow();
      if(U)check(U.left<=1&&U.right<=1&&U.bgFills,`${id}: and back upright: gap left ${U.left} / right ${U.right} px`);
      continue;}
    if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
    const sk=p.locator('.tk-duel-keys button',{hasText:'Skip'});if(await sk.count()){await sk.first().tap().catch(()=>{});await p.waitForTimeout(500);continue;}
    const s=await p.evaluate(()=>({busy:window.__w&&(window.__w.ui.busy()||!!window.__w.cine)}));
    if(s.busy){const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});if(box)await p.touchscreen.tap(...box);continue;}
    if(await p.evaluate(k=>TK.cleared(k),c.key)&&i>10)break;}
  check(measured.size>0,`${c.key}: pictures seen: ${[...measured].join(', ')||'none'}`);
}
console.log(`stills-phone: ${fails} failed`);await b.close();process.exit(fails?1:0);})();
