// Avatars (avatars.js): the stories' protagonists collected by playing as them. A story board completed joins
// whoever you're playing as (TK.markCleared); boards won before: a finished book's every lead, a begun one's first;
// Jang Geu-rae is one (the intern); the collection page, the pick, the card beside the site's boards with a word on a
// result; two copies merged by union.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1366,height:850}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message,(e.stack||'').split('\n').slice(1,4).join(' | '));});
// before: Book 12 finished (its last board, 12-a18: only Books 1–3 have an N-boss), Red Chamber begun
await p.addInitScript(()=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s',1);
  localStorage.setItem('gt-progress',JSON.stringify({tk:{'12-a18':1,'12-a3':1,'31-g1':1},tkUndo:{'12-a18':5,'12-a3':5}}));   /* (Book 12 since started over: still counts) */});
await p.goto('http://localhost:8765/#/avatars');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.avatar-tile',{timeout:30000});
const own=await p.evaluate(()=>Object.keys(loadProgress().av.own).sort());
check(['diaochan','wangyun','lvbu','lisu','jiaxu','lijue'].every(x=>own.includes(x)),`Book 12 finished: all its leads (${own.join(', ')})`);
check(own.includes('daiyu')&&!own.includes('grannyliu'),'Red Chamber begun: Daiyu, not yet Granny Liu');
const tiles=await p.evaluate(()=>({all:document.querySelectorAll('.avatar-tile:not(.item-tile)').length,locked:document.querySelectorAll('.avatar-tile.locked:not(.item-tile)').length,
  jang:[...document.querySelectorAll('.avatar-tile')].filter(t=>/Jang/.test(t.title+t.textContent)).length}));
check(tiles.all>=25&&tiles.locked===tiles.all-own.length,`the collection: ${tiles.all} protagonists, ${tiles.locked} still to come as silhouettes`);
// the items beside them: every board, stone set, title and hat; the ones not owned dimmed, with where they come from
const sec=await p.evaluate(()=>[...document.querySelectorAll('.cat-title')].map(e=>e.textContent));
check(['Boards','Stones','Titles',"Sun Wukong's hats"].every(t=>sec.includes(t)),`the items: ${sec.join(' / ')}`);
const locked=await p.evaluate(()=>[...document.querySelectorAll('.item-tile.locked .meta-sub')].map(e=>e.textContent));
check(locked.some(t=>/Halloween shop · .* 15/.test(t))&&locked.some(t=>/sign-in, day 5/.test(t)),`not yet owned: where from (${locked.slice(0,3).join(' | ')})`);
await p.click('.item-tile:has-text("Walnut")');
check(await p.evaluate(()=>BoardTheme.current.id==='walnut'&&!!document.querySelector('.item-tile.on')),'wearing a board from here');
// playing: a board completed as Jang at eighteen joins the one Jang Geu-rae
await p.evaluate(async()=>{await TK.load();TK.setParty(TK.world(21),['ms_jang_young']);TK.markCleared('21-m2');});
check(await p.evaluate(()=>Avatars.owns('ms_jang')&&!loadProgress().av.own.ms_jang_young),'a board completed as Jang at eighteen: Jang Geu-rae (the one avatar)');
// the pick: the first one collected, and the card beside a board
check(await p.evaluate(()=>!!Avatars.picked()),'the first collected is picked');
await p.evaluate(()=>{const q=loadProgress();q.av.pick='diaochan';TK.saveProg(q);});
await p.evaluate(()=>location.hash='#/stream');
await p.waitForSelector('.avatar-fixed:not([hidden]) .avatar-lead',{timeout:30000});
await p.waitForFunction(()=>document.querySelector('.avatar-lead').naturalWidth>0);
const lay=await p.evaluate(()=>{const l=document.querySelector('.avatar-lead'),b=document.querySelector('.board-card');const lr=l.getBoundingClientRect(),br=b.getBoundingClientRect();
  return {left:lr.right<br.left+50,foot:Math.abs(lr.bottom-innerHeight)<2,tall:lr.height>250,through:getComputedStyle(l.parentNode).pointerEvents==='none',src:/diaochan/.test(l.src)};});
