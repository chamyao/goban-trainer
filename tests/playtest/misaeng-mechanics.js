// Misaeng's ways of playing (tk-modern.js), on Book 13's East Road with the world's keys and people injected:
// the record's strip and a record board (the right point wins, a wrong one rests), the audit board (two clues
// linked per question, the done mark at the end), the trade loop (buy, offer, the rival, the done mark), setting
// the room (a delivery that takes the thing, the prop that shows once it's set down), and English-only text.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const BASE=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(BASE+'/index.html#/tk/13');await p.waitForTimeout(800);
// the world's keys, as build_tk.py writes them (the record read from the book's SGF)
const setup=async()=>p.evaluate(async()=>{await TK.load();
 const sgf=await (await fetch('docs/book2/misaeng-ing-cup-g5.sgf')).text();
 const moves=[...sgf.matchAll(/;\s*([BW])\[([a-s]{2})\]/g)].map(m=>[m[1],m[2]]);
 for(const w of [TK.world(13),window.__w&&window.__w.w].filter(Boolean)){
  w.record={title:'1st Ing Cup final, game 5',black:'Cho Hunhyun',white:'Nie Weiping',moves};delete w.__recordBook;
  const nd=w.nodes.find(n=>n.key==='13-c19');nd.move=28;nd.record=29;
  Object.assign(w.items=w.items||{},{
   statements:{kind:'clue',name:"Baekjin's statements",text:'A margin no trading house makes.'},
   coached:{kind:'clue',name:"Baekjin's staff",text:'They answer as if taught.'},
   icb:{kind:'clue',name:"ICB's number",text:'A Korean voice answers in Jordan.'},
   tray:{kind:'prop',name:'The tea tray'},
   notes:{kind:'note',name:'Seating notes',text:'The president: water, no ice. The tray goes on his left.'}});
  w.audit={title:'The audit board',clues:['statements','coached','icb'],done:'audit',links:[
   {q:'Why is the margin so high?',pair:['statements','coached'],a:'Someone taught them what to say.'},
   {q:'Who is behind Baekjin?',pair:['coached','icb'],a:'Someone in Korea answers for them.'}]};
  w.trade={cash:100000,unit:'₩',goods:{socks:{name:'Socks',cost:20000},squid:{name:'Dried squid',cost:30000}},done:'trade',ends:{offers:3}};
 }});
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);
 for(const n of w.nodes){if(n.key==='13-c19')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 TK.lsSet('tk-items',{13:['statements','coached','notes']});TK.setParty(w,['caocao']);localStorage.setItem('tk-world-13',JSON.stringify({place:'the-east-road',party:['caocao']}));});
