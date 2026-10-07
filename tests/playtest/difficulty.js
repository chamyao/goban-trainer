// The Diaochan book's difficulty switch (menu: 难度 Hard / Easy, localStorage tk-diff; Easy by default). It shows
// and sticks over a reload; at the same beat an Easy board is drawn from the beat's pool_easy (Book 1's grades)
// and a Hard one from its own pool, the second and third boards (~2, ~3) too; road challengers follow it; the
// boss (a14) has no easy pool and stays as it is; Book 1 (test mode) has no switch and its boards don't change.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1';
const ready=async()=>{for(let i=0;i<100;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.cine)))break;await p.waitForTimeout(150);}
  for(let i=0;i<30&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}};
// the book open at a beat (the main beats before it cleared)
const at=async(book,stop)=>{await p.goto(BASE+'#/tk/'+book);await p.waitForTimeout(600);
  await p.evaluate(([book,stop])=>{const keep=localStorage.getItem('tk-diff');for(const k of Object.keys(localStorage))if(/^tk-(progress|cleared|world|rest|seen|party|draw)|gt-progress/.test(k))localStorage.removeItem(k);localStorage.setItem('tk-guide','off');
    const w=TK.world(book),ks=w.nodes.map(n=>n.key),i=stop?ks.indexOf(stop):0;for(const [j,n] of w.nodes.entries())if(j<i&&!['side','short'].includes(n.role))TK.markCleared(n.key);TK.markSeen(book+':opening');},[book,stop]);
  await p.reload();await p.waitForTimeout(1000);await ready();};
// a board: open it, read its problem (the source link's id), leave
const board=async key=>{await p.evaluate(k=>{window.__w.duel(k);},key);let ok=false;for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await p.locator('.tk-duel svg').count()){ok=true;break;}}
  if(!ok)return null;await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const a=document.querySelector('.tk-duel-src a');const m=a&&a.href.match(/\/q\/(\d+)/),t=window.__trainer,tp=t&&(t.problem||(t.book&&t.book.problems&&t.book.problems[t.idx||0]));return {id:m?+m[1]:(tp&&+tp.id)||null,href:a&&a.href,src:(document.querySelector('.tk-duel-src')||{}).textContent||''};});
  await p.locator('.tk-duel-keys button',{hasText:'Leave'}).first().tap().catch(()=>{});await p.waitForTimeout(800);await ready();return r;};
const pools=(book,key)=>p.evaluate(async([book,key])=>{const w=TK.world(book);if(!TK.node(w,key)&&typeof WorldData!=='undefined')await WorldData.region(w.n);const n=TK.node(w,key)||(typeof WorldData!=='undefined'&&WorldData.node(w,key));return n?{hard:(n.pool||[]).map(x=>+x[1]),easy:(n.pool_easy||[]).map(x=>+x[1]),grade:n.grade}:null;},[book,key]);
const setDiff=v=>p.evaluate(v=>localStorage.setItem('tk-diff',v),v);
// 1. the switch: in the menu, Easy by default, sticks
await p.goto(BASE+'#/tk/12');await p.waitForTimeout(600);await p.evaluate(()=>localStorage.removeItem('tk-diff'));await at(12,'12-a9');
const btn=()=>p.locator('.tk-menu-panel button',{hasText:'难度'});
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(400);
if(check(await btn().count()===1,'the menu has the difficulty switch')){
  check(/Easy/.test(await btn().textContent()),`Easy by default ("${(await btn().textContent()).trim()}")`);
  await btn().tap();await p.waitForTimeout(400);
  check(/Hard/.test(await btn().textContent())&&await p.evaluate(()=>localStorage.getItem('tk-diff'))==='hard',`a tap sets Hard ("${(await btn().textContent()).trim()}", tk-diff ${await p.evaluate(()=>localStorage.getItem('tk-diff'))})`);
  await p.reload();await p.waitForTimeout(1000);await ready();await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(400);
  check(/Hard/.test(await btn().textContent()),'it sticks over a reload');
  await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);}
// 2. the same beat's boards, Easy then Hard (each from its own pool)
for(const key of ['12-a9','12-a9~2','12-a9~3']){const base=key.split('~')[0],P=await pools(12,base);
  for(const d of ['easy','hard']){await setDiff(d);await at(12,base);const r=await board(key);
    if(!check(!!r&&r.id,`${key} on ${d}: a board opens (${r&&r.src.slice(0,40)})`))continue;
    check((d==='easy'?P.easy:P.hard).includes(r.id),`${key} on ${d}: problem ${r.id} is from the ${d==='easy'?'easy pool (Book 1 grades)':'beat\'s own pool ('+P.grade+')'}; grade line "${r.src.split('·')[0].trim()}"`);}}
// 3. a road challenger follows the switch
{await setDiff('easy');await at(12,'12-a2');const ch=await p.evaluate(()=>{const n=window.__w.npcs.find(n=>n.challenge&&n.spr.visible&&!TK.cleared(n.challenge));return n&&n.challenge;});
  if(check(!!ch,`a challenger on the road at a2 (${ch})`)){const P=await pools(12,ch);if(check(P&&P.easy.length>0,`it has an easy pool (${P&&P.easy.length})`))
    for(const d of ['easy','hard']){await setDiff(d);await at(12,'12-a2');const r=await board(ch);check(!!r&&(d==='easy'?P.easy:P.hard).includes(r.id),`${ch} on ${d}: problem ${r&&r.id} from its ${d} pool`);}}}
// 4. the boss keeps its own on Easy
{await setDiff('easy');const P=await pools(12,'12-a14');check(!P.easy.length,'the boss (a14) has no easy pool');await at(12,'12-a14');const r=await board('12-a14');check(!!r&&P.hard.includes(r.id),`a14 on easy: problem ${r&&r.id} from its own pool (${r&&r.href})`);}
// 5. Book 1 (test mode): no switch, boards from its own pool whatever tk-diff says
{await setDiff('easy');await at(1,null);await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(400);check(await btn().count()===0,'Book 1 has no difficulty switch');
  await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);
  const key=await p.evaluate(()=>window.__w.nextMain().node),P=await pools(1,key),r=await board(key);check(!!r&&P.hard.includes(r.id),`Book 1's ${key} with tk-diff easy: problem ${r&&r.id} from its own pool`);}
await setDiff('hard');
console.log(`difficulty: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
