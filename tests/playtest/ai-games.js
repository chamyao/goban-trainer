// Play vs the avatars, one game per avatar (apo110: "the games get synced/saved too and per avatar, so I can have
// multiple going at a time"). Checks: the earlier single game (gt-ai-game) moves into progress.aig and the lobby offers
// it; two avatars' games go at once, each answered by its own network; the lobby shows each one's move; a reload keeps
// both; Sync.mergeInto takes the later copy of each game; dropping a game for a new one. Promotion (apo110: "beat 6k at
// 3 stones 2/3 times to promote one rank", "no demotion"): the handicap set from your rank, two wins promote, two
// losses start a new series, a game for the old rank doesn't count, the rank merges by its later copy.
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
const playVs=async(name)=>{
  await p.goto(URL+'#/play');await p.waitForTimeout(1500);await noAuth();
  await p.locator('.ai-foe',{hasText:name}).click();
  await p.locator('.ai-lobby button.primary').click();await p.waitForTimeout(300);
};
const n=()=>p.evaluate(()=>AIPlay.game.S.moves.length);
const myTurn=async()=>{for(let i=0;i<40&&!(await p.evaluate(()=>AIPlay.game.myTurn&&!AIPlay.thinking));i++) await p.waitForTimeout(500);};
// our move, then the avatar's answer (after the handicap stones White moves first: its move comes before ours)
const moveAndWait=async(c,r)=>{ await myTurn(); const k=await n(); await p.evaluate(([c,r])=>AIPlay.move(c,r),[c,r]);
  for(let i=0;i<40&&(await n())<k+2;i++) await p.waitForTimeout(500); return n(); };
await playVs('Li Su');
check(await p.evaluate(()=>location.hash)==='#/ai/lisu','a game vs Li Su at #/ai/lisu');
const liS=await p.evaluate(()=>({d:AIPlay.game.S.promo.d,tier:AIPlay.game.S.tier,setup:(AIPlay.game.S.setup||[]).length,me:AIPlay.game.myColor,komi:AIPlay.game.S.komi}));
check(liS.d===-1&&liS.tier==='10k'&&liS.setup===0&&liS.me===2&&liS.komi===0.5,'at 10k, for 9k: Li Su\'s 10k version (closer to even than the 5k one at 4 stones), you White, komi 0.5 '+JSON.stringify(liS));
const liN=await moveAndWait(2,16);
check(liN===3,'Li Su answered');
await playVs('Ahn Young-yi');
check((await p.evaluate(()=>location.hash))==='#/ai/ms_ahn','a game vs Ahn Young-yi at #/ai/ms_ahn');
for(let i=0;i<40&&(await p.evaluate(()=>AIPlay.game.S.moves.length))<1;i++) await p.waitForTimeout(500);   // (White moves first after the stones)
const ahn0=await p.evaluate(()=>({n:AIPlay.game.S.moves.length,setup:!!AIPlay.game.S.setup}));
const ahnT=await p.evaluate(()=>AIPlay.game.S.tier);check(ahnT==='10k'&&!ahn0.setup,'Ahn\'s 10k version too');
await moveAndWait(2,16);   // (not a star point: the handicap stones are there)
g=await prog();
check(g.aig.lisu&&g.aig.ms_ahn&&g.aig.lisu.S.moves.length===3&&g.aig.ms_ahn.S.moves.length>=2,'both games kept');
await p.goto(URL+'#/play');await p.waitForTimeout(2000);await noAuth();
const tiles=await p.$$eval('.ai-foe-going',e=>e.map(x=>x.innerText.replace(/\n/g,' ')));
check(tiles.length===2&&tiles.some(t=>/Li Su.*move 4/.test(t)),'the lobby marks both, with the move: '+tiles.join(' / '));
await p.locator('.ai-foe',{hasText:'Li Su'}).click();
const rb=await p.locator('.ai-lobby button.primary').textContent();check(/^Resume vs .*Li Su$/.test(rb),'picking Li Su offers to resume ('+rb+')');
await p.reload();await p.waitForTimeout(2000);
await p.goto(URL+'#/ai/lisu');await p.waitForTimeout(1500);
check((await p.evaluate(()=>AIPlay.cur+':'+AIPlay.game.S.moves.length))==='lisu:3','after a reload, Li Su\'s game as it was');
// another device's later copy of Li Su's game, and an older copy of Ahn's
const r=await p.evaluate(()=>{const loc=loadProgress(),now=Date.now();
  const remote={aig:{lisu:{S:{...loc.aig.lisu.S,moves:[...loc.aig.lisu.S.moves,[10,10],[9,9]],seq:loc.aig.lisu.S.seq+2},at:now+1000},
                     ms_ahn:{S:{...loc.aig.ms_ahn.S,moves:[]},at:1}}};
  Sync.mergeInto(loc,remote);return {l:loc.aig.lisu.S.moves.length,a:loc.aig.ms_ahn.S.moves.length};});
