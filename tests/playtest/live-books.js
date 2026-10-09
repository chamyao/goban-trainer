// A player's view (no test mode; run.sh runs it with PLAYTEST_LIVE=1): three books are live, the Cao Cao arc (world 13) as
// Book 1, the Diaochan arc (world 12) as Book 2 and Lü Bu's fall (world 14) as Book 3; the old Books 1-3 are taken down. Only those three are on the book list,
// a fresh player's #/tk lands on 13, #/tk/1-3 and a link into the old Book 1 fall back to it, a save that last played 12
// keeps 12, and the test switch still opens a hidden book.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
let fails=0,checked=0;const check=(ok,what)=>{checked++;if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
const fresh=async(extra)=>{await p.goto(BASE+'#/');await p.waitForTimeout(500);await p.evaluate(extra=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);if(extra)for(const [k,v] of Object.entries(extra))localStorage.setItem(k,v);},extra||null);};
// what's showing: the world the game opened (its number and how it's titled), the hash, and the book list
const dlg=()=>p.evaluate(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Cancel'&&b.offsetParent));   // the username prompt
const at=async(hash)=>{await p.goto(BASE+hash);await p.reload();/* loaded at this route, as a player opening the link */for(let i=0;i<60;i++){await p.waitForTimeout(250);const g=p.locator('.tk-scroll-go');if(await g.count()&&await g.first().isVisible())await g.first().click({timeout:1000}).catch(()=>{});/* a fresh book's opening scroll, tapped through */if(await p.evaluate(()=>!!(window.__w&&window.__w.w)))break;}await p.waitForTimeout(500);
  return p.evaluate(()=>({n:window.__w&&window.__w.w&&window.__w.w.n,hash:location.hash,test:localStorage.getItem('tk-test'),
    books:[...document.querySelectorAll('.tk-world')].map(a=>a.textContent.trim()),sub:(document.querySelector('.sub')||{}).textContent||''}));};
await fresh();
let s=await at('#/tk');
check(s.test!=='1','not in test mode');
check(!(await dlg()),'a new player opening #/tk is not stopped by the username prompt');
await fresh();await p.goto(BASE+'#/');await p.reload();await p.waitForTimeout(1500);check(await dlg(),'a new player opening the library (#/) is asked for a username');
check(s.n===13,`a fresh player's #/tk opens the Cao Cao book (world ${s.n}, ${s.hash})`);
check(s.books.length===4&&/Silk Pouches|锦囊妙计/.test(s.books[3])&&/^4\b/.test(s.books[3])&&/Cao Cao|曹操/.test(s.books[0])&&/^1\b/.test(s.books[0])&&/Diaochan|貂蝉/.test(s.books[1])&&/^2\b/.test(s.books[1])&&/White Gate|白门楼/.test(s.books[2])&&/^3\b/.test(s.books[2]),`the book list has the four, Cao Cao as Book 1, Diaochan as Book 2, White Gate Tower as Book 3, Three Silk Pouches as Book 4 (${JSON.stringify(s.books)})`);
check(/Book 1\b/.test(s.sub)&&!/draft|草稿/i.test(s.sub),`its title line says Book 1 and not draft ("${s.sub.slice(0,80)}")`);
for(const h of ['#/tk/1','#/tk/2','#/tk/3','#/tk/1/1-n1']){await fresh();s=await at(h);check(s.n===13&&s.hash==='#/tk/13',`${h} (a book taken down) falls back to the Cao Cao book, the address rewritten to it (world ${s.n}, now ${s.hash})`);}
await fresh();s=await at('#/tk/12');check(s.n===12&&s.hash==='#/tk/12',`#/tk/12 opens the Diaochan book (world ${s.n}, ${s.hash})`);
await fresh();s=await at('#/tk/14');check(s.n===14&&s.hash==='#/tk/14',`#/tk/14 opens the White Gate Tower book (world ${s.n}, ${s.hash})`);
// returning players
await fresh({'tk-book':'12'});s=await at('#/tk');check(s.n===12,`a save that last played the Diaochan book (tk-book 12): #/tk still opens it (world ${s.n})`);
await fresh({'tk-book':'1'});s=await at('#/tk');check(s.n===13,`a save that last played the old Book 1: #/tk opens the Cao Cao book (world ${s.n})`);
// and the test switch still opens a hidden book (the old Book 1, world 1)
await fresh();let wn=null;
wn=(await at('?test=1#/tk/1').catch(()=>({}))).n;
check(wn===1,`with ?test=1, the old Book 1 (world 1) still opens (world ${wn})`);
console.log(`live-books: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
