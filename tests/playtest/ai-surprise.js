// Diaochan's "I hadn't foreseen that one" only when true (apo110: "a decent move according to a stronger net but not
// in her top 3 choices"): Lionffen (stubbed) rates your move decent and her own network (stubbed) didn't have it in its
// three: a surprise line; Lionffen doesn't rate it, or it was among her three: none.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.addInitScript(()=>{ if (localStorage.getItem('t')) return; localStorage.setItem('t','1'); localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { diaochan: 1 } } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.locator('.ai-foe',{hasText:'Diaochan'}).click();await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(500);
const turn=()=>p.evaluate(async()=>{for(let i=0;i<80&&(AIPlay.thinking||!AIPlay.game.myTurn);i++) await new Promise(r=>setTimeout(r,250));return AIPlay.game.myTurn;});
const said=()=>p.evaluate(()=>{const e=document.querySelector('.avatar-say');return e&&!e.closest('[hidden]')?e.textContent:'';});
// her network wants three points; Lionffen's search ranks given points
const tryMove=async(mv,herTop,lionMoves)=>{await turn();
  await p.evaluate(([herTop,lionMoves])=>{
    ScoreEngine.analyze=async()=>({rootScoreLead:5,policy:new Array(362).fill(0)});
    OwnPlay.analyze=async(g)=>{const pol=new Array(362).fill(0.001);for(let i=0;i<361;i++) if(!g.legal(i%19,Math.floor(i/19))) pol[i]=-1;herTop.forEach((i,k)=>{if(pol[i]>=0)pol[i]=0.3-0.05*k;});return {policy:pol};};
    Engine.analyze=async()=>({moves:lionMoves.map(([i,w])=>({x:i%19,y:Math.floor(i/19),winRate:w,visits:10}))});
    AICoach.since=99;AICoach.yourTurn(AIPlay.game);},[herTop,lionMoves]);
  await p.evaluate(m=>AIPlay.move(m%19,Math.floor(m/19)),mv);await p.waitForTimeout(600);return said();};
const P=(c,r)=>r*19+c;
let t=await tryMove(P(2,2),[P(16,2),P(2,16),P(16,16)],[[P(16,2),0.9],[P(2,2),0.89]]);
check(/(hadn't foreseen|didn't expect|never even thought)/.test(t),'decent to Lionffen, not among her three: a surprise line: '+t);
t=await tryMove(P(5,5),[P(16,5),P(2,13),P(13,13)],[[P(16,5),0.9],[P(2,13),0.88]]);
check(!/(hadn't foreseen|didn't expect|never even thought)/.test(t),'not among Lionffen\'s moves: no surprise ('+t+')');
t=await tryMove(P(13,5),[P(13,5),P(5,13),P(9,9)],[[P(13,5),0.9]]);
check(!/(hadn't foreseen|didn't expect|never even thought)/.test(t),'her own first choice: no surprise (a "same" line instead: '+t+')');
await b.close();process.exit(fails?1:0);})();
