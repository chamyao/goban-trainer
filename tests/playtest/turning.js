// Turning points (#/turning, app.js Turning/viewTurning): the user's lost OGS games, each one's decisive move found
// by KataGo, fed one after another to play again. OGS is mocked with three lost games and one won
// (turning-games.json, from real 15–5k OGS games). Checks: the Library card opens it; a won game is skipped; a
// turning point comes up at the player's move, from a position the player was winning; a move gets judged; Show
// answer marks the moves; Next moves on and the played one is kept as done; Open in Review lands on the move.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
const GAMES=require('./turning-games.json');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
const won=GAMES.filter(g=>!g.lost).map(g=>g.id);
const list=[...GAMES.filter(g=>!g.lost),...GAMES.filter(g=>g.lost)].map((g,i)=>({id:g.id,ended:`2026-10-${10+i}T12:00:00Z`,annulled:false,outcome:'Resignation',
  players:{black:{id:7,username:'me'},white:{id:8,username:'opp'+i}},black_lost:g.lost,white_lost:!g.lost}));
const sgfReqs=[];
await p.route('https://online-go.com/**',r=>{const u=r.request().url();
  if(u.includes('/players?username='))return r.fulfill({json:{results:[{id:7,username:'me'}]}});
  if(/\/players\/7\/games/.test(u))return r.fulfill({json:{results:list,next:null}});
  const m=/\/games\/(\d+)\/sgf/.exec(u);if(m){sgfReqs.push(+m[1]);return r.fulfill({body:GAMES.find(g=>g.id===+m[1]).sgf,contentType:'text/plain'});}
  return r.fulfill({status:404,body:''});});
await p.goto(URL+'#/');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.book-turning',{timeout:20000});
await p.click('.book-turning');
await p.fill('.sgf-loader input','me');await p.click('.sgf-loader button.primary');
const t0=Date.now();
await p.waitForSelector('.player svg',{timeout:600000});
console.log(`  first turning point after ${Math.round((Date.now()-t0)/1000)} s`);
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('goban.turning')));
check(won.every(id=>s.scanned[id]===0)&&!sgfReqs.some(id=>won.includes(id)),'the won game is skipped without downloading it');
const it=s.items.find(x=>!x.done);
const g=await p.evaluate(sgf=>{const g=gameFromSgf(sgf);return {n:g.n};},it.sgf);
check(it.me===1&&it.k%2===0&&it.k<g.n,`the turning point is one of the player's own moves (Black, move ${it.k+1} of ${g.n})`);
check(it.before>=0.5&&it.loss>=10&&it.after<it.before,`from a position the player was winning (${Math.round(it.before*100)}% → ${Math.round(it.after*100)}%, ${Math.round(it.loss)} points given up)`);
check((await p.textContent('#crumbs')).includes('Turning points')&&(await p.textContent('aside')).includes(`move ${it.k+1}`),'the page names the game and the move');
const stones=()=>p.evaluate(()=>[...document.querySelectorAll('.player svg circle.bt-stone, .player svg image.bt-stone')].length);
const n0=await stones();
// play the game move again: it's judged as the game move
const gm=await p.evaluate(([sgf,k])=>{const m=gameFromSgf(sgf).moves[k];return [m.c,m.r];},[it.sgf,it.k]);
await p.evaluate(([c,r])=>window.__turning.play(c,r),gm);
await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
check(await stones()===n0+1,'the move is on the board');
check(/the move you played in the game/.test(await p.textContent('#status')),`the game move is called the game move: "${await p.textContent('#status')}"`);
// try again with KataGo's own move: turned around
await p.click('text=Try again');
await p.evaluate(([c,r])=>window.__turning.play(c,r),it.best);
await p.waitForFunction(()=>!/reading/.test(document.getElementById('status').textContent),null,{timeout:120000});
const st=await p.textContent('#status');
check(/Turned it around/.test(st)&&await p.evaluate(()=>document.getElementById('status').className)==='ok',`KataGo's move turns it around: "${st}"`);
await p.click('text=Show answer');
check(await p.evaluate(()=>document.querySelectorAll('.turn-mark').length)===3,'Show answer marks KataGo\'s move, the game move and this try');
await p.click('text=Next →');await p.waitForTimeout(500);
const s2=await p.evaluate(()=>JSON.parse(localStorage.getItem('goban.turning')));
const done=s2.items.find(x=>x.gid===it.gid);
check(done.done&&done.fixed&&!done.sgf,'Next keeps it as played (and fixed), without its SGF');
await p.waitForSelector('.player svg',{timeout:600000}).catch(()=>{});
const more=(await p.evaluate(()=>JSON.parse(localStorage.getItem('goban.turning')))).items.find(x=>!x.done);
if(more){
  check((await p.textContent('aside')).includes(`move ${more.k+1}`),'the next turning point is dealt');
  await p.click('text=Open in Review');await p.waitForTimeout(800);
  const rv=await p.evaluate(()=>({h:location.hash,k:Review.node&&Review.node.main}));
  check(rv.h==='#/review'&&rv.k===more.k,`Open in Review lands on the move (${rv.k})`);}
else console.log('  (only one of the lost games had a turning point)');
const s3=await p.evaluate(()=>JSON.parse(localStorage.getItem('goban.turning')));
console.log(`  turning points found: ${s3.items.length} of ${GAMES.filter(g=>g.lost).length} lost games so far`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
