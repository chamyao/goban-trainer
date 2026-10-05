// A whole book on the phone by taps only, as a player does: read the goal, tap toward it (the target
// if it's on screen, else toward it at the screen's edge), tap people and spots, tap through scenes,
// solve each problem by tapping the key's moves (twice where tap-to-preview shows a ghost).
// arg: book number (default 1; book 2 starts with book 1 done). Logs the time of each beat.
// Fails on a page error, being stuck, a goal line with a count in it, or not finishing.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const BOOK=+(process.argv[2]||1),MAXMIN=+(process.env.MAXMIN||25);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices[process.env.PLAYTEST_DEVICE||'iPhone 13']});const p=await ctx.newPage();
const T0=Date.now();const ts=()=>((Date.now()-T0)/1000).toFixed(0).padStart(4)+'s';const log=(...a)=>console.log(ts(),...a);
let fails=0;const fail=w=>{fails++;log('FAIL',w);};
p.on('pageerror',e=>log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/'+BOOK;
await p.goto(URL);await p.waitForTimeout(1500);
await p.evaluate(B=>{localStorage.setItem('tk-guide','off');for(let n=1;n<B;n++)TK.world(n).nodes.forEach(x=>TK.markCleared(x.key));},BOOK);
await p.reload();await p.waitForTimeout(2000);
let shotN=0;const shot=async n=>p.screenshot({path:`${SP}/book${BOOK}-${String(++shotN).padStart(3,'0')}-${n.replace(/[^a-z0-9-]+/gi,'_').slice(0,40)}.png`});
const st=()=>p.evaluate(()=>{const w=window.__w;const q=s=>document.querySelector(s);const r={};
  r.cancel=[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Cancel'&&!b.hidden&&b.offsetParent!==null);
  r.scroll=!!q('.tk-scroll-go');r.scrollT=q('.tk-scroll h3')&&q('.tk-scroll h3').textContent;
  r.duel=!!q('.tk-duel svg');r.duelGo=!!q('.tk-duel-go');r.duelLine=q('.tk-duel-dlg .town-en')&&q('.tk-duel-dlg .town-en').textContent;r.rest=!!q('.tk-rest');
  if(!w||!w.player||!w.ui||!w.sys.isActive())return r;r.ready=true;r.place=w.placeId;r.busy=w.ui.busy();r.cine=!!w.cine;r.leaving=!!w.leaving;
  const d=q('.town-ui .town-dlg');if(d&&!d.hidden)r.line=(q('.town-ui .town-who').textContent||'')+': '+q('.town-ui .town-en').textContent;
  const g=q('.town-goal');r.goal=g&&g.textContent;
  const cam=w.cameras.main,cv=w.game.canvas,cr=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;
  const toS=(x,y)=>[cr.left+(x-cam.worldView.x)*cam.zoom*k,cr.top+(y-cam.worldView.y)*cam.zoom*k];
  r.pS=toS(w.player.x,w.player.y);r.pW=[Math.round(w.player.x),Math.round(w.player.y)];r.cv=[cr.left,cr.top,cr.width,cr.height];
  const hud=[...document.querySelectorAll('.town-goal,.tk-menu-btn')].filter(e=>e.offsetParent!==null&&!e.hidden).map(e=>e.getBoundingClientRect().bottom);r.top=Math.max(cr.top+40,...hud)+16;
  if(w.goalAt){r.gW=[w.goalAt.x,w.goalAt.y];r.gS=toS(w.goalAt.x,w.goalAt.y);}
  const nm=w.nextMain();r.next=nm&&nm.node;r.walking=!!w.walk;return r;});
const bestMove=()=>p.evaluate(()=>{const t=window.__trainer;if(!t||t.done||t.engineBusy||t.explore)return null;
  const n=t.played.length;if(n%2)return null;const memo=new Map();const open=L=>L.length-1>n&&t.played.every((m,i)=>m===L[i+1]);
  const moves=[...new Set([...t.p.lines.filter(L=>L[0]===1&&open(L)),...t.p.lines.filter(L=>L[0]===2&&open(L))].map(L=>L[n+1]))];if(!moves.length)return null;
  const best=moves.find(m=>t.outcome([...t.played,m],memo)==='ok')||moves[0];const c=best.charCodeAt(0)-97,r=best.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));
  if(!el)return {miss:best};const R=el.getBoundingClientRect();return {m:best,x:R.left+R.width/2,y:R.top+R.height/2};});
