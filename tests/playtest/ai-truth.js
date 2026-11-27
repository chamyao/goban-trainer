// The avatars' lines say only what's true (apo110: "check the dialogues to see if we have the capability to make them
// actually true"): a line that claims something (a group killed, a weak group, its last move, elsewhere, expected) is
// said only when the check behind it holds, and preferred then. Dong Zhuo, the score network stubbed: a blunder in
// which your stones die gets a kill line; a mistake with nothing to claim gets his line that claims nothing.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.addInitScript(()=>{ if (localStorage.getItem('t')) return; localStorage.setItem('t','1'); localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { dongzhuo: 1 } } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.locator('.ai-foe',{hasText:'Dong Zhuo'}).click();await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(500);
const turn=()=>p.evaluate(async()=>{for(let i=0;i<80&&(AIPlay.thinking||!AIPlay.game.myTurn);i++) await new Promise(r=>setTimeout(r,250));return AIPlay.game.myTurn;});
const said=()=>p.evaluate(()=>{const e=document.querySelector('.avatar-say');return e&&!e.closest('[hidden]')?e.textContent:'';});
// each look returns the next {lead, own}; own: +1 everywhere (yours) but where listed (-1: dead)
const play=async(looks,c,r)=>{await turn();await p.evaluate(looks=>{window.__looks=looks;
  ScoreEngine.analyze=async()=>{const l=window.__looks.shift()||{lead:0};const own=new Array(361).fill(l.own===undefined?0:1);(l.dead||[]).forEach(i=>own[i]=-1);return {rootScoreLead:l.lead,ownership:l.own===undefined?[]:own,policy:new Array(362).fill(0)};};
  OwnPlay.analyze=async()=>({policy:new Array(362).fill(0.001)});Engine.analyze=async()=>({moves:[]});
  AICoach.since=99;AICoach.yourTurn(AIPlay.game);},looks);
  await p.evaluate(([c,r])=>AIPlay.move(c,r),[c,r]);await p.waitForTimeout(700);return [await said(),await p.evaluate(()=>AICoach.facts)];};
// your handicap stones are yours before, dead after: a blunder where a group of yours dies
const hs=await p.evaluate(()=>(AIPlay.game.S.setup||[]).map(([c,r])=>r*19+c));
let [t,f]=await play([{lead:20,own:1},{lead:2,own:1,dead:hs}],2,2);
check(hs.length>=3&&f.kill&&/(how you end up|feeds me for three days|hand me freebies)/.test(t),'your stones died: a Dong Zhuo kill line ('+t+')');
[t,f]=await play([{lead:10,own:1},{lead:2,own:1}],16,2);
check(!f.kill&&!f.weak&&/Bite off too much/.test(t),'a mistake, nothing dying, nothing weak: his line that claims nothing ('+t+')');
await b.close();process.exit(fails?1:0);})();
