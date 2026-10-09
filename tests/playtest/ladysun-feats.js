// The Lady Sun book's ways of playing (tk-feats.js), on Book 13's East Road with injected people:
// the bag and a sealed pouch (its card), the loud town (news passed on, red hangings), the carriage and its
// curtain, and blockers who step aside when faced with the curtain up (and catch you if you push on).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const U=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/13';
await p.goto(U);await p.waitForTimeout(800);
const setup=async()=>p.evaluate(async()=>{await TK.load();for(const w of [TK.world(13),window.__w&&window.__w.w].filter(Boolean))Object.assign(w.items=w.items||{},{
 pouch1:{kind:'sealed',name:'The first silk pouch',zh:'第一个锦囊',opens:'Open on reaching Nanxu.',opens_zh:'到了南徐再拆。',plan:'Let the whole city know of the wedding.',plan_zh:'让全城都知道这门亲事。'},
 car:{kind:'carriage',name:'A carriage',zh:'车驾',rider:'caocao'}});});
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c19')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.lsSet('tk-items',{13:['pouch1','car']});TK.setParty(w,['caocao']);localStorage.setItem('tk-world-13',JSON.stringify({place:'the-east-road',party:['caocao']}));});
await p.reload();await setup();await p.waitForTimeout(3000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const at=await p.evaluate(()=>{const s=window.__w;s.st.pos={place:s.placeId,x:s.player.x,y:s.player.y,f:'right'};s.save();return {x:s.player.x,y:s.player.y,T:s.tw};});
await p.route('**/the-east-road.tmj*',async r=>{const res=await r.fetch();const m=await res.json();const L=m.layers.find(l=>l.name==='objects');const T=at.T;
 const npc=(id,dx,dy,extra)=>({id:90000+L.objects.length,name:id,type:'npc',x:at.x+dx*T,y:at.y+dy*T,width:0,height:0,properties:[
  {name:'kind',type:'string',value:'folk.soldier'},{name:'sprite',type:'string',value:'f_soldier'},{name:'wander',type:'bool',value:false},{name:'drawn',type:'bool',value:true},{name:'say',type:'string',value:'[]'},...extra]});
 L.objects.push(npc('gos-a',-3,-4,[{name:'gossip',type:'string',value:JSON.stringify({tells:['gos-b']})}]));
 L.objects.push(npc('gos-b',-7,-4,[{name:'gossip',type:'string',value:JSON.stringify({tells:['gos-c']})}]));
 L.objects.push(npc('gos-c',-11,-4,[{name:'gossip',type:'string',value:'{}'}]));
 const prop=L.objects.find(o=>o.type==='prop'&&/#\d+$/.test(o.name||''));if(prop)L.objects.push({...prop,id:99990,x:at.x-11*T,y:at.y-6*T,properties:[...(prop.properties||[]),{name:'told',type:'string',value:'gos-c'}]});
 for(const [id,dy] of [['blk-1',-0.6],['blk-2',0.6]])L.objects.push(npc(id,4,dy,[{name:'yield',type:'string',value:JSON.stringify({group:'road',reach:6,aside:[0,dy<0?-2:2],line:[['n',`${id} dismounts and steps aside.`,'他下马让开了。']],back_to:''})}]));
 r.fulfill({response:res,json:m});});
await p.reload();await setup();await p.waitForFunction(()=>window.__w&&window.__w.player&&window.__w.npcs.some(n=>n.yield),null,{timeout:30000});await p.waitForTimeout(2000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
// 1. the bag
await setup();await p.waitForTimeout(1800);
const bagOk=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Bag/.test(x.textContent));return !!b&&!b.hidden;});check(bagOk,'the Bag button is offered (in the menu) once a sealed pouch is carried');
await p.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/Bag/.test(x.textContent)).click());await p.waitForTimeout(300);
const bagTxt=await p.evaluate(()=>(document.querySelector('.tk-bag')||{}).textContent||'');
check(/Sealed\. Open on reaching Nanxu/.test(bagTxt)&&!/whole city/.test(bagTxt),`the bag lists the pouch as sealed, with when it opens, not its plan ("${bagTxt.slice(0,80)}")`);
await p.locator('.tk-bag button').click();
// 2. its card
p.evaluate(()=>WorldFeats.openCard(TK.world(13),'pouch1'));await p.waitForTimeout(300);
const card=await p.evaluate(()=>(document.querySelector('.tk-pouch')||{}).textContent||'');check(/让全城都知道这门亲事/.test(card)&&/whole city/.test(card),'["open"] shows the pouch\'s card with its plan in both languages');
await p.locator('.tk-pouch button').click();
// 3. the loud town
await p.evaluate(()=>{const s=window.__w;WorldFeats.tell(s,s.npcs.find(n=>n.id==='gos-a'));});await p.waitForTimeout(300);
for(let i=0;i<4;i++){await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());await p.waitForTimeout(250);}
for(let i=0;i<40&&(await p.evaluate(()=>window.__w.st.told.length))<3;i++)await p.waitForTimeout(500);
const g=await p.evaluate(()=>({told:window.__w.st.told,hang:window.__w.toldProps.map(t=>t.img&&t.img.visible),cond:window.__w.cond('told:gos-c')}));
check(g.told.join()==='gos-a,gos-b,gos-c'&&g.cond,`the news passes from one to the next (${JSON.stringify(g.told)})`);
check(g.hang.length&&g.hang.every(Boolean),`the red hangings go up where it's known (${JSON.stringify(g.hang)})`);
// 4. the carriage
const clear=async()=>{for(let i=0;i<12&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(250);}};
await clear();
const c0=await p.evaluate(()=>{const s=window.__w;return {car:!!s.carriageImg,alpha:s.player.alpha,frame:s.carriageImg&&s.carriageImg.frame&&s.carriageImg.frame.name};});
check(c0.car&&c0.alpha===0&&/^carriage\.\w+\.shut$/.test(c0.frame),`she rides in the carriage, curtain down, unseen (${JSON.stringify(c0)})`);
// 5. face them down: curtain down, nothing happens
await p.evaluate(()=>{const s=window.__w;for(const n of s.npcs)if(n.yield){n.stoodAside=false;n.spr.body.enable=true;n.spr.setPosition(n.home.x,n.home.y);}s.st.yielded=[];s.st.curtain=false;s.player.facing='right';s.player.setVelocity(0);});await p.waitForTimeout(3000);
let y=await p.evaluate(()=>window.__w.npcs.filter(n=>n.yield&&n.stoodAside).length);check(y===0,`curtain down: they don't yield (${y})`);
await clear();await p.keyboard.press('c');await p.waitForTimeout(300);
const c1=await p.evaluate(()=>({up:window.__w.st.curtain,frame:window.__w.carriageImg.frame.name}));check(c1.up&&/^carriage\.\w+\.open$/.test(c1.frame),`C raises the curtain; she shows at the window (the open frame) (${JSON.stringify(c1)})`);
await p.evaluate(()=>{const s=window.__w;s.player.facing='right';});
for(let i=0;i<14;i++){await p.evaluate(()=>window.__w.ui.busy()&&window.__w.ui.advance());await p.waitForTimeout(400);}
y=await p.evaluate(()=>({n:window.__w.npcs.filter(n=>n.yield&&n.stoodAside).length,saved:window.__w.st.yielded}));
check(y.n===2&&y.saved.length===2,`standing still, facing them, curtain up: both step aside, one by one (${JSON.stringify(y)})`);
// 6. pushing on: a catch, and the group back in place
await clear();await p.evaluate(()=>{const s=window.__w;for(const n of s.npcs)if(n.yield){n.stoodAside=false;n.spr.body.enable=true;n.spr.setPosition(n.home.x,n.home.y);}s.st.yielded=[];s.player.setPosition(s.player.x,s.player.y);});
await p.keyboard.down('ArrowRight');await p.waitForTimeout(1500);await p.keyboard.up('ArrowRight');await p.waitForTimeout(300);
const cg=await p.evaluate(()=>({caught:window.__w.caught,dlg:(document.querySelector('.town-dlg')||{}).textContent||''}));
check(cg.caught&&/No one passes|不许过/.test(cg.dlg),`rushing at them is a catch (${cg.dlg.slice(0,60)})`);
await b.close();console.log(fails?`ladysun-feats: ${fails} failed`:'ladysun-feats: all ok');})();
