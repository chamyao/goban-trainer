// The Tavern look (theme-tavern.css, app.js Theme): off by default, the header's Theme picker (Classic / Tavern) turns it on and it
// stays on (per device), it's on every page but never on a story playthrough (#/tk/...), and the chip turns it off.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const on=()=>p.evaluate(()=>document.body.classList.contains('theme-tavern'));
await p.goto('http://localhost:8765/#/');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});await p.waitForSelector('.book');
check(!(await on()),'off by default');
await p.selectOption('#themeSelect','tavern');await p.waitForTimeout(300);
check(await on()&&!(await p.$('.tavern-hero')),'the Theme picker turns it on (and there is no tavern banner: the user asked it gone)');
await p.reload();await p.waitForSelector('.book');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});check(await on(),'it stays on after a reload');
for(const hsh of ['#/review','#/play','#/feedback','#/book/redmond-life-and-death/1','#/stream']){await p.goto('http://localhost:8765/'+hsh);await p.waitForTimeout(500);check(await on(),`on at ${hsh}`);}
await p.goto('http://localhost:8765/#/tk/1');await p.waitForTimeout(2000);
check(!(await on())&&(await p.evaluate(()=>document.getElementById('themeChip').hidden)),'never on a story playthrough (#/tk/1), and the picker hides there');
await p.goto('http://localhost:8765/#/');await p.waitForSelector('.book');check(await on(),'back on the Library, the look returns');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});check((await p.inputValue('#themeSelect'))==='tavern','the picker shows Tavern');await p.selectOption('#themeSelect','classic');await p.waitForTimeout(300);check(!(await on()),'and Classic turns it off');
console.log(fails?`tavern-theme: ${fails} failed`:'tavern-theme: all ok');await b.close();process.exit(fails?1:0);
})();