await p.reload();await setup();await p.waitForTimeout(3000);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const at=await p.evaluate(()=>{const s=window.__w;s.st.pos={place:s.placeId,x:s.player.x,y:s.player.y,f:'right'};s.save();return {x:s.player.x,y:s.player.y,T:s.tw};});
// the trade's people and the room's seat, put on the road
await p.route('**/the-east-road.tmj*',async r=>{const res=await r.fetch();const m=await res.json();const L=m.layers.find(l=>l.name==='objects');const T=at.T;
 const npc=(id,dx,dy,extra)=>({id:90000+L.objects.length,name:id,type:'npc',x:at.x+dx*T,y:at.y+dy*T,width:0,height:0,properties:[
  {name:'kind',type:'string',value:'folk.villager'},{name:'sprite',type:'string',value:'f_villager'},{name:'wander',type:'bool',value:false},{name:'drawn',type:'bool',value:true},
  {name:'say',type:'string',value:JSON.stringify([['n','A man on the street.','']])},...extra]});
 L.objects.push(npc('shopkeep',-3,-5,[{name:'shop',type:'string',value:'["socks","squid"]'},{name:'label',type:'string',value:'The corner market'}]));
 L.objects.push(npc('buyer-yes',-6,-5,[{name:'buyer',type:'string',value:JSON.stringify({wants:['socks'],pays:30000,yes:[['n','"Socks? Fine, I need some."','']]})}]));
 L.objects.push(npc('buyer-no',-9,-5,[{name:'buyer',type:'string',value:JSON.stringify({wants:['socks','squid'],no:[['n','"No thanks."','']]})}]));
 L.objects.push(npc('rival',-12,-5,[{name:'rival',type:'string',value:JSON.stringify({say:[['n','The shop owner sells three pairs while you watch.','']]})}]));
 L.objects.push({id:99901,name:'seat-a',type:'spot',x:at.x-3*T,y:at.y+5*T,width:0,height:0,properties:[
  {name:'needs',type:'string',value:'["item:tray"]'},{name:'delivers',type:'string',value:'seat_a'},{name:'takes',type:'bool',value:true},
  {name:'deliver',type:'string',value:JSON.stringify([['n','You set the tray down on his left.','']])},
  {name:'waiting',type:'string',value:JSON.stringify([['n','The notes say the tray goes here.','']])}]});
 L.objects.push({id:99902,name:'audit-table',type:'spot',x:at.x+3*T,y:at.y+5*T,width:0,height:0,properties:[{name:'opens',type:'string',value:'audit'}]});
 const prop=L.objects.find(o=>o.type==='prop'&&/#\d+$/.test(o.name||''));
 if(prop)L.objects.push({...prop,id:99990,x:at.x-3*T,y:at.y+6*T,properties:[...(prop.properties||[]).filter(q=>q.name!=='when'),{name:'when',type:'string',value:'mark:seat_a'}]});
 r.fulfill({response:res,json:m});});
await p.reload();await setup();await p.waitForFunction(()=>window.__w&&window.__w.player&&window.__w.npcs.some(n=>n.shop),null,{timeout:30000});await p.waitForTimeout(1500);
for(let i=0;i<10;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});await p.waitForTimeout(200);}
const clear=async()=>{for(let i=0;i<12&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(250);}};
// everything said, line by line (each typed out in full), until the box closes
const said=async()=>{let t='';for(let i=0;i<12&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.waitForTimeout(2800);t+=' '+await p.evaluate(()=>document.querySelector('.town-dlg .town-en').textContent);await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(150);}return t;};
await clear();
await setup();   // the world scene keeps its own copy of the world: give it the keys too

// 1. the strip: the next beat's move in the corner
await p.evaluate(()=>window.__w.setGoal());await p.waitForTimeout(200);
const strip=await p.evaluate(()=>{const e=document.querySelector('.tk-strip');return e&&{t:e.textContent,stones:e.querySelectorAll('circle').length};});
check(strip&&/Move 28/.test(strip.t)&&strip.stones>=28,`the strip shows the game after move 28 (${JSON.stringify(strip)})`);
await p.locator('.tk-strip').click();await p.waitForTimeout(200);
const big=await p.evaluate(()=>(document.querySelector('.tk-record')||{}).textContent||'');
check(/Cho Hunhyun/.test(big)&&/after move 28/.test(big),`tapped, it opens large with the players (${big.slice(0,80)})`);
await p.locator('.tk-record button').click();

// 2. the record board: the position before Black 29, one right point
const rb=await p.evaluate(async()=>{const d=await tkLevelData(13,'13-c19');const w=TK.world(13),g=WorldModern.position(w,28);
 let n=0;for(const r of g)for(const v of r)if(v)n++;
 return {stones:d.p.b.length+d.p.w.length,n,ans:d.p.lines,rec:d.p.record,m29:w.record.moves[28]};});
