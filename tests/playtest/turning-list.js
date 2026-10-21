// Turning points as a list (#/turning/all, app.js viewTurningList; the user: "a view of turning points, non-stream"):
// every one found, newest game first, solved marked; a row opens its own position (#/turning/<game id>).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.route('https://online-go.com/**',r=>r.fulfill({json:{results:[],next:null}}));
const sgf='(;GM[1]SZ[19]KM[6.5]'+Array.from({length:40},(_,i)=>`;${i%2?'W':'B'}[${String.fromCharCode(97+i%19)}${String.fromCharCode(97+Math.floor(i/19)*3)}]`).join('')+')';
await p.addInitScript(sgf=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s',1);
  const reads=Array.from({length:41},()=>[0.5,3,3,0.6,0.4]);
  const games={},items=[];
  [[101,'2026-10-10','Alpha',true],[102,'2026-10-12','Beta',false],[103,'2026-10-11','Gamma',false]].forEach(([gid,date,opp,fixed],i)=>{
    games[gid]={sgf,me:1,lost:true,gap:0,opp,date,reads};
    items.push({kind:'turn',gid,me:1,opp,date,won:false,k:20+2*i,before:0.7,after:0.3,bestW:0.72,best:[3,3],loss:40,real:20,fixed});});
  localStorage.setItem('goban.turning',JSON.stringify({v:4,user:'me',uid:7,scanned:{101:1,102:1,103:1},games,items,next:null,played:{},th:'4:closing:open0.4'}));},sgf);
await p.goto('http://localhost:8765/#/turning/all');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.turning-row');
const rows=await p.$$eval('.turning-row .t',e=>e.map(x=>x.textContent));
check(rows.length===3&&/Beta/.test(rows[0])&&/Gamma/.test(rows[1])&&/Alpha/.test(rows[2]),`every turning point, the newest game first: ${rows.join(' / ')}`);
check(rows[2].startsWith('✓'),'a solved one is marked');
check(/1 of 3 solved/.test(await p.textContent('.cat-title')),'the count');
await p.click('.turning-row:has-text("Gamma")');await p.waitForSelector('.player svg');
check(await p.evaluate(()=>location.hash==='#/turning/103'&&window.__turning.item.gid===103),'a row opens its own position');
check(await p.evaluate(()=>[...document.querySelectorAll('#crumbs a')].some(a=>a.textContent==='All')),'the way back to the list');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
