// Play vs the avatars, one game per avatar (apo110: "the games get synced/saved too and per avatar, so I can have
// multiple going at a time"). Checks: the earlier single game (gt-ai-game) moves into progress.aig and the lobby offers
// it; two avatars' games go at once, each answered by its own network; the lobby shows each one's move; a reload keeps
// both; Sync.mergeInto takes the later copy of each game; dropping a game for a new one.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200));});
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
const noAuth=()=>p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});   // (no username: the sign-in prompt)
await p.addInitScript(()=>{ if (localStorage.getItem('t-seeded')) return; localStorage.setItem('t-seeded','1');
  localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { lisu: 1, ms_ahn: 1 }, pick: '' } }));
  localStorage.setItem('gt-ai-game', JSON.stringify({ S: { phase: 'play', moves: [[3,3]], seq: 1, size: 19, hostColor: 1, names: {}, level: 'medium', komi: 7.5 } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(2500);
const prog=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('gt-progress')));
let g=await prog();
check(g.aig&&g.aig._&&g.aig._.S.moves.length===1&&!(await p.evaluate(()=>localStorage.getItem('gt-ai-game'))),'the earlier game moved into progress.aig');
check(await p.locator('button',{hasText:'Resume your earlier game'}).count()===1,'the lobby offers the earlier game');
const playVs=async(name,hc)=>{
  await p.goto(URL+'#/play');await p.waitForTimeout(1500);await noAuth();
  await p.locator('.ai-foe',{hasText:name}).click();
  if(hc) await p.locator('.ai-opts select').nth(1).selectOption(String(hc));
  await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(300);
};
const moveAndWait=async(c,r,n)=>{ await p.evaluate(([c,r])=>AIPlay.move(c,r),[c,r]);
  for(let i=0;i<40&&(await p.evaluate(()=>AIPlay.game.S.moves.length))<n;i++) await p.waitForTimeout(500); };
await playVs('Li Su');
check(await p.evaluate(()=>location.hash)==='#/ai/lisu','a game vs Li Su at #/ai/lisu');
await moveAndWait(3,3,2);
check((await p.evaluate(()=>AIPlay.game.S.moves.length))===2,'Li Su answered');
await playVs('Ahn Young-yi',2);
check((await p.evaluate(()=>location.hash))==='#/ai/ms_ahn','a game vs Ahn Young-yi at #/ai/ms_ahn');
for(let i=0;i<40&&(await p.evaluate(()=>AIPlay.game.S.moves.length))<1;i++) await p.waitForTimeout(500);   // (White moves first after the stones)
const ahn0=await p.evaluate(()=>({n:AIPlay.game.S.moves.length,setup:!!AIPlay.game.S.setup}));
check(ahn0.setup,'with handicap stones');
await moveAndWait(2,16,ahn0.n+2);   // (not a star point: the handicap stones are there)
g=await prog();
check(g.aig.lisu&&g.aig.ms_ahn&&g.aig.lisu.S.moves.length===2&&g.aig.ms_ahn.S.moves.length>=2,'both games kept');
await p.goto(URL+'#/play');await p.waitForTimeout(2000);await noAuth();
const tiles=await p.$$eval('.ai-foe-going',e=>e.map(x=>x.innerText.replace(/\n/g,' ')));
check(tiles.length===2&&tiles.some(t=>/Li Su.*move 3/.test(t)),'the lobby marks both, with the move: '+tiles.join(' / '));
await p.locator('.ai-foe',{hasText:'Li Su'}).click();
const rb=await p.locator('.ai-lobby button.primary').textContent();check(/^Resume vs .*Li Su$/.test(rb),'picking Li Su offers to resume ('+rb+')');
await p.reload();await p.waitForTimeout(2000);
await p.goto(URL+'#/ai/lisu');await p.waitForTimeout(1500);
check((await p.evaluate(()=>AIPlay.cur+':'+AIPlay.game.S.moves.length))==='lisu:2','after a reload, Li Su\'s game as it was');
// another device's later copy of Li Su's game, and an older copy of Ahn's
const r=await p.evaluate(()=>{const loc=loadProgress(),now=Date.now();
  const remote={aig:{lisu:{S:{...loc.aig.lisu.S,moves:[...loc.aig.lisu.S.moves,[10,10],[9,9]],seq:loc.aig.lisu.S.seq+2},at:now+1000},
                     ms_ahn:{S:{...loc.aig.ms_ahn.S,moves:[]},at:1}}};
  Sync.mergeInto(loc,remote);return {l:loc.aig.lisu.S.moves.length,a:loc.aig.ms_ahn.S.moves.length};});
check(r.l===4&&r.a>=2,'a merge takes the later copy of each game ('+JSON.stringify(r)+')');
// drop Li Su's game for a new one
p.once('dialog',d=>d.accept());
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await noAuth();
await p.locator('.ai-foe',{hasText:'Li Su'}).click();await p.locator('button',{hasText:'New game instead'}).click();await p.waitForTimeout(500);
g=await prog();
check(g.aig.lisu.S.moves.length<=1&&g.aig.ms_ahn.S.moves.length>=2,'a new game vs Li Su, Ahn\'s untouched');
await b.close();process.exit(fails?1:0);})();
