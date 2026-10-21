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
const top=await p.evaluate(async()=>{const t=window.__turning,g=gameFromSgf(t.item.sgf),a=await Turning.search(g,t.pos.k,200);return [a.moves[0].x,a.moves[0].y];});
await p.click('text=Try again');
await p.evaluate(([c,r])=>window.__turning.play(c,r),top);
await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
const st=await p.textContent('#status');
check(/KataGo's top choice/.test(st)&&await p.evaluate(()=>document.getElementById('status').className)==='ok',`KataGo's top move gets the credit: "${st}"`);
const solvedMarks=await p.evaluate(()=>[...document.querySelectorAll('.turn-mark')].map(e=>e.getAttribute('fill')));
check(solvedMarks.length===1&&/176,65,62/.test(solvedMarks[0])||solvedMarks.length===2&&solvedMarks.some(f=>/176,65,62/.test(f)),`once solved, the game move is marked in red (${solvedMarks.length} marks)`);
s=await S();const solved=s.items.find(x=>x.gid===it.gid&&x.kind==='turn');
check(solved.fixed&&!solved.done,'solved: marked solved at once, without pressing Next (and it can come back as review)');
await p.click('text=Show answer');
check(await p.evaluate(()=>document.querySelectorAll('.turn-mark').length)===3,'Show answer marks KataGo\'s move, the game move and this try');
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
    // reviewing the game on this page
    await p.click('text=Review game');await p.waitForTimeout(300);
    const rvw=await p.evaluate(()=>({vis:getComputedStyle(document.querySelector('.turn-review')).display!=='none',t:document.querySelector('.turn-review .meta-title').textContent,
      sub:document.querySelector('.turn-review .meta-sub').textContent,marks:document.querySelectorAll('.turn-mark').length,ctl:[...document.querySelectorAll('aside .panel')].filter(e=>getComputedStyle(e).display!=='none').length}));
    check(rvw.vis&&/this problem/.test(rvw.t)&&/win rate \d+% → \d+%/.test(rvw.sub)&&rvw.marks>=1,`Review game opens on the problem's move: "${rvw.t}" / "${rvw.sub}" (${rvw.marks} marks)`);
    await p.click('.turn-review button:has-text("▶|")');
    check(/End of the game/.test(await p.textContent('.turn-review .meta-title')),'▶| goes to the end');
    await p.click('.turn-review button:has-text("◀ Your mistake")');
    const back=await p.textContent('.turn-review .meta-title');
    check(/Move \d+: you/.test(back),`◀ Your mistake jumps to one of the player's mistakes: "${back}"`);
    await p.click('text=Back to the problem');
    check(await p.evaluate(()=>getComputedStyle(document.querySelector('.turn-review')).display==='none'&&!!document.querySelector('aside button.primary')),'Back to the problem');
    await p.click('text=Review game');await p.click('text=Open in the Review tab');await p.waitForTimeout(800);
    const rv=await p.evaluate(()=>({h:location.hash,k:Review.node&&Review.node.main,an:Review.analyses.filter(Boolean).length,n:Review.game.n}));
    check(rv.h==='#/review'&&rv.k===k&&rv.an===rv.n+1,`Open in Review lands on the move (${rv.k}), already analyzed (${rv.an} of ${rv.n+1} positions)`);
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
