// Board point spacing on a phone held upright, for every problem in every pool of Books 1 and 2, as the
// problem overlay shows it: svg width / Goban.W * Goban.cell. arg: device (default iPhone 13).
// Prints the share under 28 px (tap to preview) and under 24 px. Measures; fails only on a broken problem.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const DEV=process.argv[2]||'iPhone 13',BOOKS=(process.env.BOOKS||'1,2').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({...devices[DEV]})).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1#/tk/1');await p.waitForTimeout(1500);
await p.evaluate(()=>{for(const w of [1,2])TK.world(w).nodes.forEach(n=>TK.markCleared(n.key));localStorage.setItem('tk-guide','off');});
await p.reload();await p.waitForTimeout(2000);
for(let i=0;i<8;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(300);}}
const jobs=await p.evaluate(B=>{const out=[],seen=new Set();for(const n of B)for(const node of TK.world(n).nodes)(node.pool||[]).forEach((ref,i)=>{const k=ref.join(':');if(seen.has(k))return;seen.add(k);out.push({w:n,key:node.key,i,ref:k});});return out;},BOOKS);
console.log(`${DEV}: ${jobs.length} different problems`);
const res=[];let broken=0;
for(const j of jobs){
  const r=await p.evaluate(async j=>{const d=TK.ls('tk-draw');d[j.key]=j.i;TK.lsSet('tk-draw',d);
    document.querySelectorAll('.tk-duel').forEach(e=>e.remove());
    TKOverlay.open(j.w,j.key,{host:document.querySelector('.tk-map')});
    for(let t=0;t<60;t++){await new Promise(r=>setTimeout(r,50));const t2=window.__trainer;const svg=document.querySelector('.tk-duel svg');if(t2&&svg&&svg.getBoundingClientRect().width>0&&t2.goban&&t2.goban.svg===svg){
      const g=t2.goban,w=svg.getBoundingClientRect().width;const cols=Math.round(g.W/g.cell);return {px:+(w/g.W*g.cell).toFixed(1),width:Math.round(w),cols};}}
    return null;},j);
  await p.keyboard.press('Escape');await p.evaluate(()=>document.querySelectorAll('.tk-duel').forEach(e=>e.remove()));
  if(!r){broken++;console.log('FAIL no board for',j.key,j.ref);continue;}
  res.push({...j,...r});
}
const share=lim=>res.filter(x=>x.px<lim).length;const n=res.length,pct=k=>(100*k/n).toFixed(0)+'%';
for(const B of BOOKS){const rb=res.filter(x=>x.w===B);const s=v=>rb.filter(x=>x.px<v).length;console.log(`  book ${B}: ${rb.length} problems; under 28 px ${s(28)} (${(100*s(28)/rb.length).toFixed(0)}%), under 24 px ${s(24)} (${(100*s(24)/rb.length).toFixed(0)}%)`);}
const sorted=res.map(x=>x.px).sort((a,b)=>a-b);
console.log(`  all: ${n}; under 28 px ${share(28)} (${pct(share(28))}), under 24 px ${share(24)} (${pct(share(24))}); spacing min ${sorted[0]} median ${sorted[Math.floor(n/2)]} max ${sorted[n-1]}`);
require('fs').writeFileSync(require('path').join(__dirname,'out',`spacing-${DEV.replace(/ /g,'-')}.json`),JSON.stringify(res));
console.log(`spacing: ${broken} broken`);await b.close();})();
