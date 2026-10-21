// Turning points and Key moves (#/turning, #/keymoves; app.js Turning/viewTurning): the player's OGS games read by
// KataGo, a search of every position, and fed one at a time to play again. OGS is mocked with three lost games and one
// won (turning-games.json, from real 15–5k OGS games); the searches run at 20 visits here to keep it short.
// Checks: the Library cards; a turning point is the player's own move, in a lost game, from a lead; the tally and the
// reading progress show; the game move is called the game move; KataGo's top move counts and a solved position is done
// at once (a reload doesn't bring it back); Next on an unsolved one puts it behind the unseen; what was played before
// a reread (an older version's state) stays played; Open in Review lands on the move, already analyzed.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
const GAMES=require('./turning-games.json');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const lostIds=GAMES.filter(g=>g.lost).map(g=>g.id);
const list=[...GAMES.filter(g=>!g.lost),...GAMES.filter(g=>g.lost)].map((g,i)=>({id:g.id,ended:`2026-10-${19-i}T12:00:00Z`,annulled:false,outcome:'Resignation',
  players:{black:{id:7,username:'me',ranking:20},white:{id:8,username:'opp'+i,ranking:20}},black_lost:g.lost,white_lost:!g.lost}));
await p.route('https://online-go.com/**',r=>{const u=r.request().url();
  if(u.includes('/players?username='))return r.fulfill({json:{results:[{id:7,username:'me'}]}});
  if(/\/players\/7\/games/.test(u))return r.fulfill({json:{results:list,next:null}});
  const m=/\/games\/(\d+)\/sgf/.exec(u);if(m)return r.fulfill({body:GAMES.find(g=>g.id===+m[1]).sgf,contentType:'text/plain'});
  return r.fulfill({status:404,body:''});});
// an older version's state: the third lost game's turning point already solved
await p.addInitScript(id=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');
  localStorage.setItem('goban.turning',JSON.stringify({v:2,user:'me',uid:7,scanned:{},next:null,items:[{kind:'turn',gid:id,me:1,k:5,done:true,fixed:true,tries:1}]}));}
  window.__fast=1;},lostIds[2]);
