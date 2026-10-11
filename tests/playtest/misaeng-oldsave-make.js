// make a world-21 save on the live site while it still serves the old (23-beat) Book 1, with the old code; keep the storage
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const OUT = process.argv[2];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({viewport:{width:1280,height:800}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('https://chamyao.github.io/goban-trainer/index.html#/tk/21');await p.waitForTimeout(3000);
const s=await p.evaluate(async()=>{await TK.load();const w=TK.world(21);
 localStorage.setItem('gt-username','playtest-oldsave');
 for(const n of w.nodes.slice(0,5))TK.markCleared(n.key);
 localStorage.setItem('tk-world-21',JSON.stringify({place:'one-international',party:['ms_jang'],pos:{place:'one-international',x:296,y:200,f:'down'}}));
 const pr=JSON.parse(localStorage.getItem('gt-progress')||'{}');
 return {name:w.name,beats:w.nodes.length,cleared:w.nodes.filter(n=>TK.cleared(n.key)).map(n=>n.key),tkMig:(pr.tkMig||{})[21]||null,migKeys:Object.keys(localStorage).filter(k=>/mig/i.test(k))};});
console.log(JSON.stringify(s));
await ctx.storageState({path:OUT});await b.close();})();
