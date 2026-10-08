// A wall's gate shut in a map state (Places' "shut": [{gate, rect, say}]): it stops him and says its line.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const PT=__dirname;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:PT+'/vendor/phaser.min.js',contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto('http://localhost:8765/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c19')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.setParty(w,['caocao','chengong']);localStorage.setItem('tk-world-13',JSON.stringify({place:'the-east-road',party:['caocao','chengong']}));});
await p.reload();await p.waitForTimeout(3000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.waitForTimeout(800);
// a 2x2 shut gate 3 tiles east of him, in a state that always holds
const at=await p.evaluate(()=>{const s=window.__w,T=s.tw,tx=Math.floor(s.player.x/T)+3,ty=Math.floor(s.player.y/T)-1;
 s.st.pos={place:s.placeId,x:s.player.x,y:s.player.y,f:'right'};s.save();return {x:s.player.x,gx:tx*T,tx,ty};});
await p.route('**/the-east-road.tmj*',async r=>{const res=await r.fetch();const m=await res.json();m.properties=(m.properties||[]).filter(x=>x.name!=='states');
 m.properties.push({name:'states',type:'string',value:JSON.stringify([{id:'locked',shut:[{gate:'g',rect:[at.tx,at.ty,2,3],say:[["n","The gate is barred against you.","城门对你紧闭。"]]}]}])});
 r.fulfill({response:res,json:m});});
await p.reload();await p.waitForTimeout(3500);
await p.evaluate(a=>{const s=window.__w;s.player.setPosition(a.x,s.player.y);},at);
const st=await p.evaluate(()=>({n:window.__w.shutGates.length,on:window.__w.shutGates.map(g=>g.on)}));console.log(JSON.stringify(st));
await p.keyboard.down('ArrowRight');await p.waitForTimeout(1200);await p.keyboard.up('ArrowRight');await p.waitForTimeout(300);
const r=await p.evaluate(()=>({x:Math.round(window.__w.player.x),dlg:(document.querySelector('.town-dlg')||{}).textContent||''}));
check(r.x<at.gx+2&&/barred/.test(r.dlg),`a shut gate stops him and says its line (${JSON.stringify(r)}, gate at ${at.gx})`);
await b.close();console.log(fails?'shut-gates: failed':'shut-gates: all ok');})();
