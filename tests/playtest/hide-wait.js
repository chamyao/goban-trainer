// Hide and wait (Book 14's prologue): in cover and still, a looter ("hide": true) passes you by; out of cover, or
// moving, he catches you and you go back to the last cover ("back_to": "@cover").
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const PT=__dirname.includes('playtest')?__dirname:'/home/user/goban-trainer/tests/playtest';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:PT+'/vendor/phaser.min.js',contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c19')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.setParty(w,['caocao','chengong']);localStorage.setItem('tk-world-13',JSON.stringify({place:'the-east-road',party:['caocao','chengong']}));});
await p.reload();await p.waitForTimeout(3000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const at=await p.evaluate(()=>{const s=window.__w;s.st.pos={place:s.placeId,x:s.player.x,y:s.player.y,f:'right'};s.save();return {x:s.player.x,y:s.player.y,T:s.tw};});
await p.route('**/the-east-road.tmj*',async r=>{const res=await r.fetch();const m=await res.json();const L=m.layers.find(l=>l.name==='objects');const T=at.T;
 L.objects.push({id:90001,name:'door-cover',type:'cover',x:at.x-12,y:at.y-20,width:24,height:24,properties:[]});
 L.objects.push({id:90002,name:'looter',type:'npc',x:at.x+3*T,y:at.y,width:0,height:0,properties:[
  {name:'kind',type:'string',value:'folk.soldier'},{name:'sprite',type:'string',value:'f_soldier'},{name:'wander',type:'bool',value:false},{name:'drawn',type:'bool',value:true},{name:'say',type:'string',value:'[]'},
  {name:'watch',type:'string',value:JSON.stringify({id:'looter',cone:8,beat:[[at.x/T+3-.5,at.y/T-.9]],face:'W',hide:true,back_to:'@cover',seen:[["n","A looter turns. “Who's there?” You shrink back into the doorway.","乱兵回过头来：“谁在那儿？”你缩回门洞里。"]]})}]});
 r.fulfill({response:res,json:m});});
await p.reload();await p.waitForTimeout(3500);
const st=()=>p.evaluate(()=>{const s=window.__w;return {hidden:s.hidden,caught:s.caught,x:Math.round(s.player.x),alpha:s.player.alpha,covers:s.covers.length,dlg:(document.querySelector('.town-dlg')||{}).textContent||''};});
await p.waitForTimeout(1500);
let r=await st();check(r.covers===1&&r.hidden&&!r.caught&&!/looter/i.test(r.dlg),`in cover and still: hidden, not caught (${JSON.stringify(r)})`);
// step out of cover away from him (still in his cone)
await p.keyboard.down('ArrowLeft');await p.waitForTimeout(450);await p.keyboard.up('ArrowLeft');await p.waitForTimeout(600);
r=await st();check(/looter/i.test(r.dlg)||r.caught,`out of cover in his sight: caught (${JSON.stringify(r)})`);
for(let i=0;i<4;i++){await p.keyboard.press('Enter');await p.waitForTimeout(300);}
await p.waitForTimeout(1500);
r=await st();check(Math.abs(r.x-at.x)<14,`sent back to the cover he last hid in (x ${r.x}, cover at ${Math.round(at.x)})`);
await b.close();console.log(fails?`hide-wait: ${fails} failed`:'hide-wait: all ok');})();
