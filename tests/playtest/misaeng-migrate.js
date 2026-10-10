// Misaeng Book 1 rewritten (m1-m22 different scenes): an old save of world 21 starts over once, other books untouched,
// and a save made after it is kept.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
const BASE=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(BASE+'/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{localStorage.clear();const pr={tk:{'21-start':1,'21-m1':1,'21-m2':1,'13-c1':1},tkAt:{'21-m1':1,'21-m2':1,'13-c1':1},tkSeen:{'21:x':1,'13:y':1},tkMig:{15:3}};
 localStorage.setItem(PROGRESS_KEY,JSON.stringify(pr));localStorage.setItem('tk-at',JSON.stringify({21:'21-m2',13:'13-c1'}));
 localStorage.setItem('tk-world-21','{"place":"lobby"}');localStorage.setItem('tk-choices','{"a":[1]}');});
await p.reload();await p.waitForTimeout(500);
let r=await p.evaluate(async()=>{await TK.load();const pr=loadProgress();return {m1:TK.cleared('21-m1'),m2:TK.cleared('21-m2'),c1:TK.cleared('13-c1'),
 seen21:!!pr.tkSeen['21:x'],seen13:!!pr.tkSeen['13:y'],at:TK.ls('tk-at'),world:localStorage.getItem('tk-world-21'),ch:localStorage.getItem('tk-choices'),mig:pr.tkMig}});
check(!r.m1&&!r.m2,'an old save of Book 1 starts it over');
check(r.c1&&r.seen13&&r.at[13]==='13-c1','other books are untouched');
check(!r.seen21&&!r.at[21]&&!r.world&&!r.ch,"Book 1's scenes seen, place and A-D picks are forgotten");
check(r.mig[21]===3&&r.mig[15]===3,'done once');
await p.evaluate(()=>TK.markCleared('21-m1'));await p.reload();await p.waitForTimeout(500);
r=await p.evaluate(async()=>{await TK.load();return TK.cleared('21-m1')});
check(r,'a beat cleared after it is kept');
console.log(fails?`misaeng-migrate: ${fails} FAILED`:'misaeng-migrate: all ok');await b.close();process.exit(fails?1:0);})();
