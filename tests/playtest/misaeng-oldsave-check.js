// after the live site updates: load the old save, open Book 21, and check it started over (no world-21 beat cleared, tkMig[21] the new version,
// the book on its opening scroll or its first beat). EXPECT_BEATS and EXPECT_MIG name the new book; args: the saved storage, a screenshot path.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({viewport:{width:1280,height:800},storageState:process.argv[2]});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('ERR',e.message);});
const before=await (async()=>{await p.goto('https://chamyao.github.io/goban-trainer/index.html#/');await p.waitForTimeout(500);return p.evaluate(()=>{const pr=JSON.parse(localStorage.getItem('gt-progress')||'{}');return {cleared21:Object.keys(pr.tk||{}).filter(k=>/^21-/.test(k)&&pr.tk[k]===1),tkMig:(pr.tkMig||{})[21]||null};});})();
console.log('old save as loaded (before the game runs its start-over):',JSON.stringify(before));
await p.goto('https://chamyao.github.io/goban-trainer/index.html#/tk/21');await p.waitForTimeout(4000);
const after=await p.evaluate(async()=>{await TK.load();const w=TK.world(21),pr=JSON.parse(localStorage.getItem('gt-progress')||'{}');
 return {book:w.name,beats:w.nodes.length,cleared:w.nodes.filter(n=>TK.cleared(n.key)).map(n=>n.key),tkMig:(pr.tkMig||{})[21]||null,place:window.__w&&window.__w.placeId,next:window.__w&&window.__w.nextMain&&window.__w.nextMain()&&window.__w.nextMain().node,goal:(document.querySelector('.town-goal')||{}).textContent};});
console.log('after reload on the new site:',JSON.stringify(after));
const opening=await p.evaluate(()=>!!document.querySelector('.tk-scroll-go'));
const ok=after.beats===+(process.env.EXPECT_BEATS||after.beats)&&after.cleared.length===0&&after.tkMig===+(process.env.EXPECT_MIG||after.tkMig)&&(opening||after.next==='21-m1')&&!errs.length;
console.log('opening scroll showing:',opening);
console.log(ok?'ok   an old world-21 save starts Book 1 over on the live site':'FAIL the old save did not start over as expected');
await p.screenshot({path:process.argv[3]});await b.close();})();