const fast=()=>p.evaluate(()=>{Turning.VISITS=20;});
await p.goto(URL+'#/');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.book-turning',{timeout:20000});
check(!!(await p.$('.book-keymoves')),'a Key moves card sits beside Turning points');
await fast();
await p.click('.book-turning');
// the reading is unseen: no progress, no game names, no busy engine chip
const seen=await p.waitForFunction(()=>Turning.scanning,null,{timeout:120000}).then(()=>p.evaluate(()=>({scan:document.querySelector('.turning-scan').textContent,chip:document.getElementById('engineChipText').textContent,bar:!!document.querySelector('.turning-bar')})));
check(!/move \d+ of|Reading/.test(seen.scan)&&!seen.bar&&!/thinking/.test(seen.chip),`the reading doesn't show: "${seen.scan}", chip "${seen.chip}"`);
await p.waitForSelector('.player svg',{timeout:900000});
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('goban.turning')));
let s=await S();
const it=Turning_pending(s)[0];
function Turning_pending(s){return s.items.filter(x=>!x.fixed&&x.kind==='turn');}
check(it&&it.me===1&&it.k%2===0&&lostIds.includes(it.gid),`the turning point is the player's own move in a lost game (move ${it&&it.k+1})`);
check(it.before>=0.4&&it.loss>=4&&it.real>0,`a real drop: ${Math.round(it.before*100)}% → ${Math.round(it.after*100)}%, ${Math.round(it.loss)} engine points, ${it.real} real`);
check(/^0 solved · \d+ unsolved$/.test(await p.textContent('.turning-tally')),`the tally, solving only: "${await p.textContent('.turning-tally')}"`);
const gm=await p.evaluate(([gid,k])=>{const m=gameFromSgf(Turning.view(gid).sgf).moves[k];return [m.c,m.r];},[it.gid,it.k]);
await p.evaluate(([c,r])=>window.__turning.play(c,r),gm);
await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
check(/the move you played in the game/.test(await p.textContent('#status')),`the game move is called the game move: "${await p.textContent('#status')}"`);
// KataGo's top move, from a fresh search of the position
const top=await p.evaluate(async()=>{const a=await window.__turning.deep;return [a.moves[0].x,a.moves[0].y];});
await p.click('text=Try again');
await p.evaluate(([c,r])=>window.__turning.play(c,r),top);
await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
const st=await p.textContent('#status');
check(await p.evaluate(()=>Object.keys((loadProgress().ev||{earn:{}}).earn.halloween||{}).every(k=>!k.startsWith('tp:'))),'solved on the second try: no candy');
check(/KataGo's top choice/.test(st)&&await p.evaluate(()=>document.getElementById('status').className)==='ok',`KataGo's top move gets the credit: "${st}"`);
// solved: the board becomes the review in place, on this position with the marks, the try a branch
const histBefore=await p.evaluate(()=>Review.loadHistory().length);
await p.waitForSelector('.review .board-card svg',{timeout:10000});
const rv0=await p.evaluate(k=>({at:Review.node===Review.mainNodes[k],marks:[...document.querySelectorAll('.review .turn-mark')].map(e=>e.getAttribute('fill')),kids:Review.mainNodes[k].children.length,
  an:Review.analyses.filter(Boolean).length,n:Review.game.n,eph:Review.ephemeral,chart:!!document.querySelector('.review .chart-wrap svg'),hash:location.hash}),it.k);
check(rv0.hash==='#/turning'&&rv0.at&&rv0.eph&&rv0.chart&&rv0.an===rv0.n+1,`solved: the board becomes the game's review in place, on this position, analyzed (${rv0.an} of ${rv0.n+1})`);
check(rv0.marks.length===3&&rv0.marks.some(f=>/34,160,90/.test(f))&&rv0.marks.some(f=>/176,65,62/.test(f)),`the first frame marks KataGo's move, the game move and the try (${rv0.marks.length})`);
check(rv0.kids===2,'the try is kept as a branch');
const agree=await p.evaluate(k=>{const d=Review.details.get(`${Review.curTurn()}:${Review.node.key}`)||Review.details.get(`${Review.toMoveAt(k)}:${Review.mainNodes[k].key}`);const t=window.__turning;
  return {top:d&&d.moves[0]&&[d.moves[0].x,d.moves[0].y],best:t.pos.best};},it.k);
check(agree.top&&agree.top[0]===agree.best[0]&&agree.top[1]===agree.best[1],`the answer is KataGo's top move in the review (${agree.best} / ${agree.top})`);
await p.evaluate(()=>Review.forward());
check(await p.evaluate(k=>Review.node===Review.mainNodes[k+1]&&!document.querySelector('.review .turn-mark'),it.k),'▶ steps on through the game (the marks stay on the first frame)');
s=await S();const solved=s.items.find(x=>x.gid===it.gid&&x.kind==='turn');
check(solved.fixed&&!solved.done,'solved: marked solved at once, without pressing Next (and it can come back as review)');
await p.reload();await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});await fast();
await p.waitForSelector('.player svg, .turning-scan',{timeout:60000});await p.waitForTimeout(500);
const shown=await p.evaluate(()=>window.__turning&&document.querySelector('.player svg')?window.__turning.item:null);
const unsolvedLeft=Turning_pending(await S()).length;
check(unsolvedLeft?shown&&!shown.fixed:(!shown||shown.gid===it.gid),`after a reload an unsolved one comes first (${unsolvedLeft} unsolved; shows ${shown?shown.gid+(shown.fixed?' (solved)':''):'the reading page'})`);
// the older version's solved game: read again, but still solved
await p.waitForFunction(id=>{const s=JSON.parse(localStorage.getItem('goban.turning'));return s.scanned[id]!==undefined;},lostIds[2],{timeout:900000});
s=await S();const old=s.items.find(x=>x.gid===lostIds[2]&&x.kind==='turn');
check(!old||old.fixed,`a game solved before the reread stays solved (${old?'found again, solved':'no turning point this time'})`);
check(s.v===4&&!s.items.some(x=>x.k===5&&x.gid===lostIds[2]),'the old state is read again under the new version');
// Next on an unsolved one: behind the unseen ones
await p.waitForSelector('.player svg',{timeout:900000});
s=await S();const waiting=Turning_pending(s);
if(waiting.length>=1){
  const a=await p.evaluate(()=>window.__turning.item.gid);
  await p.click('text=Next →');await p.waitForTimeout(600);
  s=await S();const x=s.items.find(y=>y.gid===a&&y.kind==='turn');
  const order=await p.evaluate(()=>Turning.pending(Turning.state(),'turn').map(y=>[y.gid,!!y.fixed]));
  const uns=order.filter(y=>!y[1]).map(y=>y[0]);
  check(x.seen&&(x.fixed?order[order.length-1][0]===a:uns[uns.length-1]===a),`Next puts it at the back of its group, unsolved before solved (${order.map(y=>y[0]+(y[1]?'✓':'')).join(', ')})`);
  if(await p.$('.player svg')){
    const k=await p.evaluate(()=>window.__turning.pos.k);
    // right on the first move: candy
    const top2=await p.evaluate(async()=>{const r=await window.__turning.deep;return [r.moves[0].x,r.moves[0].y];});
    await p.evaluate(([c,r])=>window.__turning.play(c,r),top2);
    await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
    const paid=await p.evaluate(gid=>Object.entries((loadProgress().ev||{earn:{}}).earn.halloween||{}).filter(([k])=>k.startsWith('tp:'+gid)).map(([,v])=>v),await p.evaluate(()=>window.__turning.item.gid));
    check(paid.length===1&&paid[0]===3,`solved on the first try: 3 candy (${paid})`);
    // solved: the review, KataGo's moves on, branches
    await p.waitForSelector('.review .board-card svg',{timeout:10000});
    check(await p.evaluate(k=>Review.node===Review.mainNodes[k]&&Review.showHints,k),'the review opens on the position, KataGo\'s moves on');
    // a branch: a move of one's own on an empty point
    const br=await p.evaluate(()=>{const g=Review.curGrid();for(let r=0;r<19;r++)for(let c=0;c<19;c++)if(g[r][c]===0){Review.click(c,r);return {main:Review.node.main,move:Review.node.move};}});
    check(br&&br.main===undefined&&br.move,'a move on the board makes a branch');
    await p.waitForFunction(()=>Review.details.size>0,null,{timeout:120000}).catch(()=>{});
    check(await p.evaluate(()=>Review.details.size>0),'KataGo reads the branch (its moves on the board)');
    await p.click('.review button:has-text("Try again")');await p.waitForTimeout(300);
    const after=await p.evaluate(()=>({eph:Review.ephemeral,game:!!Review.game,hist:Review.loadHistory().length,prob:!!document.querySelector('.player svg')&&!!window.__turning}));
    check(!after.eph&&after.prob&&after.hist===histBefore,`Try again: back to the problem; the Review tab's list is as it was (${after.hist})`);
  }
}
s=await S();
// new lines (as the noise test will set): the positions are found again from the kept reads, no search
const re=await p.evaluate(()=>{let calls=0;const o=Engine.analyze.bind(Engine);Engine.analyze=(...x)=>{calls++;return o(...x);};
  const n10=Turning.state().items.length;Turning.NOISE_PTS=30;const st=Turning.state(),n30=st.items.length;Turning.NOISE_PTS=4;const back=Turning.state().items.length;
  Engine.analyze=o;return {n10,n30,back,calls,th:st.th};});
check(re.th.startsWith('30')&&re.n30<=re.n10&&re.back===re.n10&&re.calls===0,`a new noise line finds the positions again from the kept reads, without a search (${re.n10} at 4 points, ${re.n30} at 30)`);
console.log(`  turning points: ${s.items.filter(x=>x.kind==='turn').length}, key moves: ${s.items.filter(x=>x.kind==='key').length}, of ${Object.keys(s.scanned).length} games read`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
