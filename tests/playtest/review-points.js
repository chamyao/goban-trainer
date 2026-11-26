// Review in win rate or points (the user: "just have it a toggle, so the user has the option, and still show one if the
// others not ready"): the toggle; Points runs the score network over the game (stubbed: Black's lead set by hand, a
// 10-point drop at Black's move 5); the chart and the biggest mistakes in points; the one chosen not ready while the
// other is: the other shown, with a note; the points kept with the game.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.goto(URL+'#/play');await p.waitForTimeout(1200);
await p.evaluate(()=>{localStorage.removeItem('gt-review-unit');
  // Black's lead by position: 5, 5, ..., a 10-point drop after move 9 (Black's 5th), then flat
  window.__lead=k=>k<9?5:-5;
  ScoreEngine.analyze=async f=>{const n=f.board.flat().filter(Boolean).length;return {rootScoreLead:window.__lead(n),ownership:[],policy:[]};};
  Review.load('(;GM[1]SZ[19]KM[6.5];B[pd];W[dp];B[pp];W[dd];B[fq];W[cn];B[jp];W[cf];B[nd];W[qj];B[qf];W[qn])');
  location.hash='#/review';});
await p.waitForTimeout(1500);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
const st=()=>p.evaluate(()=>({want:Review.unitWanted,shown:Review.shownUnit(),wr:document.querySelector('.rv-unit button:first-child').classList.contains('active'),
  pts:document.querySelector('.rv-unit button:last-child').classList.contains('active'),note:document.querySelector('.rv-score-head').parentNode.querySelector('.chart-note').textContent,
  labels:[...document.querySelectorAll('.chart-wrap svg text')].map(t=>t.textContent).join('|'),mist:[...document.querySelectorAll('.mistake')].map(e=>e.innerText.replace(/\n/g,' ')).join(' / ')}));
let s=await st();
check(s.want==='wr'&&s.wr&&!s.pts,'Win rate chosen by default');
await p.click('.rv-unit button:last-child');
for(let i=0;i<40&&(await p.evaluate(()=>Review.count('pts')))<13;i++) await p.waitForTimeout(200);
s=await st();
check(s.want==='pts'&&s.shown==='pts'&&s.pts&&/B\+10\|0\|W\+10/.test(s.labels),'Points: the chart in points ('+s.labels.split('|').slice(0,3).join(' ')+')');
check(/Move 9 · Black .*−10 pts/.test(s.mist),'the biggest mistakes in points: '+s.mist);
// points chosen but not ready, win rate ready: win rate shown, with a note
const fb=await p.evaluate(()=>{const keep=Review.scores.slice();Review.scores=new Array(Review.game.n+1);Review.scores[0]=5;
  Review.analyses=Array.from({length:Review.game.n+1},()=>({w:0.6,v:2}));Review.scoring=true;Review.renderChart();Review.renderUnit();
  const r={shown:Review.shownUnit(),note:Review.els.unitNote.textContent};Review.scores=keep;Review.scoring=false;Review.renderChart();Review.renderUnit();return r;});
check(fb.shown==='wr'&&/Points not ready yet \(1\/13\): showing win rate/.test(fb.note),'Points not ready, win rate ready: win rate shown, with a note ('+fb.note+')');
// and kept with the game
const kept=await p.evaluate(()=>{const e=Review.buildEntry();Review.applyState(e);return Review.count('pts');});
check(kept===13,'the points kept with the game ('+kept+'/13)');
await p.click('.rv-unit button:first-child');s=await st();
check(s.want==='wr'&&s.wr,'back to win rate');
await b.close();process.exit(fails?1:0);})();
