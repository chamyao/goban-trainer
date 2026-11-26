// Teaching games: the opponent remarks on your moves in its own voice (apo110: "write some dialogues for the characters
// on good and bad moves"), judged in points by the score network (stubbed here: each case's lead set by hand).
// A blunder (15+ points) gets a blunder line (just the line: no points, no better move); a strong move (its first choice,
// not obvious, nothing lost) a "great" line; a small loss nothing.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--window-size=1400,900']});const p=await b.newPage({viewport:{width:1400,height:900}});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.addInitScript(()=>{ if (localStorage.getItem('t')) return; localStorage.setItem('t','1');
  localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { lisu: 1 } } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.locator('.ai-foe',{hasText:'Li Su'}).click();await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(500);
// the score network, stubbed: each look returns the next lead from a queue (Black's view: you are Black here)
await p.evaluate(()=>{window.__leads=[];window.__pol=null;ScoreEngine.analyze=async()=>({rootScoreLead:window.__leads.shift() ?? 0,policy:window.__pol||new Array(362).fill(0)});});
const turn=()=>p.evaluate(async()=>{for(let i=0;i<80&&(AIPlay.thinking||!AIPlay.game.myTurn);i++) await new Promise(r=>setTimeout(r,250));return AIPlay.game.myTurn;});
const said=()=>p.evaluate(()=>{const e=document.querySelector('.avatar-say');return e&&!e.closest('[hidden]')?e.textContent:'';});
const playAs=async(before,after,c,r,pol)=>{await turn();await p.evaluate(([b,a,pl])=>{window.__leads=[b,a];window.__pol=pl;AICoach.since=99;AICoach.yourTurn(AIPlay.game);},[before,after,pol]);
  await p.evaluate(([c,r])=>{AIPlay.move(c,r);},[c,r]);await p.waitForTimeout(600);return said();};
check(await turn(),'your turn after Li Su\'s first move');
let t=await playAs(20,3,2,16,null);
check(/(win without a fight|Red Hare|consult your own stones|whole board is lost)/.test(t)&&!/points|better/.test(t),'a 17-point loss: a Li Su blunder line, just the line: '+t);
const pol=new Array(362).fill(0.01);pol[2*19+2]=0.3;
t=await playAs(5,5.5,2,2,pol);
check(/(stands on reason|persuaded|best speech|Straight to the point)/.test(t)&&!/points/.test(t),'his first choice, not obvious, nothing lost: a "great" line: '+t);
const pol2=new Array(362).fill(0.01);pol2[16*19+16]=0.3;
t=await playAs(5,1,16,2,pol2);
check(t==='','a 4-point loss: nothing said ('+t+')');
t=await playAs(10,2,15,10,pol2);
check(/(make its case|weak point first|At the board too|city given away)/.test(t)&&!/points|better/.test(t),'an 8-point loss: a Li Su mistake line, just the line: '+t);
// the remark stays through the avatar's reply and goes with your next move
await turn();const kept=await said();
t=await playAs(5,4,14,14,pol2);
check(!!kept&&t==='','the remark stayed through the reply ('+(kept?'yes':'no')+') and went with your next move ('+JSON.stringify(t)+')');
await b.close();process.exit(fails?1:0);})();
