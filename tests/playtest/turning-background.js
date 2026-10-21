// Turning points' reading goes on after its page is left (the user: "it should load and cache even while I leave
// the book"), a page's own engine call goes ahead of it (app.js Engine.schedule: one call at a time, the page's
// first), and the feed deals the biggest unsolved first (the user: "favor the big ones over the 50% ones").
// OGS mocked as in turning.js; 20 visits a position.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
const GAMES=require('./turning-games.json');
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const list=GAMES.map((g,i)=>({id:g.id,ended:`2026-10-1${i}T12:00:00Z`,players:{black:{id:7,username:'me'},white:{id:8,username:'o'}},black_lost:g.lost,white_lost:!g.lost}));
await p.route('https://online-go.com/**',r=>{const u=r.request().url();
  if(/\/players\/7\/games/.test(u))return r.fulfill({json:{results:list,next:null}});
  const m=/\/games\/(\d+)\/sgf/.exec(u);if(m)return r.fulfill({body:GAMES.find(g=>g.id===+m[1]).sgf});return r.fulfill({status:404,body:''});});
await p.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s',1);localStorage.setItem('goban.turning',JSON.stringify({v:3,user:'me',uid:7,scanned:{},items:[],next:null,played:{}}));}});
await p.goto(URL+'#/');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;Turning.VISITS=20;});
await p.evaluate(()=>location.hash='#/turning');
await p.waitForFunction(()=>Turning.scanning&&Engine._running,null,{timeout:600000});
await p.evaluate(()=>location.hash='#/');await p.waitForSelector('.book-turning');
const n0=await p.evaluate(()=>Object.keys(Turning.state().scanned).length);
// a page's own call while the reading runs: it doesn't wait for the reading
const t=await p.evaluate(async()=>{const g=Array.from({length:19},()=>new Array(19).fill(null));const t0=performance.now();
  await Engine.analyze({board:g,currentPlayer:'black',moveHistory:[],komi:6.5,visits:20,ownershipMode:'none',topK:3});return performance.now()-t0;});
check(t<15000,`a page's own search runs ahead of the reading (${Math.round(t)} ms)`);
await p.waitForFunction(n=>Object.keys(Turning.state().scanned).length>n+1,n0,{timeout:1200000}).catch(()=>{});
const s=await p.evaluate(()=>({read:Object.keys(Turning.state().scanned).length,items:Turning.state().items.length,hash:location.hash}));
check(s.hash==='#/'&&s.read>n0,`with the page left, games go on being read (${n0} → ${s.read} read, ${s.items} found)`);
// the order: the biggest unsolved first, solved last
const order=await p.evaluate(()=>{const st=Turning.state();st.items.filter(x=>x.kind==='turn').slice(-1).forEach(x=>x.fixed=true);Turning.save(st);
  return Turning.pending(Turning.state(),'turn').map(x=>({size:Turning.size(x),fixed:!!x.fixed}));});
const uns=order.filter(x=>!x.fixed).map(x=>x.size), firstSolved=order.findIndex(x=>x.fixed);
check(uns.every((v,i)=>!i||uns[i-1]>=v)&&(firstSolved<0||firstSolved===uns.length),`the biggest unsolved come first, the solved last (${order.map(x=>x.size+(x.fixed?'✓':'')).join(', ')})`);
await p.evaluate(()=>location.hash='#/turning');
await p.waitForSelector('.player svg',{timeout:600000});
const first=await p.evaluate(()=>Turning.size(window.__turning.item));
check(!uns.length||first===Math.max(...uns),`back on the page, the biggest unsolved is dealt (${first})`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
