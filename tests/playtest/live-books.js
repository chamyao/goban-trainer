// A player's view (no test mode; run.sh runs it with PLAYTEST_LIVE=1): the Diaochan book is the one live book,
// shown as Book 2; Books 1-3 are taken down. Only it is on the book list, #/tk lands on it, #/tk/1 and a direct
// link into Book 1 fall back to it, and so does a player whose save last played Book 1.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
const fresh=async(extra)=>{await p.goto(BASE+'#/');await p.waitForTimeout(500);await p.evaluate(extra=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);if(extra)for(const [k,v] of Object.entries(extra))localStorage.setItem(k,v);},extra||null);};
// what's showing: the world the game opened (its number and how it's titled), the hash, and the book list
const at=async(hash)=>{await p.goto(BASE+hash);for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!(window.__w&&window.__w.w)))break;}await p.waitForTimeout(500);
  return p.evaluate(()=>({n:window.__w&&window.__w.w&&window.__w.w.n,hash:location.hash,test:localStorage.getItem('tk-test'),
    books:[...document.querySelectorAll('.tk-world')].map(a=>a.textContent.trim()),sub:(document.querySelector('.sub')||{}).textContent||''}));};
await fresh();
let s=await at('#/tk');
check(s.test!=='1','not in test mode');
check(s.n===12,`#/tk opens the Diaochan book (world ${s.n}, ${s.hash})`);
check(s.books.length===1&&/Diaochan|貂蝉/.test(s.books[0])&&/^2\b/.test(s.books[0]),`the book list has only it, as Book 2 (${JSON.stringify(s.books)})`);
check(/Book 2\b/.test(s.sub)&&!/draft|草稿/i.test(s.sub),`its title line says Book 2 and not draft ("${s.sub.slice(0,80)}")`);
for(const h of ['#/tk/1','#/tk/2','#/tk/3','#/tk/1/1-n1']){await fresh();s=await at(h);check(s.n===12,`${h} falls back to the Diaochan book (world ${s.n}, now ${s.hash})`);}
// a returning player whose save last had Book 1 open
await fresh({'tk-book':'1'});s=await at('#/tk');check(s.n===12,`a save that last played Book 1: #/tk opens the Diaochan book (world ${s.n})`);
// and the test switch still opens a hidden book
await fresh();await p.goto(BASE+'?test=1#/tk/1');await p.reload();let sub='';
for(let i=0;i<40;i++){await p.waitForTimeout(250);sub=await p.evaluate(()=>(document.querySelector('.sub')||{}).textContent||'');if(/Book 1\b/.test(sub))break;}
check(/Book 1\b/.test(sub),`with ?test=1, Book 1 still opens ("${sub.slice(0,50)}")`);
console.log(`live-books: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
