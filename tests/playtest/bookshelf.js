// The bookshelf pilot (app.js viewShelf, #/shelf): every book of the Library stands on it as a spine (the problem
// books, the story campaigns, the Stream, the game records), the Library links to it and back, and a spine opens its book.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.shelf-try');await p.click('.shelf-try');await p.waitForSelector('.spine');
const n=await p.evaluate(async()=>({spines:document.querySelectorAll('.spine').length,books:(await getIndex()).length,
  tomes:document.querySelectorAll('.spine.tome').length,glow:document.querySelectorAll('.spine.glow').length,records:document.querySelectorAll('.spine.record').length}));
check(n.spines===n.books+n.tomes+n.glow+n.records&&n.tomes>=3&&n.glow===1&&n.records===3,`every book stands on the shelf: ${n.books} problem books, ${n.tomes} stories, the Stream, ${n.records} game records`);
// favourites: a star on the spine, a Favorites shelf, the same list as the classic Library's
check(!(await p.evaluate(()=>[...document.querySelectorAll('.shelf-plaque')].some(x=>/Favorites/.test(x.textContent)))),'no Favorites shelf while none is starred');
const first=p.locator('.spine .spine-star').first();await first.hover({force:true});await first.click({force:true});await p.waitForTimeout(500);
const fav=await p.evaluate(()=>({hash:location.hash,shelf:[...document.querySelectorAll('.shelf')].find(x=>/Favorites/.test(x.querySelector('.shelf-plaque').textContent)),
  saved:JSON.parse(localStorage.getItem('gt-favorites')||'[]')})).then(async f=>f);
const favN=await p.evaluate(()=>{const s=[...document.querySelectorAll('.shelf')].find(x=>/Favorites/.test(x.querySelector('.shelf-plaque').textContent));return s?s.querySelectorAll('.spine').length:0;});
check(fav.hash==='#/shelf'&&favN===1&&fav.saved.length===1,`the star favourites a book there on the shelf (a Favorites shelf of ${favN}; saved ${JSON.stringify(fav.saved)}), without opening it`);
await p.goto('http://localhost:8765/#/');await p.waitForSelector('.cat-title');
check((await p.locator('.cat-title').first().textContent())==='Favorites','the classic Library shows the same favourite');
await p.goto('http://localhost:8765/#/shelf');await p.waitForSelector('.spine-star.on');
await p.locator('.spine-star.on').first().click({force:true});await p.waitForTimeout(500);
check(!(await p.evaluate(()=>[...document.querySelectorAll('.shelf-plaque')].some(x=>/Favorites/.test(x.textContent))))&&(await p.evaluate(()=>JSON.parse(localStorage.getItem('gt-favorites')||'[]').length))===0,'and unstarring takes it off again');
await p.locator('.spine.record').first().click();await p.waitForSelector('.games-row');
check((await p.evaluate(()=>location.hash))==='#/games/go-seigen','a spine opens its book (Go Seigen)');
await p.goto('http://localhost:8765/#/shelf');await p.waitForSelector('.shelf-back');await p.click('.shelf-back');
check((await p.evaluate(()=>location.hash))==='#/','and the classic view is a click away');
console.log(fails?`bookshelf: ${fails} failed`:'bookshelf: all ok');await b.close();process.exit(fails?1:0);
})();