check(lay.left&&lay.foot&&lay.tall&&lay.through&&lay.src,`the lead at the window's bottom left, left of the board, big, taps passing through (${JSON.stringify(lay)})`);
const y0=await p.evaluate(()=>document.querySelector('.avatar-lead').getBoundingClientRect().bottom);
await p.evaluate(()=>scrollTo(0,400));await p.waitForTimeout(200);
check(await p.evaluate(y0=>Math.abs(document.querySelector('.avatar-lead').getBoundingClientRect().bottom-y0)<1,y0),'scrolling doesn\'t move her');
await p.evaluate(()=>window.__trainer.finish('ok'));
check(!(await p.evaluate(()=>document.querySelector('.avatar-fixed .avatar-dlg').hidden))&&(await p.textContent('.avatar-fixed .avatar-say')).length>2,`a word on the result, over its head: "${await p.textContent('.avatar-fixed .avatar-say')}"`);
await p.keyboard.press('n');await p.waitForTimeout(800);
check(await p.evaluate(()=>document.querySelectorAll('.avatar-fixed').length===1&&!document.querySelector('.avatar-fixed').hidden),'the next problem keeps her (one, not another)');
// a page without a board: gone; a Play board: there
await p.evaluate(()=>location.hash='#/');await p.waitForTimeout(400);
check(await p.evaluate(()=>document.querySelector('.avatar-fixed').hidden),'the Library: not shown');
await p.evaluate(()=>{location.hash='#/play';});await p.waitForTimeout(900);
const lobby=await p.evaluate(()=>({shown:!document.querySelector('.avatar-fixed').hidden,say:document.querySelector('.avatar-fixed .avatar-say').textContent}));
check(lobby.shown&&lobby.say.length>2,`the Play screen: "what to play?" in her voice: "${lobby.say}"`);
await p.evaluate(()=>{root.append(h('div',{class:'play'},[h('div',{class:'review'},[h('div',{class:'board-card'},[]),h('aside',{},[])])]));});await p.waitForTimeout(300);
check(await p.evaluate(()=>!document.querySelector('.avatar-fixed').hidden),'a game\'s board in Play: shown');
const said=await p.evaluate(async()=>{const out=[];const g={id:'t1',phase:'play',myTurn:false,resultText:()=>''};Avatars.onGame(g);await new Promise(r=>setTimeout(r,400));out.push(document.querySelector('.avatar-fixed .avatar-say').textContent);
  Avatars.say('');Avatars.onGame(g);await new Promise(r=>setTimeout(r,400));out.push(document.querySelector('.avatar-fixed .avatar-say').textContent);
  g.phase='finished';g.resultText=()=>'You won by resignation';Avatars.onGame(g);await new Promise(r=>setTimeout(r,400));out.push(document.querySelector('.avatar-fixed .avatar-say').textContent);return out;});
check(said[0].length>2&&said[1]===''&&said[2].length>2&&said[2]!==said[0],`a game: a word as it begins (once: "${said[0]}"), and on a win: "${said[2]}"`);
await p.click('.avatar-lead');
check((await p.textContent('.avatar-fixed .avatar-say')).length>0,`tapping her: "${await p.textContent('.avatar-fixed .avatar-say')}"`);
// a phone: held to the corner too, a third of the window
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>location.hash='#/stream');await p.waitForTimeout(1500);
const ph=await p.evaluate(()=>{const l=document.querySelector(".avatar-lead").getBoundingClientRect();return {x:l.left,fx:document.querySelector(".avatar-fixed").getBoundingClientRect().left,h:l.height,bottom:Math.abs(l.bottom-innerHeight)<2,left:l.left<10,fixed:getComputedStyle(document.querySelector('.avatar-fixed')).position};});
check(ph.fixed==="fixed"&&ph.bottom&&ph.left&&ph.h>844*.25,`on a phone: held to the corner, ${Math.round(ph.h)}px tall (${JSON.stringify(ph)})`);
const m=await p.evaluate(()=>Avatars.merge({own:{a:1},pick:'a'},{own:{b:1},pick:'b'}));
check(m.own.a&&m.own.b&&m.pick==='a','two copies: owned by union, this browser\'s pick');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);
})();
