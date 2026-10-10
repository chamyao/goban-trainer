// The run's clock (tk-modern.js WorldModern.clock): a beat with "clock" shows its start time while it is the next main
// beat; walking adds a minute every few tiles (none while a scene runs), and it goes once the next beat has no clock.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(BASE+'/index.html#/');await p.waitForTimeout(400);
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);TK.migrate21();localStorage.setItem('tk-guide','off');localStorage.setItem('gt-username','pt-clock');});
await p.goto(BASE+'/index.html#/tk/21');
for(let i=0;i<120&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.cine))) ;i++){await p.evaluate(()=>{const g=document.querySelector('.tk-scroll-go');if(g)g.click();});await p.evaluate(()=>window.__w&&window.__w.ui&&window.__w.ui.busy()&&window.__w.ui.advance()).catch(()=>{});await p.waitForTimeout(250);}
const txt=()=>p.evaluate(()=>{const c=document.querySelector('.tk-clock');return c?c.textContent:null;});
check(await txt()===null,'no clock while the next beat has none');
await p.evaluate(()=>{const s=window.__w,q=s.nextMain();s.w.nodes.find(n=>n.key===q.node).clock={start:'11:00',tiles:2};WorldModern.hud(s);});
check((await txt()||'').startsWith('11:00'),`the clock shows its start: "${await txt()}"`);
await p.evaluate(()=>{const s=window.__w;for(let i=0;i<8;i++)setTimeout(()=>{s.player.x+=s.tw;},i*300);});
await p.waitForTimeout(3200);
const t=await txt();check(/^11:0[3-5]/.test(t||'')&&/min late/.test(t),`8 tiles walked at 2 a minute: "${t}"`);
const box=await p.evaluate(()=>{const c=document.querySelector('.tk-clock').getBoundingClientRect(),g=document.querySelector('.town-goal').getBoundingClientRect();return {ok:c.bottom<=g.top||c.top>=g.bottom||c.right<=g.left||c.left>=g.right};});
check(box.ok,'the clock clears the goal box');
await p.evaluate(()=>{const s=window.__w,q=s.nextMain();delete s.w.nodes.find(n=>n.key===q.node).clock;WorldModern.hud(s);});
check(await txt()===null,'the clock goes once the next beat has none');
console.log(fails?`misaeng-clock: ${fails} FAILED`:'misaeng-clock: all ok');await b.close();process.exit(fails?1:0);})();
