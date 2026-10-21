// The seasonal look (theme-seasonal.css, app.js Theme): Seasonal is the default and picks the season by the date
// (Oct 1 - Nov 2 Halloween); Classic turns it off; never on a story playthrough.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
const at=async(iso)=>{const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
  await p.addInitScript(t=>{const D=Date,T=new D(t).getTime(),off=T-D.now();window.Date=class extends D{constructor(...a){super(...(a.length?a:[D.now()+off]));} static now(){return D.now()+off;}};},iso);
  await p.goto('http://localhost:8765/#/');await p.waitForSelector('.book');return p;};
const cls=p=>p.evaluate(()=>document.body.className);
const a=await at('2026-10-21T12:00:00');check(/season-halloween/.test(await cls(a)),'Oct 21: Halloween by default');
const c=await at('2026-11-03T12:00:00');check(!/season-/.test(await cls(c)),'Nov 3: Halloween is over (no seasonal look yet)');
await a.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await a.selectOption('#themeSelect','classic');await a.waitForTimeout(300);check(!/season-/.test(await cls(a)),'Classic turns it off');
await a.selectOption('#themeSelect','seasonal');await a.waitForTimeout(300);check(/season-halloween/.test(await cls(a)),'Seasonal turns it back on');
await a.goto('http://localhost:8765/#/tk/1');await a.waitForTimeout(1500);check(!/season-/.test(await cls(a)),'never on a story playthrough');
console.log(fails?`seasonal-theme: ${fails} failed`:'seasonal-theme: all ok');await b.close();process.exit(fails?1:0);})();
