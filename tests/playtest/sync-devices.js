// Two devices on one username, against a mocked Apps Script: solves and the campaign place follow you; a stale tab's save keeps the other device's solves; coming back to a tab pulls what happened elsewhere.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
const store={};let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
const dev=async()=>{const ctx=await b.newContext({viewport:{width:1200,height:800}});const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
 await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
 await p.route('https://script.google.com/**',async r=>{const req=r.request();const u=new URL(req.url());
  if(req.method()==='POST'){const j=JSON.parse(req.postData());if(j.kind==='progress')store[j.username]=j.data;return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:store[u.searchParams.get('username')]||{}})});});
 await p.goto('http://localhost:8765/index.html#/tk/12');await p.waitForTimeout(500);
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('gt-username','synctest');localStorage.setItem('tk-guide','off');});
 return p;};
const A=await dev(), B=await dev();
// A plays: clears beats, stands somewhere
await A.reload();await A.waitForTimeout(1500);
await A.evaluate(()=>{TK.markCleared('12-start');TK.markCleared('12-a1');TK.markCleared('12-a2');localStorage.setItem('tk-world-12',JSON.stringify({place:'meiwu',pos:{x:400,y:300},party:['diaochan']}));TK.setParty(TK.world(12),['diaochan']);});
await A.waitForTimeout(4500);
check(store.synctest&&store.synctest.progress.tk['12-a2']===1&&store.synctest.tkLocal['tk-world-12'],'A saved its solves and its place');
// B opens fresh: gets both
await B.reload();await B.waitForTimeout(2500);
const b1=await B.evaluate(()=>({a2:TK.cleared('12-a2'),w:JSON.parse(localStorage.getItem('tk-world-12')||'{}').place}));
check(b1.a2&&b1.w==='meiwu',`B on load has A's solves and place (${JSON.stringify(b1)})`);
// B plays more; A is a stale tab that then solves something else
await B.evaluate(()=>{TK.markCleared('12-a3');});await B.waitForTimeout(4500);
await A.evaluate(()=>{TK.markCleared('12-a4');});await A.waitForTimeout(4500);
const s=store.synctest.progress.tk;check(s['12-a3']===1&&s['12-a4']===1,`a stale tab's save keeps the other device's solves (a3 ${s['12-a3']}, a4 ${s['12-a4']})`);
// B returns to its tab: picks up A's a4
await B.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));});await B.waitForTimeout(2500);
check(await B.evaluate(()=>TK.cleared('12-a4')),'B, back on its tab, picks up A\'s newer solve');
await b.close();console.log(fails?`sync: ${fails} failed`:'sync: all ok');process.exit(fails?1:0);})();