let last={},stuck=0,lastP=null,taps=0,wasted=0,duels=0,beatAt=Date.now(),beat=null;const beats=[];const seenPlace=new Set();
while((Date.now()-T0)/60000<MAXMIN){
  const s=await st();
  if(s.cancel){await p.getByText('Cancel',{exact:true}).first().tap();await p.waitForTimeout(400);continue;}
  if(s.scroll){log('[scroll]',s.scrollT);await p.locator('.tk-scroll-go').first().tap();await p.waitForTimeout(600);continue;}
  if(s.duel){
    if(!last.duel){duels++;log('[problem]',(s.duelLine||'').slice(0,60));await p.waitForTimeout(800);}
    if(s.duelGo){await p.waitForTimeout(400);await p.locator('.tk-duel-go').first().tap();await p.waitForTimeout(800);last=s;continue;}
    if(s.rest){fail('a rest after a slip: '+(s.duelLine||''));await p.evaluate(()=>{const d=TK.ls('tk-rest');for(const k in d)d[k]=Date.now()-1;TK.lsSet('tk-rest',d);});await p.waitForTimeout(1500);last=s;continue;}
    const m=await bestMove();if(m&&m.x){await p.touchscreen.tap(m.x,m.y);if(await p.evaluate(()=>!!(window.__trainer&&window.__trainer.goban.ghost)))await p.touchscreen.tap(m.x,m.y);await p.waitForTimeout(900);}
    else if(m&&m.miss){fail('the key\'s move '+m.miss+' is not on the board as shown');await p.waitForTimeout(1000);}else await p.waitForTimeout(400);
    last=s;continue;}
  if(!s.ready){await p.waitForTimeout(400);last=s;continue;}
  if(s.place!==last.place){log('== '+s.place);if(!seenPlace.has(s.place)){seenPlace.add(s.place);await p.waitForTimeout(500);await shot(s.place);}}
  if(s.goal&&s.goal!==last.goal){log('-- goal:',s.goal.slice(0,110));if(/[（(]\s*\d+\s*\/\s*\d+\s*[)）]/.test(s.goal))fail('the goal line has a count: '+s.goal);}
  if(s.next!==beat){if(beat)beats.push([beat,(Date.now()-beatAt)/1000]);beat=s.next;beatAt=Date.now();}
  if(!s.next&&!s.busy&&!s.cine){log('book complete');await shot('complete');break;}
  if(s.busy||s.cine){if(s.line&&s.line!==last.line)log('  >',s.line.slice(0,120));
    const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});
    await p.touchscreen.tap(...(box||[s.cv[0]+s.cv[2]/2,s.cv[1]+s.cv[3]*.85]));await p.waitForTimeout(350);last=s;stuck=0;continue;}
  if(s.leaving||s.walking){await p.waitForTimeout(300);last=s;continue;}
  if(!s.gS){await p.waitForTimeout(800);stuck++;if(stuck>8){fail('no goal point at '+s.place+' (next '+s.next+')');await shot('nogoal');break;}last=s;continue;}
  const moved=lastP&&Math.hypot(s.pW[0]-lastP[0],s.pW[1]-lastP[1])>3;if(lastP&&!moved){stuck++;wasted++;}else stuck=0;
  if(stuck===6){log('stuck: taps not moving him at',s.place,s.pW,'goal',s.gW);await shot('stuck-'+s.place);}
  if(stuck>20){fail('stuck at '+s.place+' '+s.pW+' going to '+s.gW);break;}
  const [L,Tp,W,H]=s.cv,m=40,top=Math.max(Tp+m,s.top);let [gx,gy]=s.gS;const on=gx>L+m&&gx<L+W-m&&gy>top&&gy<Tp+H-m;
  let tx,ty;if(on){tx=gx;ty=gy;}else{const cx=s.pS[0],cy=s.pS[1],dx=gx-cx,dy=gy-cy;let f=1;
    for(const [lim,d,c0] of [[L+m,dx,cx],[L+W-m,dx,cx],[top,dy,cy],[Tp+H-m,dy,cy]])if(d){const ff=(lim-c0)/d;if(ff>0)f=Math.min(f,ff);}tx=cx+dx*f;ty=cy+dy*f;}
  if(stuck>=2){tx+=(Math.random()-.5)*160;ty+=(Math.random()-.5)*160;}
  await p.touchscreen.tap(tx,ty);taps++;lastP=s.pW;await p.waitForTimeout(700);last=s;
}
const done=await p.evaluate(()=>!!window.__w&&!window.__w.nextMain());if(!done)fail('the book is not finished after '+MAXMIN+' min (next '+(await p.evaluate(()=>window.__w&&window.__w.nextMain()&&window.__w.nextMain().node))+')');
if(beat&&done)beats.push([beat,(Date.now()-beatAt)/1000]);
console.log('\nbeats (time from the goal appearing to the next one):');for(const [k,v] of beats)console.log(`   ${k.padEnd(8)} ${v.toFixed(0)} s`);
console.log(`book ${BOOK}: ${((Date.now()-T0)/60000).toFixed(1)} min, ${taps} walking taps (${wasted} didn't move him), ${duels} problems, ${seenPlace.size} places; ${fails} failed`);
await b.close();})();
