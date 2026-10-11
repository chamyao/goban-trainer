// Book 2's record beats on the LIVE site (AT=22-b23 | 22-b25 | 22-b27 | 22-b33): with that beat next, the strip's label and the stone it
// rings; FAIL if the ring is on the move the board asks for (the strip giving the answer away). Arg: a screenshot path for the strip.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
await p.route(/script\.google\.com/,r=>r.fulfill({status:200,contentType:'application/json',body:'{"data":null}'}));
const U='https://chamyao.github.io/goban-trainer/index.html';
await p.goto(U+'#/tk/22');await p.waitForTimeout(2500);
await p.evaluate(async(AT)=>{await TK.load();localStorage.setItem('tk-guide','off');TK.markSeen('22:opening');const w=TK.world(22);for(const n of w.nodes){if(n.key===AT)break;TK.markCleared(n.key);}},process.env.AT);
await p.reload();for(let i=0;i<40&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player)));i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click({timeout:1500}).catch(()=>{});await p.waitForTimeout(250);}
await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const s=document.querySelector('.tk-strip');if(!s)return {strip:null,next:window.__w.nextMain()&&window.__w.nextMain().node};const svg=s.querySelector('svg'),vb=svg.viewBox.baseVal.width,st=vb/20;
 const ring=[...svg.querySelectorAll('circle')].find(c=>c.getAttribute('fill')==='none');const x=Math.round(+ring.getAttribute('cx')/st-1),y=Math.round(+ring.getAttribute('cy')/st-1);
 return {next:window.__w.nextMain().node,label:s.textContent,ringAt:String.fromCharCode(97+x)+String.fromCharCode(97+y)};});
const ans={'22-b23':'jq','22-b25':'mq','22-b27':'nr','22-b33':'ms'}[process.env.AT];console.log(JSON.stringify(r), r.ringAt===ans?'FAIL the strip rings the answer':'ok   the strip does not show the answer ('+ans+')');await p.locator('.tk-strip').screenshot({path:process.argv[2]}).catch(()=>{});await b.close();})();
