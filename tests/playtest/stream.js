// Stream mode (#/stream, app.js viewStream): problems dealt by the game's own rating (tk.js TKElo).
// Checks: a problem comes up at the rating; a first-try solve raises the rating the game keeps, a miss lowers it,
// and only the first answer counts; Next deals another, never one already seen; a reload keeps the problem.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.addInitScript(()=>{try{if(!localStorage.getItem('gt-progress'))localStorage.setItem('gt-progress',JSON.stringify({tkElo:{r:1100,n:12,used:[],slots:{}}}));}catch(e){}});
await p.goto(URL+'#/');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.book-stream',{timeout:20000});
check(!(await p.$('#tabs a[href="#/stream"]')),'no Stream tab in the top bar');
await p.click('.book-stream');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>window.__trainer&&document.querySelector('.stream-rating'),null,{timeout:20000});
const st=()=>p.evaluate(()=>{const t=window.__trainer,e=JSON.parse(localStorage.getItem('gt-progress')).tkElo,x=STREAM();return {id:`${t.book.id}:${t.p.id}`,r:e.r,n:e.n,used:e.used,label:document.querySelector('.stream-rating').textContent,tab:(document.querySelector('#tabs a.active')||{}).textContent,grade:x&&x[2]};});
await p.evaluate(()=>{window.STREAM=()=>{const t=window.__trainer;return streamPool.rated.find(y=>y[0]===t.book.id&&String(y[1])===String(t.p.id));};});
const a=await st();
const stk=await p.evaluate(()=>{const e=document.querySelector('.tk-stakes');return e&&e.textContent;});
check(/\+\d+ \/ −\d+/.test(stk||''),`the problem's stakes show before answering: "${stk}"`);
check(a.tab==='Library'&&(await p.evaluate(()=>document.getElementById('crumbs').textContent)).includes('Stream'),'the Stream sits under the Library (Library / Stream)');
check(a.grade!=null&&Math.abs(TKof(a.grade)-(1100-191))<=150,`a problem near the rating comes up (${a.id}, grade rank ${a.grade}, rating 1100 aims at ~909)`);
check(a.label.startsWith('10K'),`the rating shows as the game names it: ${a.label}`);
await p.evaluate(()=>window.__trainer.finish('ok'));
const b1=await st();
const stk2=await p.evaluate(()=>document.querySelector('.tk-stakes').textContent);
check(stk2.includes(`+${b1.r-1100}`)&&stk2.includes(`→ ${b1.r}`),`after the answer, the change and the new rating: "${stk2}"`);
check(b1.r>1100&&b1.n===13,`a first-try solve raises the shared rating: 1100 → ${b1.r}`);
await p.evaluate(()=>{window.__trainer.reset();window.__trainer.finish('bad');});
const b2=await st();
check(b2.r===b1.r,'only the first answer counts');
await p.reload();await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>window.__trainer&&document.querySelector('.stream-rating'),null,{timeout:20000});
await p.evaluate(()=>{window.STREAM=()=>{const t=window.__trainer;return streamPool.rated.find(y=>y[0]===t.book.id&&String(y[1])===String(t.p.id));};});
const c=await st();
check(c.id===a.id,'a reload keeps the same problem');
await p.evaluate(()=>window.__trainer.finish('bad'));
check((await st()).r===b1.r,'and it is not rated again after the reload');
await p.keyboard.press('n');await p.waitForTimeout(800);
const d=await st();
check(d.id!==a.id&&!a.used.includes(d.id),`N deals a new, unseen problem (${d.id})`);
await p.evaluate(()=>{window.__trainer.flawed='used a hint';window.__trainer.finish('ok');});
const e=await st();
check(e.r<b1.r,`a solve with a hint counts as a miss: ${b1.r} → ${e.r}`);
// a real wrong move, off the answer key: a miss (before, KataGo took over and it was never rated)
await p.keyboard.press('n');await p.waitForTimeout(800);
const r0=(await st()).r;
const off=await p.evaluate(()=>{const t=window.__trainer,first=new Set(t.p.lines.filter(L=>L.length>1).map(L=>L[1]));
  for(let r=0;r<19;r++)for(let c=0;c<19;c++){const mv=String.fromCharCode(97+c)+String.fromCharCode(97+r);if(t.grid[r][c]===0&&!first.has(mv)){t.click(c,r);return {mv,done:t.done};}}});
const r1=(await st()).r;
check(off&&off.done==='bad'&&r1<r0,`a move off the answer key (${off&&off.mv}) is a miss and lowers the rating: ${r0} → ${r1}`);
// the high roller: the next problem's stakes ×5, kept across a reload, and the one after is back to ×1
const plain=await p.evaluate(()=>TKElo.stakes(streamPool,[window.__trainer.book.id,window.__trainer.p.id]));
await p.click('button.high-roller');await p.waitForTimeout(800);
const hr=await p.evaluate(()=>{const t=window.__trainer,k=TKElo.stakes(streamPool,[t.book.id,t.p.id]),k5=TKElo.stakes(streamPool,[t.book.id,t.p.id],5);return {k,k5,line:document.querySelector('.tk-stakes').textContent,r:TKElo.state().r};});
check(hr.line.includes('×5')&&hr.line.includes(`+${hr.k5.win}`)&&hr.line.includes(`−${-hr.k5.loss}`)&&Math.abs(hr.k5.loss-5*hr.k.loss)<=3,`the high roller deals a problem at ×5 stakes: "${hr.line}" (×1 would be +${hr.k.win} / −${-hr.k.loss})`);
await p.reload();await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>window.__trainer&&document.querySelector('.tk-stakes'),null,{timeout:20000});
check((await p.textContent('.tk-stakes')).includes('×5'),'a reload keeps the ×5');
await p.evaluate(()=>window.__trainer.finish('bad'));
const after=await p.evaluate(()=>TKElo.state().r);
check(after-hr.r===hr.k5.loss,`a miss costs the ×5 loss: ${hr.r} → ${after} (${hr.k5.loss})`);
await p.click('button.primary');await p.waitForTimeout(800);
check(!(await p.textContent('.tk-stakes')).includes('×5'),'Next problem after it is back to ×1');
// AI analysis once answered (the user: "after a problem is done, have an enable AI analysis"): hidden before, then KataGo's top moves
await p.click('button.primary:has-text("Next problem")');await p.waitForTimeout(800);
check(await p.isHidden('button.ai-btn'),'no AI analysis before the problem is answered');
await p.evaluate(()=>window.__trainer.finish('bad'));await p.waitForTimeout(300);
check(await p.isVisible('button.ai-btn'),'once answered, the AI analysis button appears');
await p.click('button.ai-btn');
const ai=await p.waitForFunction(()=>document.querySelectorAll('.board-card .ai-move').length>0,null,{timeout:120000}).then(()=>true,()=>false);
const lbl=await p.evaluate(()=>[...document.querySelectorAll('.board-card .ai-pct')].map(t=>t.textContent));await p.locator('.board-card').screenshot({path:'/tmp/claude-0/-home-user-call-agent/5c72aecd-1e1f-5f3c-b786-40ac9c4571a8/scratchpad/stream-ai.png'});
check(ai&&lbl.length>0&&lbl.every(x=>+x>=0&&+x<=100),`KataGo's top moves show with win rates (${lbl.join(', ')})`);
console.log(fails?`stream: ${fails} failed`:'stream: all ok');await b.close();process.exit(fails?1:0);
})();
function TKof(rank){return 600+rank*50;}
