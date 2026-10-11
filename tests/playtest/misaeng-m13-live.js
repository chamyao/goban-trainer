// Book 1's m13 board on the LIVE site, desktop and iPhone 13: with m13 next, its board deals the user's beginner seki
// (compact-go-puzzles-to-learn-the-basics/147462) and the key's line, played by taps, clears it. Arg: a screenshot path prefix.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
for(const dev of ['desktop','iPhone 13']){
const ctx=await b.newContext(dev==='desktop'?{viewport:{width:1280,height:800}}:{...devices[dev]});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/script\.google\.com/,r=>r.fulfill({status:200,contentType:'application/json',body:'{"data":null}'}));
const U='https://chamyao.github.io/goban-trainer/index.html';
await p.goto(U+'#/tk/21');await p.waitForTimeout(2500);
await p.evaluate(async()=>{await TK.load();if(TK.migrate21)TK.migrate21();localStorage.setItem('tk-guide','off');TK.markSeen('21:opening');const w=TK.world(21);for(const n of w.nodes){if(n.key==='21-m13')break;TK.markCleared(n.key);}});
await p.reload();for(let i=0;i<40&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player)));i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click({timeout:1500}).catch(()=>{});await p.waitForTimeout(250);}
await p.waitForTimeout(4000);
await p.evaluate(()=>{TKOverlay.open(21,'21-m13',{host:document.querySelector('.tk-map')});});
for(let i=0;i<40&&!(await p.evaluate(()=>!!(window.__trainer&&window.__trainer.alive)));i++)await p.waitForTimeout(200);
const info=await p.evaluate(()=>{const t=window.__trainer;return {next:window.__w.nextMain()&&window.__w.nextMain().node,id:t.p.id,lines:t.p.lines.slice(0,4),src:(document.querySelector('.tk-duel-src')||{}).textContent};});
console.log(dev,'deals:',JSON.stringify(info));
// play the key's line: Black's moves by tapping the point, White answers
for(let k=0;k<12;k++){const s=await p.evaluate(()=>{const t=window.__trainer;if(!t||t.done)return {done:t&&t.done};const n=t.played.length;if(n%2)return {};
 const L=t.p.lines.find(L=>L[0]===1&&L.length-1>n&&t.played.every((m,i)=>m===L[i+1]));if(!L)return {none:1};const mv=L[n+1],c=mv.charCodeAt(0)-97,r=mv.charCodeAt(1)-97;
 const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));if(!el)return {miss:mv};const R=el.getBoundingClientRect();return {mv,x:R.left+R.width/2,y:R.top+R.height/2};});
 if(s.done||s.none||s.miss){console.log('  ',JSON.stringify(s));break;}
 if(s.x){dev==='desktop'?await p.mouse.click(s.x,s.y):await p.touchscreen.tap(s.x,s.y);await p.waitForTimeout(300);if(await p.evaluate(()=>!!(window.__trainer&&window.__trainer.goban.ghost))){dev==='desktop'?await p.mouse.click(s.x,s.y):await p.touchscreen.tap(s.x,s.y);}console.log('   played',s.mv);}
 await p.waitForTimeout(1200);}
const res=await p.evaluate(()=>({played:window.__trainer&&window.__trainer.played,done:window.__trainer&&window.__trainer.done,cleared:TK.cleared('21-m13'),line:(document.querySelector('.tk-duel-dlg .town-en')||{}).textContent}));
console.log(dev,'result:',JSON.stringify(res),errs.length?'ERR '+errs.join(' | '):'');
await p.screenshot({path:process.argv[2]+'-'+dev.replace(/ /g,'')+'.png'});await ctx.close();}
await b.close();})();
