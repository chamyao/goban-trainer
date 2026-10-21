// The Stream: Explore opened mid-problem and left with Reset doesn't cost the first try (cryptoderes: "when I'm in stream
// mode, exploring a problem, and I hit reset to exit explore mode, it deducts rating points even though I got the answer
// on the first try"); a stone actually tried in Explore before answering still does, and the status says why.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
const run=async(tryStone)=>{const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
  await p.goto('http://localhost:8765/#/stream');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
  const r=()=>p.evaluate(()=>TKElo.state().r);
  const solve=async()=>{for(let i=0;i<60;i++){const st=await p.evaluate(()=>{const t=window.__trainer;if(t.done==='ok'||t.done==='bad')return t.done;if(t.done==='next'||t.engineBusy)return 'wait';
    const L=t.consistentLines()[0];if(!L)return 'noline';const mv=L[t.played.length+1];if(!mv)return 'wait';const [c,rr]=cIdx(mv);t.click(c,rr);return 'played';});
    if(st==='ok'||st==='bad'||st==='noline')return st;await p.waitForTimeout(st==='wait'?600:1000);}return 'timeout';};
  for(let n=0;n<20;n++){
    await p.waitForFunction(()=>window.__trainer&&window.__trainer.p&&document.querySelector('.stream-rating'));await p.waitForTimeout(400);
    const r0=await r();
    await p.evaluate(()=>{const t=window.__trainer;const L=t.consistentLines()[0];const [c,rr]=cIdx(L[1]);t.click(c,rr);});await p.waitForTimeout(1800);
    if(await p.evaluate(()=>window.__trainer.done)===null){
      await p.click('button:has-text("Explore")');
      if(tryStone)await p.evaluate(()=>{const t=window.__trainer;for(let c=0;c<19;c++)for(let r=0;r<19;r++)if(t.grid[r][c]===0){t.exploreClick(c,r);return;}});
      await p.click('.controls button:has-text("Reset")');
      const back=await p.evaluate(()=>!window.__trainer.explore&&window.__trainer.played.length>0);
      const res=await solve(), r1=await r(), msg=await p.textContent('#status');await p.close();return {r0,r1,res,back,msg};}
    await p.evaluate(()=>window.__trainer.streamNext());}
  await p.close();return null;};
const a=await run(false);
check(a&&a.back,'Reset in Explore: back to the attempt, its moves kept');
check(a&&a.res==='ok'&&a.r1>a.r0,`Explore looked at, then solved: rated first try (${a&&a.r0} → ${a&&a.r1})`);
const s=await run(true);
check(s&&s.res==='ok'&&s.r1<s.r0&&/not first try: used explore/.test(s.msg),`a stone tried in Explore first: not first try, and it says so (${s&&s.r0} → ${s&&s.r1}, "${s&&s.msg.trim()}")`);
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);})();
