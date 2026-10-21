// The event calendar (events.js): the year's events by date (lunar festivals from the table, Easter and Thanksgiving
// computed), the shorter of two at once featured, its look when it has one; the currency paid for a first-try first
// solve once ever (and the day's first, 2 more), nothing for a hint or a repeat, 3 for a turning point found; the shop
// (a title by the name, a board in the board cycle, Sun Wukong's hat), open only in its event; two ledgers merged by
// union; the page and the Library card.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL='http://localhost:8765/';
(async()=>{
const b=await chromium.launch();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
const open=async(date)=>{const p=await b.newPage();p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
  await p.addInitScript(d=>{localStorage.setItem('gt-event-date',d);localStorage.setItem('gt-username','');},date);
  await p.goto(URL+'#/');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});await p.waitForSelector('.event-card');return p;};
const fmt=d=>new Date(d).toISOString().slice(0,10);
// Oct 21 2026: Halloween on
let p=await open('2026-10-21T12:00:00');
const cal=await p.evaluate(()=>({f:Events.featured().ev.id,season:document.body.className,
  up:Events.upcoming().map(w=>[w.ev.id,w.start.toISOString(),w.end.toISOString()]).slice(0,8)}));
check(cal.f==='halloween'&&/season-halloween/.test(cal.season),'Oct 21: Halloween is on, with its look');
const up=Object.fromEntries(cal.up.map(([id,s,e])=>[id,[s.slice(0,10),e.slice(0,10)]]));
console.log('  coming:',cal.up.map(([id,s])=>`${id} ${s.slice(5,10)}`).join(', '));
check(up.harvest&&up.harvest[0].startsWith('2026-11-1'),`Harvest around Thanksgiving (Nov 26 2026): from ${up.harvest&&up.harvest[0]}`);
check(!!up['spring-festival']&&up['spring-festival'][0]==='2027-01-30',`Spring Festival 2027 (Feb 6) from a week before: ${up['spring-festival']&&up['spring-festival'][0]}`);
check(await p.evaluate(()=>/🎃 \d+/.test(document.getElementById('eventChip').textContent)),'the header chip shows the event and the balance');
// earning
const solve=async(book,pid,flawed)=>p.evaluate(([book,pid,flawed])=>{const before=Events.balance('halloween');
  const t={book:{id:book},p:{id:pid},flawed:flawed?'a hint':null,done:null,els:{},nextBranch(){return null;},setStatus(){},render(){}};Trainer.prototype.finish.call(t,'ok');return Events.balance('halloween')-before;},[book,pid,flawed]);
check(await solve('testbook','p1',false)===3,'a first-try first solve: 1, and 2 more for the day\'s first');
check(await solve('testbook','p1',false)===0,'the same problem again: nothing');
check(await solve('testbook','p2',true)===0,'solved with a hint: nothing');
check(await solve('testbook','p3',false)===1,'the next new one: 1');
check(await p.evaluate(()=>Events.earn('tp:1:turn',3))===3,'a turning point found: 3');
// the shop
await p.evaluate(()=>{const q=loadProgress();q.ev.earn.halloween.gift=50;TK.saveProg(q);});
await p.evaluate(()=>location.hash='#/events');await p.waitForSelector('.event-item');
const items=await p.$$eval('.event-item .t',e=>e.map(x=>x.textContent));
check(items.length===3,`the Halloween shop: ${items.join(' / ')}`);
const bal0=await p.evaluate(()=>Events.balance('halloween'));
check(await p.evaluate(()=>Events.buy('title-pumpkin-king')&&Events.buy('board-haunted')&&Events.buy('hat-witch')),'buy all three');
check(await p.evaluate(()=>Events.balance('halloween'))===bal0-50,'the prices come off the balance');
check(await p.evaluate(()=>BoardTheme.current.id==='haunted'&&BoardTheme.all().some(t=>t.id==='haunted')),'the Haunted board is on and in the board cycle');
await p.evaluate(()=>{localStorage.setItem('gt-username','tester');Sync.username='tester';Sync.renderChip();});
check(/Pumpkin King/.test(await p.textContent('#authChip')),`the title by the name: "${await p.textContent('#authChip')}"`);
check(await p.evaluate(()=>Events.equipped('hat')&&Events.equipped('hat').id==='hat-witch'),'Sun Wukong wears the hat');
await p.evaluate(()=>{Sync.username=null;localStorage.removeItem('gt-username');});
// merge: earnings and items by union
const m=await p.evaluate(()=>Events.merge({earn:{halloween:{a:1}},own:{x:1},eq:{hat:'x'}},{earn:{halloween:{b:2},harvest:{c:1}},own:{y:1},eq:{hat:'y',title:'t'}}));
check(m.earn.halloween.a===1&&m.earn.halloween.b===2&&m.earn.harvest.c===1&&m.own.x&&m.own.y&&m.eq.hat==='x'&&m.eq.title==='t','two ledgers merge: earnings and items by union, what\'s worn this browser\'s');
await p.close();
// Feb 12 2027: Spring Festival and Valentine's both on; the shorter is featured; no look painted yet: Classic
p=await open('2027-02-12T12:00:00');
const fe=await p.evaluate(()=>({f:Events.featured().ev.id,on:Events.active().map(w=>w.ev.id),cls:document.body.className}));
check(fe.f==='valentines'&&fe.on.includes('spring-festival')&&!/season-/.test(fe.cls),`Feb 12 2027: ${fe.on.join(' + ')} on, ${fe.f} featured, no look yet`);
check(await p.evaluate(()=>!Events.buy('title-pumpkin-king')),'the Halloween shop is closed out of its event');
await p.evaluate(()=>location.hash='#/events');await p.waitForSelector('.event-row');
check(/Valentine/.test(await p.textContent('.event-hero')),'the page leads with what\'s on');
await p.close();
// between events
p=await open('2026-11-08T12:00:00');
check(await p.evaluate(()=>Events.featured()===null&&document.getElementById('eventChip').textContent.includes('Events')),'Nov 8: between events, the chip offers the calendar');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
