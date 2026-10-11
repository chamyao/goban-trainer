// A problem set on a smaller board than 19x19 (101weiqi's "lu", our "sz"): apo110 saw 101weiqi #119582, a 13x13
// problem on the edge, drawn mid-board on our 19x19. Checks: the board stops at the 13x13 edge (no line or point
// past it, the edge drawn as an edge, rows numbered 1-13), a stone on that edge has no liberty past it, and the
// answer key plays through to Correct.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const IDX=process.env.IDX||160;
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/book/specialized-training-in-tesuji-5/'+IDX);
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>window.__trainer&&window.__trainer.p.id===119582,null,{timeout:20000});
const s=await p.evaluate(()=>{const t=window.__trainer,c=t.goban.crop;
  const labels=[...document.querySelectorAll('svg text')].map(x=>x.textContent);

  return {sz:t.p.sz,c,wall:t.grid[13][1],walls:t.grid[12].slice(13).every(v=>v===WALL)&&t.grid[13].every(v=>v===WALL),labels};});
check(s.sz===13,`the problem knows its board: ${s.sz}x${s.sz}`);
check(s.c.r1===12&&s.c.c1<=12&&s.c.c0===0,`the board is drawn to its own edge, not past it: ${JSON.stringify(s.c)}`);
check(s.walls&&s.wall===3,'everything past the 13x13 is walled off');
check(s.labels.includes('1')&&!s.labels.includes('19')&&!s.labels.includes('14'),'rows numbered 1-13, as on the source');
// the source's answer, played through
const res=await p.evaluate(async()=>{const t=window.__trainer;const L=t.p.lines.find(l=>l[0]===1);
  for(let i=1;i<L.length;i+=2){const [c,r]=cIdx(L[i]);t.click(c,r);await new Promise(z=>setTimeout(z,1300));}
  await new Promise(z=>setTimeout(z,600));return {done:t.done,status:document.getElementById('status').textContent};});
check(res.done==='ok',`the answer key plays through: ${res.status}`);
console.log(fails?`small-board: ${fails} failed`:'small-board: all ok');await b.close();process.exit(fails?1:0);
})();
