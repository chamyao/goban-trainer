// Odd window sizes: a small phone (iPhone SE) both ways, a folded phone, a tablet, a short and a very wide
// desktop. Each: the game fills the window; the goal line, the Menu button and every menu button are on
// screen; a talk's dialogue box fits; a problem's board and its keys are on screen.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const SIZES=[['phone SE',{...devices['iPhone SE']}],['phone SE sideways',{...devices['iPhone SE landscape']}],['folded phone',{viewport:{width:280,height:653},deviceScaleFactor:3,isMobile:true,hasTouch:true}],
  ['tablet',{...devices['iPad (gen 7)']}],['tablet sideways',{...devices['iPad (gen 7) landscape']}],['short desktop',{viewport:{width:1280,height:500}}],['wide desktop',{viewport:{width:1920,height:600}}]];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});let fails=0;
for(const [name,dev] of SIZES){
  const ctx=await b.newContext(dev);const p=await ctx.newPage();const out=[];const bad=(c,w)=>{if(!c)out.push(w);};
  p.on('pageerror',e=>out.push('ERR '+e.message));
  await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
  await p.evaluate(()=>{['1-start'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
  const touch=!!dev.hasTouch;const click=async loc=>touch?loc.tap():loc.click();
  for(let i=0;i<10;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await click(c.first());const g=p.locator('.tk-scroll-go');if(await g.count()){await click(g.first());await p.waitForTimeout(400);}else if(i>3)break;else await p.waitForTimeout(300);}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);await p.waitForTimeout(800);
  const inView=sel=>p.evaluate(sel=>[...document.querySelectorAll(sel)].filter(e=>!e.hidden&&e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {t:(e.textContent||e.className).trim().slice(0,20),ok:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,r:[r.left,r.top,r.right,r.bottom].map(Math.round)};}),sel);
  const vw=await p.evaluate(()=>[innerWidth,innerHeight]);
  const cv=await p.evaluate(()=>{const r=window.__w.game.canvas.getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(Math.round);});
  // a phone (full window): the game fills the screen (letterboxing is a note); a desktop window: the game fits in it
  if(touch&&!/tablet/.test(name)){if(!(Math.abs(cv[2]-vw[0])<3&&Math.abs(cv[3]-vw[1])<3))console.log(`NOTE ${name}: the game letterboxes: canvas ${cv} in ${vw}`);}
  else bad(cv[0]>=-1&&cv[1]>=-1&&cv[0]+cv[2]<=vw[0]+1&&cv[1]+cv[3]<=vw[1]+1,`the game doesn't fit in the window: canvas ${cv} in ${vw}`);
  const hs=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);bad(!hs,'the page scrolls sideways');
  for(const g of await inView('.town-goal'))bad(g.ok,`the goal line runs off the screen ${g.r}`);
  const gOver=await p.evaluate(()=>{const g=document.querySelector('.town-goal');return g&&(g.scrollWidth>g.clientWidth+2||g.scrollHeight>g.clientHeight+2);});bad(!gOver,'the goal text overflows its box');
  const mb=await inView('.tk-menu-btn');bad(mb.length&&mb.every(x=>x.ok),'a Menu/full-window button is off screen: '+JSON.stringify(mb));
  // goal line and buttons overlapping each other
  const lap=await p.evaluate(()=>{const g=document.querySelector('.town-goal');if(!g||g.hidden)return false;const a=g.getBoundingClientRect();return [...document.querySelectorAll('.tk-menu-btn')].filter(b=>b.offsetParent).some(b=>{const r=b.getBoundingClientRect();return r.left<a.right-3&&r.right>a.left+3&&r.top<a.bottom-3&&r.bottom>a.top+3;});});
  bad(!lap,'the Menu button overlaps the goal line');
  await click(p.locator('.tk-menu-btn',{hasText:'Menu'}));await p.waitForTimeout(400);
  const mbs=await inView('.tk-menu-panel button');bad(mbs.length>=5&&mbs.every(x=>x.ok),'menu buttons off screen: '+mbs.filter(x=>!x.ok).map(x=>x.t+' '+x.r).join(', '));
  await p.screenshot({path:SP+`/size-${name.replace(/ /g,'-')}-menu.png`});
  await click(p.locator('.tk-menu-btn',{hasText:'Menu'}));await p.waitForTimeout(300);
  // a talk
  await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(n=>!n.challenge&&n.spr.visible);n.wander=false;w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.act();});await p.waitForTimeout(1200);
  const dl=await inView('.town-ui .town-dlg');bad(dl.length===1&&dl[0].ok,'the dialogue box is off screen: '+JSON.stringify(dl));
  const dOver=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden&&(d.scrollHeight>d.clientHeight+2);});bad(!dOver,'the dialogue text overflows its box');
  for(let i=0;i<20&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(100);}
  // a problem
  await p.evaluate(()=>{const w=window.__w,n=w.npcs.find(n=>n.challenge);n.wander=false;w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.act();});
  for(let i=0;i<60&&!(await p.locator('.tk-duel svg').count());i++){await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());await p.waitForTimeout(100);}await p.waitForTimeout(900);
  const bd=await inView('.tk-duel svg');bad(bd.length&&bd[0].ok,'the board is off screen: '+JSON.stringify(bd));
  const keys=await inView('.tk-duel-key');bad(keys.length>=4&&keys.every(x=>x.ok),'problem keys off screen: '+keys.filter(x=>!x.ok).map(x=>x.t+' '+x.r).join(', '));
  const dd=await inView('.tk-duel-dlg');bad(dd.length&&dd[0].ok,'the problem\'s line is off screen: '+JSON.stringify(dd));
  const pitch=await p.evaluate(()=>{const t=window.__trainer;if(!t)return 0;const a=t.goban.svg.querySelectorAll('circle[fill="transparent"]');if(a.length<2)return 0;const r0=a[0].getBoundingClientRect(),r1=a[1].getBoundingClientRect();return Math.round(Math.hypot(r1.left-r0.left,r1.top-r0.top));});
  if(touch&&pitch&&pitch<28)console.log(`NOTE ${name}: board points are ${pitch} px apart (a fingertip is about 40)`);
  const bsize=bd.length?`${bd[0].r[2]-bd[0].r[0]}x${bd[0].r[3]-bd[0].r[1]}`:'none';
  await p.screenshot({path:SP+`/size-${name.replace(/ /g,'-')}-duel.png`});
  if(out.length)fails++;
  console.log(`${out.length?'FAIL':'ok  '} ${name} ${vw.join('x')}: board ${bsize}, points ${pitch}px apart${out.length?' — '+out.join('; '):''}`);
  await ctx.close();}
console.log(`window-sizes: ${fails} failed`);await b.close();})();