check(rb.stones===rb.n&&rb.rec===29&&rb.ans[0][1]===rb.m29[1]&&rb.m29[0]==='B',`the board is the game after 28 moves, and its one answer is Black 29 (${JSON.stringify(rb)})`);
const wrong=await p.evaluate(async()=>{TKOverlay.open(13,'13-c19',{host:document.querySelector('.tk-map')});
 for(let i=0;i<40&&!window.__trainer;i++)await new Promise(r=>setTimeout(r,100));
 const t=window.__trainer,ans=t.p.lines[0][1];let mv=null;
 for(let y=0;y<19&&!mv;y++)for(let x=0;x<19&&!mv;x++){const s=String.fromCharCode(97+x)+String.fromCharCode(97+y);if(s!==ans&&!t.grid[y][x])mv=[x,y];}
 t.click(mv[0],mv[1]);await new Promise(r=>setTimeout(r,300));
 return {cleared:TK.cleared('13-c19'),rest:TK.restLeft('13-c19')>0,src:(document.querySelector('.tk-duel-src')||{}).textContent||''};});
check(!wrong.cleared&&wrong.rest,`a wrong point doesn't clear it, and rests the board (${JSON.stringify(wrong)})`);
check(/Black 29/.test(wrong.src),`the board names the game and the move asked (${wrong.src})`);
await p.keyboard.press('Escape');await p.waitForTimeout(500);
const right=await p.evaluate(async()=>{localStorage.removeItem('tk-rest');TKOverlay.open(13,'13-c19',{host:document.querySelector('.tk-map')});
 for(let i=0;i<40&&!(window.__trainer&&window.__trainer.alive);i++)await new Promise(r=>setTimeout(r,100));
 const t=window.__trainer,[x,y]=cIdx(t.p.lines[0][1]);t.click(x,y);await new Promise(r=>setTimeout(r,400));
 return {cleared:TK.cleared('13-c19'),elo:localStorage.getItem('tk-elo')};});
check(right.cleared,`Cho's move clears the board (${JSON.stringify(right)})`);
await p.keyboard.press('Escape');await p.waitForTimeout(500);

