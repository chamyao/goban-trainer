// The header fits the window at any width (apo110: "the top menu bar not scaled correctly makes the site move when I
// press right arrow for the next move"): no page wider than the window, with a long name and every chip showing; and
// → on a board page moves the board, not the page.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
for(const w of [768,1024,1280,1366,1440]){const p=await b.newPage({viewport:{width:w,height:900}});p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
  await p.addInitScript(()=>{localStorage.setItem('gt-username','a-rather-long-username');localStorage.setItem('gt-event-date','2026-10-21T12:00:00');});
  await p.route('https://script.google.com/**',r=>r.fulfill({json:{data:{}}}));
  await p.goto('http://localhost:8765/#/stream');await p.waitForFunction(()=>window.__trainer&&window.__trainer.p);await p.waitForTimeout(800);
  await p.evaluate(()=>document.querySelectorAll('.ev-reward').forEach(x=>x.remove()));
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
  await p.keyboard.press('ArrowRight');await p.waitForTimeout(600);
  const sx=await p.evaluate(()=>scrollX);
  check(sw<=w&&sx===0,`${w}px: the page fits (${sw}px), and → doesn't move it (scrollX ${sx})`);await p.close();}
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);})();
