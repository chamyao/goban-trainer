// Phone, taps: the decision boards (a node with a "dilemma"). For each, upright and on its side: the
// parchment caption (Chinese above English) is over the board, readable (12 px or more, on screen) and
// covers no stone; the leader's own opening line plays; a slip gives his first-person slip line and the
// 30 s rest, and the caption is still there on the board that comes back (upright); a win gives his win
// line, and the scene goes on after Continue (on its side; its lines are printed: the novel's choice).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message,'@',(String(e.stack).split('\n')[1]||'').trim()));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1'+(process.env.PLAYTEST_KIT?'&kit='+process.env.PLAYTEST_KIT:'');
await p.goto(BASE+'#/tk/1');await p.waitForTimeout(1500);
const cases0=await p.evaluate(()=>{const out=[];for(const n of [1,2]){const w=TK.world(n);if(!w)continue;for(const node of w.nodes)if(node.dilemma)out.push({w:n,key:node.key,scene:node.scene,dil:node.dilemma});}return out;});
const cases=[];for(const c of cases0)for(const dev of ['iPhone 13','iPhone 13 landscape'])cases.push({...c,dev});
const only=process.env.ONLY?process.env.ONLY.split(','):null;
console.log(`decision boards: ${cases0.map(c=>c.key+' ('+c.scene+')').join(', ')}`);
for(const c of cases0)check(!!c.dil.open,`${c.key}: the leader has his own opening line (dilemma.open)${c.dil.open?'':' — none in the data; the usual opening plays'}`);
for(const c of cases.filter(c=>!only||only.includes(c.key))){
  await p.setViewportSize(devices[c.dev].viewport);
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
  let board=false;const lines=[];
  const dlgText=()=>p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.textContent.replace(/\s+/g,' ').trim():'';});
  for(let i=0;i<400;i++){await p.waitForTimeout(150);
    if(await p.evaluate(()=>!!(document.querySelector('.tk-duel svg')&&window.__trainer&&window.__trainer.goban))){board=true;break;}
    if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    if(await p.locator('.tk-duel-go').count()){await p.locator('.tk-duel-go').first().tap().catch(()=>{});continue;}
    const s=await p.evaluate(()=>({busy:window.__w&&(window.__w.ui.busy()||!!window.__w.cine)}));
    if(s.busy){const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});if(box)await p.touchscreen.tap(...box);continue;}
  }
  const tag=`${c.key} ${c.dev.includes('landscape')?'on its side':'upright'}`;
  if(!check(board,`${tag}: the board opens`))continue;
  await p.waitForTimeout(900);
  const cap=async()=>p.evaluate(()=>{const e=document.querySelector('.tk-duel-dilemma');if(!e)return null;const r=e.getBoundingClientRect(),zh=e.querySelector('b'),en=e.querySelector('span');
    const stones=[...document.querySelectorAll('.tk-duel svg circle')].filter(c=>+c.getAttribute('r')>3).map(c=>c.getBoundingClientRect()).filter(s=>s.width>4);
    const hit=stones.filter(s=>s.left<r.right-1&&s.right>r.left+1&&s.top<r.bottom-1&&s.bottom>r.top+1).length;
    const fs=x=>x?parseFloat(getComputedStyle(x).fontSize):0;
    return {zh:zh&&zh.textContent,en:en&&en.textContent,zhAbove:zh&&en?zh.getBoundingClientRect().bottom<=en.getBoundingClientRect().top+2:false,fz:fs(zh),fe:fs(en),
      on:r.top>=0&&r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>0&&getComputedStyle(e).visibility!=='hidden',stones:stones.length,hit,r:[r.left,r.top,r.width,r.height].map(Math.round)};});
  const k=await cap();
  await p.screenshot({path:require('path').join(__dirname,'out',`decision-${c.key}-${c.dev.replace(/ /g,'_')}.png`)});
  check(!!k&&k.zh===c.dil.q_zh&&k.en===c.dil.q,`${tag}: the caption is there: ${k?`"${k.zh}" / "${k.en}"`:'none'}`);
  if(k){check(k.zhAbove,`${tag}: Chinese above English`);
    check(k.on&&k.fz>=12&&k.fe>=12,`${tag}: readable and on screen (zh ${k.fz}px, en ${k.fe}px, at ${k.r})`);
    check(k.hit===0,`${tag}: covers no stone (${k.hit} of ${k.stones} under it)`);}
  const open=await dlgText();console.log(`     opening line: "${open.slice(0,120)}"`);
  if(c.dil.open)check(open.includes(c.dil.open),`${tag}: the leader's opening line plays`);
  if(!c.dev.includes('landscape')){   // upright: a slip
  // a slip: his line, the 30 s rest, and the caption still on the board that comes back
  await p.evaluate(()=>{window.__trainer.flawed=null;dispatchEvent(new CustomEvent('tczw:result',{detail:'fail'}));});await p.waitForTimeout(400);
  const sl=await dlgText(),rest=await p.evaluate(k=>TK.restLeft(k),c.key);
  check(sl.includes(c.dil.slip)&&sl.includes(c.dil.slip_zh),`${tag}: a slip gives his line: "${sl.slice(0,100)}"`);
  check(rest>25000&&rest<=30500,`${tag}: and the 30 s rest (${Math.round(rest/1000)} s left)`);
  await p.waitForTimeout(2200);const k2=await cap();
  check(!!k2&&k2.en===c.dil.q,`${tag}: the caption is still over the board that comes back`);
  }else{   // on its side: the win, his win line, then the scene goes on
  await p.evaluate(()=>{window.__trainer.flawed=null;dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'}));});await p.waitForTimeout(500);
  const wn=await dlgText();check(wn.includes(c.dil.win)&&wn.includes(c.dil.win_zh),`${tag}: a win gives his line: "${wn.slice(0,100)}"`);
  if(await p.locator('.tk-duel-go').count())await p.locator('.tk-duel-go').first().tap().catch(()=>{});
  const after=[];for(let i=0;i<300;i++){await p.waitForTimeout(150);
    const l=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.textContent.replace(/\s+/g,' ').trim():'';});if(l&&after[after.length-1]!==l)after.push(l);
    if(await grab()){await p.locator('.tk-scroll-go').first().tap().catch(()=>{});continue;}
    const s=await p.evaluate(()=>({busy:window.__w&&(window.__w.ui.busy()||!!window.__w.cine)}));
    if(s.busy){const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});if(box)await p.touchscreen.tap(...box);continue;}
    if(i>10)break;}
  console.log('     after the board:\n       '+after.map(x=>x.slice(0,140)).join('\n       '));
  check(after.length>0&&await p.evaluate(k=>TK.cleared(k),c.key),`${tag}: the scene goes on after the board (${after.length} lines) and the beat is cleared`);
  }
}
console.log(`decision-boards: ${fails} failed`);await b.close();process.exit(fails?1:0);})();
