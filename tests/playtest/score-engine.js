// The score network (ScoreEngine: kata1-b15c192, float16, loaded on first use; the user: "add b15 for scoring"): it
// loads in the worker and reads a position's lead and ownership; Review's Judge shows the lead ("B+4.5") and the
// ownership; dead stones are the stones on points the other side owns; after two passes in an avatar game it marks
// them (stubbed here: the real network is checked above it) and the game can be accepted.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200));});
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.addInitScript(()=>{ if (localStorage.getItem('t')) return; localStorage.setItem('t','1');
  localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { lisu: 1 } } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(1500);
// 1. the network itself, on a late position of a kyu game (move 220, Black to play: native KataGo with this net in
// float32 reads Black +54.5 at one look)
const POS='.....X.X........XO.XXXXXXXOXXXXXXX..XXOXOXOXOO.XOXOOX.X..OOOOOXO.XXOOX.XXX.....OXOOXOOOXX........OXXXOX.OX.....X....OOXXXOOOX.X........OXX.XXOOOX..X.....OOO.XXOO.XOX.......OXOX.XXXO.OOXXX....XXXX.OOOO..OOXOX.....XOOOXXXO.OXXOX...XXXXOX...XO.OOOX...OXOXOX...XO..OX....O.OOOX..XOO..OXX....OO..OX.XO....OXX.......OX.XOO..O.OX.......OX.XXO....OXO......OOX..XO....O.';
const r1=await p.evaluate(async POS=>{const board=Array.from({length:19},(_,r)=>Array.from({length:19},(_,c)=>({X:'black',O:'white'})[POS[r*19+c]]||null));
  const a=await ScoreEngine.analyze({board,currentPlayer:'black',moveHistory:[],komi:7.5,rules:'chinese',visits:1,maxTimeMs:60000,ownershipMode:'root',topK:1,analysisPvLen:1,reuseTree:false});
  return {lead:a.rootScoreLead,own:a.ownership&&a.ownership.length,text:ScoreEngine.text(a.rootScoreLead)};},POS);
check(r1.own===361&&Math.abs(r1.lead-(54.5))<3,'the score network (float16, in the browser) on a late position: '+r1.text+' (native float32: B+54.5)');
// 2. dead stones from an ownership map
const d=await p.evaluate(()=>{const g=Array.from({length:19},()=>Array(19).fill(0));g[3][3]=1;g[3][4]=2;g[15][15]=2;
  const own=new Array(361).fill(0.9);return ScoreEngine.dead(g,own);});
check(d.join()===[3*19+4,15*19+15].join(),'white stones on Black\'s points are dead: '+d.join());
// 3. Review's Judge: the lead and the ownership of the position
await p.evaluate(()=>{Review.load('(;GM[1]SZ[19]KM[6.5];B[pd];W[dp];B[pp];W[dd];B[fq];W[cn])');location.hash='#/review';});await p.waitForTimeout(1500);
await p.evaluate(()=>Review.judge());
const j=await p.evaluate(()=>({o:Review.ownership&&Review.ownership.length,lead:Review.judged&&Review.judged.lead,pos:document.querySelector('.review, main, body').innerText}));
check(j.o===361&&typeof j.lead==='number'&&/([BW]\+\d|even)/.test(j.pos),'Judge: the ownership and the lead in the readout ('+(j.pos.match(/[BW]\+[\d.]+/)||[''])[0]+')');
// 4. two passes in an avatar game: the dead stones marked
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.goto(URL+'#/play');await p.waitForTimeout(1200);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.locator('.ai-foe',{hasText:'Li Su'}).click();await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(500);
const m=await p.evaluate(async()=>{ScoreEngine.analyze=async()=>({ownership:new Array(361).fill(0.9),rootScoreLead:30});   // (Black owns all)
  for(let i=0;i<60&&(AIPlay.thinking||!AIPlay.game.myTurn);i++) await new Promise(r=>setTimeout(r,250));
  AIPlay.change(S=>{S.moves=[[3,3],[15,15]];});AIPlay.maybeAI=()=>{};AIPlay.play(-1,-1);AIPlay.play(-1,-1);
  for(let i=0;i<40&&!(AIPlay.game.S.removed||[]).length;i++) await new Promise(r=>setTimeout(r,100));
  return {phase:AIPlay.game.S.phase,removed:AIPlay.game.S.removed,status:AIPlay.status};});
check(m.phase==='stone removal'&&m.removed.join()===String(15*19+15),'after two passes the white stone on Black\'s ground is marked dead: '+JSON.stringify(m));
await b.close();process.exit(fails?1:0);})();