// 3. the audit board
await p.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/^Bag$|Bag/.test(x.textContent)&&!x.closest('.tk-bag'))?.click());await p.waitForTimeout(300);
const bag=await p.evaluate(()=>({t:(document.querySelector('.tk-bag')||{}).textContent||'',audit:!!document.querySelector('.tk-bag-audit')}));
check(/The president: water/.test(bag.t)&&bag.audit,`the bag shows a note's text and offers the audit board with two clues held (${JSON.stringify(bag).slice(0,140)})`);
await p.locator('.tk-bag-audit').click();await p.waitForTimeout(300);
const card=n=>p.locator('.tk-audit-card').nth(n);
const q1=await p.evaluate(()=>document.querySelector('.tk-audit-q').textContent);
check(/margin/.test(q1),`it asks the first question (${q1})`);
const miss=await p.evaluate(()=>[...document.querySelectorAll('.tk-audit-card')].map(c=>c.disabled));
check(miss[2]===true,'a clue not yet found is a blank card');
await card(0).click();await card(1).click();await p.waitForTimeout(200);
let a=await p.evaluate(()=>({say:document.querySelector('.tk-audit-say').textContent,q:document.querySelector('.tk-audit-q').textContent,m:WorldMarks.all(TK.world(13))}));
check(/taught them/.test(a.say)&&/Who is behind/.test(a.q)&&a.m.includes('audit-1'),`the right pair links, its answer shows, the next question comes (${JSON.stringify(a)})`);
await p.locator('.tk-audit-close').click();
await p.evaluate(()=>{WorldItems.add(TK.world(13),'icb');const s=window.__w;s.act({kind:'spot',k:'audit-table'});});await p.waitForTimeout(300);
check(await p.locator('.tk-audit').count()===1,'a spot with "opens": "audit" opens the board');
await card(0).click();await card(2).click();await p.waitForTimeout(200);
a=await p.evaluate(()=>document.querySelector('.tk-audit-say').textContent);check(/don't connect/.test(a),`a wrong pair doesn't connect (${a})`);
await card(1).click();await card(2).click();await p.waitForTimeout(200);
a=await p.evaluate(()=>({q:document.querySelector('.tk-audit-q').textContent,m:WorldMarks.all(TK.world(13)),c:window.__w.cond('mark:audit')}));
check(a.c&&/Every link/.test(a.q),`every link made: the done mark (${JSON.stringify(a)})`);
await p.locator('.tk-audit-close').click();

// 4. the trade loop
const talk=async id=>{await p.evaluate(id=>{const s=window.__w;s.act({kind:'npc',n:s.npcs.find(n=>n.id===id)});},id);await p.waitForTimeout(300);};
const chip=()=>p.evaluate(()=>(document.querySelector('.tk-trade-chip')||{}).textContent||'');
await p.evaluate(()=>window.__w.setGoal());await p.waitForTimeout(100);
check(/₩100,000/.test(await chip()),`the mission's chip shows the cash (${await chip()})`);
await talk('shopkeep');
await p.locator('.tk-shop li button').first().click();await p.waitForTimeout(100);
await p.locator('.tk-shop li button').first().click();await p.waitForTimeout(100);
const shop=await p.evaluate(()=>document.querySelector('.tk-shop-cash').textContent);
check(/₩60,000/.test(shop)&&/2 × Socks/.test(shop),`buying at the shop takes the cash and adds stock (${shop})`);
await p.locator('.tk-shop-close').click();
await talk('buyer-yes');await clear();
check(/₩90,000/.test(await chip())&&/1 × Socks/.test(await chip()),`a buyer who wants it pays (${await chip()})`);
await talk('buyer-no');const no=await said();
check(/No thanks/.test(no)&&/1 × Socks/.test(await chip()),`one who won't, refuses and keeps the stock with you (${no.slice(0,60)})`);
check(!(await p.evaluate(()=>window.__w.cond('mark:trade'))),'two offers: the mission goes on');
await talk('rival');await clear();
const done=await p.evaluate(()=>({m:window.__w.cond('mark:trade'),chip:!!document.querySelector('.tk-trade-chip')}));
check(done.m&&!done.chip,`the rival out-sells you, the third offer ends the mission, and the chip goes (${JSON.stringify(done)})`);
await talk('shopkeep');const after=await p.evaluate(()=>({shop:!!document.querySelector('.tk-shop'),dlg:(document.querySelector('.town-dlg')||{}).textContent||''}));await clear();
check(!after.shop&&/A man on the street/.test(after.dlg),'after the mission, the shop keeper just talks');

// 5. setting the room
await p.evaluate(()=>{const s=window.__w;s.act({kind:'spot',k:'seat-a'});});await p.waitForTimeout(300);
const w1=await said();
check(/tray goes here/.test(w1),`without the tray, the seat says what goes there (${w1.slice(0,50)})`);
await p.evaluate(()=>{WorldItems.add(TK.world(13),'tray');const s=window.__w;s.act({kind:'spot',k:'seat-a'});});await p.waitForTimeout(300);await clear();
const set=await p.evaluate(()=>({mark:window.__w.cond('mark:seat_a'),held:WorldItems.has(TK.world(13),'tray')}));
check(set.mark&&!set.held,`set down: the seat is marked and the tray is out of the bag (${JSON.stringify(set)})`);

// 6. English only: no Chinese on a board
const en=await p.evaluate(async()=>{const w=TK.world(13);w.lang='en';localStorage.removeItem('tk-rest');TK.undoCleared(loadProgress(),'13-c19');
 const pr=loadProgress();delete pr.tk['13-c19'];localStorage.setItem('gt-progress',JSON.stringify(pr));
 TKOverlay.open(13,'13-c19',{host:document.querySelector('.tk-map')});await new Promise(r=>setTimeout(r,800));
 const z=(document.querySelector('.tk-duel .town-zh')||{}).textContent,e=(document.querySelector('.tk-duel .town-en')||{}).textContent;w.lang=undefined;return {z,e};});
check(en.z===''&&!!en.e,`an English-only world shows no Chinese on the board (${JSON.stringify(en)})`);
await b.close();console.log(fails?`misaeng-mechanics: ${fails} failed`:'misaeng-mechanics: all ok');})();
