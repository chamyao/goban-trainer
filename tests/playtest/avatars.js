// Avatars (avatars.js): the stories' protagonists collected by playing as them. A story board completed joins
// whoever you're playing as (TK.markCleared); boards won before: a finished book's every lead, a begun one's first;
// Jang Geu-rae is one (the intern); the collection page, the pick, the card beside the site's boards with a word on a
// result; two copies merged by union.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:850}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
// before: Book 12 finished (its last board, 12-a18: only Books 1–3 have an N-boss), Red Chamber begun
await p.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s',1);
  localStorage.setItem('gt-progress',JSON.stringify({tk:{'12-a18':1,'12-a3':1,'31-g1':1}}));});
await p.goto('http://localhost:8765/#/avatars');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.avatar-tile',{timeout:30000});
const own=await p.evaluate(()=>Object.keys(loadProgress().av.own).sort());
check(['diaochan','wangyun','lvbu','lisu','jiaxu','lijue'].every(x=>own.includes(x)),`Book 12 finished: all its leads (${own.join(', ')})`);
check(own.includes('daiyu')&&!own.includes('grannyliu'),'Red Chamber begun: Daiyu, not yet Granny Liu');
const tiles=await p.evaluate(()=>({all:document.querySelectorAll('.avatar-tile').length,locked:document.querySelectorAll('.avatar-tile.locked').length,
  jang:[...document.querySelectorAll('.avatar-tile')].filter(t=>/Jang/.test(t.title+t.textContent)).length}));
check(tiles.all>=25&&tiles.locked===tiles.all-own.length,`the collection: ${tiles.all} protagonists, ${tiles.locked} still to come as silhouettes`);
// playing: a board completed as Jang at eighteen joins the one Jang Geu-rae
await p.evaluate(async()=>{await TK.load();TK.setParty(TK.world(21),['ms_jang_young']);TK.markCleared('21-m2');});
check(await p.evaluate(()=>Avatars.owns('ms_jang')&&!loadProgress().av.own.ms_jang_young),'a board completed as Jang at eighteen: Jang Geu-rae (the one avatar)');
// the pick: the first one collected, and the card beside a board
check(await p.evaluate(()=>!!Avatars.picked()),'the first collected is picked');
await p.evaluate(()=>{const q=loadProgress();q.av.pick='diaochan';TK.saveProg(q);});
await p.evaluate(()=>location.hash='#/stream');
await p.waitForSelector('.player .avatar-stage .avatar-lead',{timeout:30000});
const lay=await p.evaluate(()=>{const l=document.querySelector('.avatar-lead'),b=document.querySelector('.avatar-stage > .board-card');const lr=l.getBoundingClientRect(),br=b.getBoundingClientRect();
  return {left:lr.left<br.left,foot:Math.abs(lr.bottom-br.bottom)<2,tall:lr.height>br.height*.6,through:getComputedStyle(l).pointerEvents==='none',src:/diaochan/.test(l.src),name:document.querySelector('.avatar-col .avatar-name').textContent};});
check(lay.left&&lay.foot&&lay.tall&&lay.through&&lay.src,`the lead at the board's bottom left, standing on its foot, big, taps passing through (${JSON.stringify(lay)})`);
await p.evaluate(()=>window.__trainer.finish('ok'));
check(!(await p.evaluate(()=>document.querySelector('.avatar-col .avatar-dlg').hidden))&&(await p.textContent('.avatar-col .avatar-say')).length>2,`a word on the result, over its head: "${await p.textContent('.avatar-col .avatar-say')}"`);
await p.keyboard.press('n');await p.waitForTimeout(800);
check(await p.evaluate(()=>!!document.querySelector('.player .avatar-lead')),'the next problem keeps it');
// a phone: the small portrait beside the box, under the board
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);
check(await p.evaluate(()=>getComputedStyle(document.querySelector('.avatar-lead')).display==='none'&&getComputedStyle(document.querySelector('.avatar-row')).display==='flex'),'on a phone: the small portrait and the box under the board');
const m=await p.evaluate(()=>Avatars.merge({own:{a:1},pick:'a'},{own:{b:1},pick:'b'}));
check(m.own.a&&m.own.b&&m.pick==='a','two copies: owned by union, this browser\'s pick');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
