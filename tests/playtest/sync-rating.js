// The rating across devices, against a mocked Apps Script (the user: "I was 6k, didn't do any problems, now it shows
// 9k+; can't the spreadsheet be the source of truth"). The row goes up gzipped (a Sheet cell caps at 50,000 characters,
// and the user's row had outgrown it: every save skipped); the latest rated answer wins, not the copy with more boards;
// (the first save read the old plain row) a fresh browser takes the sheet's rating; a row that can't be read is never written over; old Stream slots are trimmed.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const zlib=require('zlib');
(async()=>{const b=await chromium.launch();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
let row=null,posts=0,down=false;const plain=()=>row&&row.gz?JSON.parse(zlib.gunzipSync(Buffer.from(row.gz,'base64'))):row;
const dev=async(seed)=>{const ctx=await b.newContext();const p=await ctx.newPage();p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
 await p.route('https://script.google.com/**',async r=>{const req=r.request();
  if(down)return r.fulfill({status:500,body:'down'});
  if(req.method()==='POST'){const j=JSON.parse(req.postData());if(j.kind==='progress'){row=j.data;posts++;}return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:row||{}})});});
 await p.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.clear();localStorage.setItem('gt-username','ratingtest');if(s)localStorage.setItem('gt-progress',JSON.stringify(s));}},seed||null);
 await p.goto('http://localhost:8765/#/');await p.waitForTimeout(1500);return p;};
const elo=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('gt-progress')||'{}').tkElo||null);
// the user's row as it was: n 303, a pile of dealt Stream boards, ~48k (an old plain row)
const big={r:1239,n:303,stream:41,used:[],slots:{}};for(let i=0;i<500;i++)big.used.push(`specialized-training-in-tsumego-2:${10000+i}`);for(let i=0;i<=41;i++)big.slots[`stream~${i}`]=['weiqi-rapid-drill-800-part-3',String(3000+i)];
row={progress:{tkElo:big},favorites:[],tkLocal:{},stamp:1};
// device A: played on to 6K with fewer boards counted (a diverged copy) and a stamped answer
const A=await dev({tkElo:{r:1480,n:290,at:Date.now()-60000,used:[],slots:{}}});
await A.evaluate(()=>Sync.saveProgress());
const a=await elo(A),rp=plain();
check(a.r===1480&&rp.progress.tkElo.r===1480,`the copy with the latest rated answer wins over one with more boards (A ${a.r}, sheet ${rp.progress.tkElo.r})`);
check(row.gz&&JSON.stringify(row).length<JSON.stringify(rp).length/2,`the row goes up gzipped (${JSON.stringify(row).length} chars for ${JSON.stringify(rp).length})`);
check(rp.progress.tkElo.used.length<=300&&Object.keys(rp.progress.tkElo.slots).filter(k=>k.startsWith('stream~')).length===1,`dealt boards trimmed: ${rp.progress.tkElo.used.length} used, stream slots ${Object.keys(rp.progress.tkElo.slots).filter(k=>k.startsWith('stream~'))}`);
// device B: a fresh browser takes the sheet's rating, and saving doesn't set it back
const B=await dev(null);await B.waitForTimeout(500);
await B.evaluate(()=>TKElo.state());await B.evaluate(()=>Sync.saveProgress());
check((await elo(B)).r===1480&&plain().progress.tkElo.r===1480,`a fresh browser shows the sheet's rating and keeps it (${(await elo(B)).r})`);
// B answers a Stream-rated problem: now B's is the latest, and A takes it on its next pull
const d=await B.evaluate(()=>{TK.mode='adaptive';const w={rated:[['x','1',18]]};return TKElo.result(w,{},['x','1'],true);});
await B.evaluate(()=>Sync.saveProgress());
await A.evaluate(()=>Sync.pullAndMerge());const a2=await elo(A);
check(d>0&&a2.r===1480+d&&a2.log&&a2.log.length>=1,`a newer answer elsewhere comes over (${1480}+${d} → ${a2.r}, log ${JSON.stringify(a2.log)})`);
// a row that can't be read: no save goes up
const n0=posts;down=true;await A.evaluate(()=>Sync.saveProgress());down=false;
check(posts===n0,'a row that cannot be read is not written over');
await b.close();console.log(fails?`sync-rating: ${fails} failed`:'sync-rating: all ok');process.exit(fails?1:0);})();
