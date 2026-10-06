// Every story scroll inside a scene is shown when the scene plays (Books 1 and 2): for each scene with
// ["scroll"] steps, clear what comes before, play its beat (its problem skipped with test mode's Skip),
// tap through, and check each scroll's title came up. (Found missing: Book 1's Chapter 2 after the inspector.)
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/1');await p.waitForTimeout(1500);
const cases=await p.evaluate(()=>{const out=[];for(const n of [1,2,3,4,5,6,7,8,9]){const w=TK.world(n);if(!w)continue;for(const node of w.nodes){const sc=w.scenes[node.scene];if(!sc)continue;const sv=sc.steps.filter(s=>s[0]==='scroll').map(s=>s[1]);if(sv.length)out.push({w:n,key:node.key,scene:node.scene,scrolls:sv});}}return out;});
console.log('scenes with scrolls:',cases.map(c=>c.key+'('+c.scrolls.join(', ')+')').join('; '));
for(const c of cases){
  await p.goto(BASE+'#/tk/'+c.w);await p.waitForTimeout(800);
  await p.evaluate(c=>{localStorage.clear();localStorage.setItem('tk-test','1');localStorage.setItem('tk-guide','off');for(let n=1;n<c.w;n++)TK.world(n).nodes.forEach(x=>TK.markCleared(x.key));
    const w=TK.world(c.w),seen=new Set(),st=w.edges.filter(e=>e[1]===c.key).map(e=>e[0]);while(st.length){const k=st.pop();if(seen.has(k))continue;seen.add(k);TK.markCleared(k);st.push(...w.edges.filter(e=>e[1]===k).map(e=>e[0]));}
    for(const k of seen)TK.markSeen(`${c.w}:${(w.nodes.find(x=>x.key===k)||{}).scene}`);TK.markSeen(`${c.w}:opening`);},c);
  await p.reload();await p.waitForTimeout(1500);
  const titles=[];const grab=async()=>{const t=await p.evaluate(()=>{const h=document.querySelector('.tk-scroll h3');return h&&h.textContent;});if(t&&titles[titles.length-1]!==t)titles.push(t);return t;};
  for(let i=0;i<8;i++){const x=p.getByText('Cancel',{exact:true});if(await x.count()&&await x.first().isVisible())await x.first().tap();if(await grab()){await p.locator('.tk-scroll-go').first().tap();await p.waitForTimeout(300);}}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);
  const before=titles.length;
  const ok=await p.evaluate(c=>{const w=window.__w,q=w.region.quests.find(q=>q.node===c.key);if(!q)return 'no quest';w.leaving=false;w.go(q.place);return 'go';},c);
  await p.waitForTimeout(1800);for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);
  await p.waitForTimeout(1200);
  if(!(await p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine)))await p.evaluate(c=>{const w=window.__w,q=w.region.quests.find(q=>q.node===c.key),s=Object.values(w.spots).find(s=>s.node===c.key);if(q&&s&&w.available(q))w.playQuest(q,s);},c);
  for(let i=0;i<600;i++){await p.waitForTimeout(150);if(process.env.DEBUG&&i%20===0)console.log('   ',i,await p.evaluate(k=>JSON.stringify({place:window.__w&&window.__w.placeId,busy:window.__w&&window.__w.ui.busy(),cine:!!(window.__w&&window.__w.cine),duel:!!document.querySelector('.tk-duel'),keys:[...document.querySelectorAll('.tk-duel-keys button')].map(b=>b.textContent).join('|'),cl:TK.cleared(k),next:window.__w&&window.__w.nextMain()&&window.__w.nextMain().node}),c.key));
    if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
    const sk=p.locator('.tk-duel-keys button',{hasText:'Skip'});if(await sk.count()){await sk.first().tap().catch(()=>{});await p.waitForTimeout(500);continue;}
    const s=await p.evaluate(()=>({busy:window.__w&&(window.__w.ui.busy()||!!window.__w.cine)}));
    if(s.busy){const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});if(box)await p.touchscreen.tap(...box);continue;}
    if(await p.evaluate(k=>TK.cleared(k),c.key)&&i>10){await p.waitForTimeout(1500);await grab();if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}break;}}
  const got=titles.slice(before);
  const missing=c.scrolls.filter(t=>!got.some(g=>g.includes(t)));
  check(!missing.length&&await p.evaluate(k=>TK.cleared(k),c.key),`${c.key} (${c.scene}): scrolls ${c.scrolls.join(', ')}; shown ${got.join(', ')||'none'}${missing.length?' — MISSING '+missing.join(', '):''}`);
}
console.log(`scene-scrolls: ${fails} failed`);await b.close();})();
