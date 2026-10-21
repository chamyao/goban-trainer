// Turning points kept on the sheet (the user: "cache it to the user on the sheet, don't rely on browser cache"):
// the Apps Script is mocked with an in-memory sheet. One browser reads the games (a row per game, tp-<id>, and an
// index row) and solves one; a second browser with nothing stored, same site username, gets the OGS name, the
// turning points and the solve from the sheet, and reads no game again. The Review's own list leaves the rows out.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
const GAMES=require('./turning-games.json');
(async()=>{
const b=await chromium.launch();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
const sheet=new Map();   // id -> row data (kind review)
const list=GAMES.map((g,i)=>({id:g.id,ended:`2026-10-1${i}T12:00:00Z`,players:{black:{id:7,username:'me'},white:{id:8,username:'o'}},black_lost:g.lost,white_lost:!g.lost}));
const open=async()=>{
  const ctx=await b.newContext();const p=await ctx.newPage();p.sgfReqs=[];
  p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
  await p.route('https://online-go.com/**',r=>{const u=r.request().url();
    if(u.includes('/players?username='))return r.fulfill({json:{results:[{id:7,username:'me'}]}});
    if(/\/players\/7\/games/.test(u))return r.fulfill({json:{results:list,next:null}});
    const m=/\/games\/(\d+)\/sgf/.exec(u);if(m){p.sgfReqs.push(+m[1]);return r.fulfill({body:GAMES.find(g=>g.id===+m[1]).sgf});}
    return r.fulfill({status:404,body:''});});
  await p.route('https://script.google.com/**',r=>{const q=r.request();
    if(q.method()==='POST'){const body=JSON.parse(q.postData());if(body.kind==='review'){if(body.delete)sheet.delete(body.id);else sheet.set(body.id,body.data);}return r.fulfill({json:{ok:true}});}
    const kind=new globalThis.URL(q.url()).searchParams.get('kind');
    if(kind==='review')return r.fulfill({json:{data:{games:[...sheet.values()]}}});
    return r.fulfill({json:{data:{}}});});
  await p.addInitScript(()=>{localStorage.setItem('gt-username','sync-tester');});
  await p.goto(URL+'#/');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;Turning.VISITS=20;});
  return p;
};
// browser A: reads, solves one with KataGo's move
const a=await open();
await a.evaluate(()=>location.hash='#/turning');
await a.fill('.sgf-loader input','me');await a.click('.sgf-loader button.primary');
await a.waitForSelector('.player svg',{timeout:900000});
const it=await a.evaluate(()=>window.__turning.item);
const top=await a.evaluate(async()=>{const t=window.__turning,g=gameFromSgf(t.item.sgf),r=await Turning.search(g,t.pos.k,200);return [r.moves[0].x,r.moves[0].y];});
await a.evaluate(([c,r])=>window.__turning.play(c,r),top);
await a.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
await a.waitForTimeout(1500);
const idx=sheet.get('tp-index'),row=sheet.get(`tp-${it.gid}`);
check(idx&&idx.uid===7&&idx.user==='me'&&Object.keys(idx.scanned).length>=1,`the sheet has the index row (OGS name, ${idx?Object.keys(idx.scanned).length:0} games read)`);
check(row&&row.prog.some(x=>x.kind==='turn'&&x.fixed)&&row.game.sgf&&row.game.reads.length>100&&row.game.reads[10].length===5,`and the game's row, with the solve, the SGF and KataGo's reads of every position (${row&&row.game.reads.length})`);
const rowsAll=[...sheet.keys()].filter(k=>k.startsWith('tp-')&&k!=='tp-index');
const readIds=await a.evaluate(()=>Object.keys(Turning.state().games));
check(readIds.every(id=>sheet.has('tp-'+id)),`every game read has its row, found or not (${readIds.length} games, ${rowsAll.length} rows)`);
const readA=await a.evaluate(()=>Object.keys(Turning.state().scanned).map(Number));
const reviewList=await a.evaluate(async()=>{await Review.pullRemoteFallback();return Review.loadHistory().filter(g=>String(g.id).startsWith('tp-')).length;});
check(reviewList===0,'the Review\'s list leaves the rows out');
await a.context().close();
// browser B: nothing stored but the site username
const bp=await open();
await bp.evaluate(()=>location.hash='#/turning');
await bp.waitForSelector('.player svg, .turning-scan',{timeout:120000});await bp.waitForTimeout(1500);
const sB=await bp.evaluate(()=>Turning.state());
check(sB.uid===7&&sB.user==='me','a fresh browser gets the OGS name from the sheet');
const got=sB.items.find(x=>x.gid===it.gid&&x.kind==='turn');
check(Object.keys(sB.games).length>=readIds.length&&sB.games[it.gid]&&sB.games[it.gid].reads,'the reads come back from the sheet too');
check(got&&got.fixed,'and the solved turning point, still solved');
check(readA.every(id=>sB.scanned[id]!==undefined),'and the games read, so they aren\'t read again');
await bp.waitForTimeout(3000);
check(!bp.sgfReqs.some(id=>readA.includes(id)),`no game read on the first browser is downloaded again (${bp.sgfReqs.join(', ')||'none'})`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