check(r.l===5&&r.a>=2,'a merge takes the later copy of each game ('+JSON.stringify(r)+')');
// drop Li Su's game for a new one
p.once('dialog',d=>d.accept());
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await noAuth();
await p.locator('.ai-foe',{hasText:'Li Su'}).click();await p.locator('button',{hasText:'New game instead'}).click();await p.waitForTimeout(500);
g=await prog();
check(g.aig.lisu.S.moves.length<=1&&g.aig.ms_ahn.S.moves.length>=2,'a new game vs Li Su, Ahn\'s untouched');
// Undo (apo110: "add an undo button"): your last move and the reply come off; one taken back while it thinks drops its move
await p.goto(URL+'#/ai/lisu');await p.waitForTimeout(800);
await moveAndWait(2,2);const n0=await n();
const u1=await p.evaluate(async()=>{const before=AIPlay.game.S.moves.length;AIPlay.undo();return {before,after:AIPlay.game.S.moves.length,mine:AIPlay.game.myTurn,btn:[...document.querySelectorAll('.rv-actions button')].map(b=>b.textContent).join('|')};});
check(u1.after===u1.before-2&&u1.mine&&/Undo/.test(u1.btn),'Undo takes back your move and its reply: '+JSON.stringify(u1));
const u2=await p.evaluate(async()=>{AIPlay.move(16,2);const k=AIPlay.game.S.moves.length;AIPlay.undo();await new Promise(r=>setTimeout(r,6000));
  return {k,after:AIPlay.game.S.moves.length,mine:AIPlay.game.myTurn,thinking:AIPlay.thinking};});
check(u2.after===u2.k-1&&u2.mine&&!u2.thinking,'Undo while it thinks: its move is dropped, your turn '+JSON.stringify(u2));
// apo110's misclicked loss comes off once
const fx=await p.evaluate(()=>{const keep=AIRank.get();Sync.username='apo110';AIRank.put({kyu:10,series:[true,false]});aiLobby();const a=AIRank.get(),first=a.series.join();
  a.series.push(false);AIRank.put(a);aiLobby();const b=AIRank.get();Sync.username='';AIRank.put(keep);return [first,b.series.join()];});   // (username cleared before the save's 3 s: nothing sent)
check(fx[0]==='true'&&fx[1]==='true,false','apo110\'s last loss cleared once ('+fx.join(' / ')+')');
// promotion: finish games as won or lost
const finish=(won)=>p.evaluate(w=>{AIPlay.change(S=>{S.phase='finished';S.result={winner:w?S.hostColor:3-S.hostColor,how:'resignation'};});return [AIRank.get(),AIPlay.status];},won);
await p.goto(URL+'#/ai/lisu');await p.waitForTimeout(1000);
let [rk,stt]=await finish(true);check(rk.kyu===10&&rk.series.join()==='true','a win toward 9k: '+stt);
await playVs('Li Su');[rk,stt]=await finish(false);check(rk.kyu===10&&rk.series.join()==='true,false','then a loss: '+stt);
await playVs('Li Su');
const stale=await p.evaluate(()=>AIPlay.cur);   // (this one we leave open: it's for 9k)
await playVs('Ahn Young-yi');   // (Ahn's game still going: resumes, for 9k)
await p.goto(URL+'#/play');await p.waitForTimeout(800);await noAuth();
await p.locator('.ai-foe',{hasText:'Ahn'}).click();p.once('dialog',d=>d.accept());await p.locator('button',{hasText:'New game instead'}).click();await p.waitForTimeout(400);
[rk,stt]=await finish(true);check(rk.kyu===9&&rk.series.length===0,'two wins of three: promoted to 9k ('+stt+')');
const set=await p.evaluate(()=>AIRank.setting('ms_ahn'));check(set.target===8&&set.d===2&&set.tier==='7k','at 9k, Ahn for 8k: the 6k version at 2 stones (a tie with giving 2 to the 10k one: stones taken first) '+JSON.stringify(set));
await p.goto(URL+'#/play');await p.waitForTimeout(1200);await noAuth();
const rt=await p.locator('.ai-rank').innerText();check(/Your rank: 9k/.test(rt)&&/promotion to 8k/.test(rt),'the lobby: '+rt.replace(/\n/g,' '));
await p.goto(URL+'#/ai/lisu');await p.waitForTimeout(800);[rk,stt]=await finish(true);
check(rk.kyu===9&&rk.series.length===0,'a game started for 9k, won after the promotion: not counted');
await playVs('Li Su');[rk]=await finish(false);await playVs('Li Su');[rk,stt]=await finish(false);
check(rk.kyu===9&&rk.series.length===0,'two losses: a new series, no demotion ('+stt+')');
const mg=await p.evaluate(()=>{const a={kyu:9,series:[],at:5},b={kyu:8,series:[true],at:9};return [AIRank.merge(a,b).kyu,AIRank.merge(b,a).kyu];});
check(mg.join()==='8,8','the rank merges by its later copy');
await b.close();process.exit(fails?1:0);})();
