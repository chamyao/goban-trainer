// Desktop, keyboard: Enter through the opening scrolls; WASD and the arrow keys walk; E talks to the
// person in front and Enter moves the talk on; a challenger's problem: H shows a hint, U undoes, R resets,
// Escape leaves and the world takes the keys again; a won problem: Enter continues; walking off the
// map's edge with the keys goes on to the next place.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await b.newPage({viewport:{width:1280,height:800}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1500);
await p.evaluate(()=>localStorage.setItem('tk-guide','off'));
const W=(f,a)=>p.evaluate(f,a);
// the sign-in prompt (if any) is the site's, not the game's: dismiss it by its button
// (it can come up a moment after the page)
for(let i=0;i<15;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible()){await c.first().click();break;}if(i>4&&await p.locator('.tk-scroll-go').count())break;await p.waitForTimeout(300);}
// opening scrolls: Enter
let scrolls=0;for(let i=0;i<20;i++){if(!(await p.locator('.tk-scroll-go').count())){if(scrolls&&i>scrolls+3)break;await p.waitForTimeout(300);continue;}const t=await W(()=>document.querySelector('.tk-scroll h3').textContent);await p.keyboard.press('Enter');await p.waitForTimeout(500);
  if(await p.locator('.tk-scroll-go').count()&&await W(()=>document.querySelector('.tk-scroll h3').textContent)===t){check(false,'Enter on the scroll "'+t+'" does nothing');break;}scrolls++;}
check(scrolls>=1,`Enter turns the opening scrolls (${scrolls})`);
for(let i=0;i<60&&!(await W(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)));i++)await p.waitForTimeout(200);await p.waitForTimeout(1200);
// the first scene (the mulberry tree) may be talking: Enter moves it on
const busy=()=>W(()=>window.__w.ui.busy()||!!window.__w.cine);
const enterThrough=async()=>{let n=0;for(let i=0;i<200;i++){if(await p.locator('.tk-duel svg').count())return n;if(!(await busy())){if(i>8)break;await p.waitForTimeout(150);continue;}await p.keyboard.press('Enter');n++;await p.waitForTimeout(700);}return n;};
if(await busy()){const n=await enterThrough();check(!(await busy())||await p.locator('.tk-duel svg').count()>0,`Enter moves a story scene on (${n} presses)`);}
if(await p.locator('.tk-duel svg').count()){await p.keyboard.press('Escape');await p.waitForTimeout(1000);await enterThrough();}
// walking: hold each key
const P=()=>W(()=>[window.__w.player.x,window.__w.player.y]);
const walksAgain=async()=>{for(const k of ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight']){const a=await P();await p.keyboard.down(k);await p.waitForTimeout(350);await p.keyboard.up(k);await p.waitForTimeout(100);const c=await P();if(Math.hypot(c[0]-a[0],c[1]-a[1])>6)return k;}return null;};
for(const [k,dx,dy] of [['d',1,0],['a',-1,0],['s',0,1],['w',0,-1],['ArrowRight',1,0],['ArrowLeft',-1,0],['ArrowDown',0,1],['ArrowUp',0,-1]]){
  // stand on open ground with room that way
  await W(([dx,dy])=>{const w=window.__w,G=w.walkGrid();for(let y=2;y<G.rows-2;y++)for(let x=2;x<G.cols-2;x++){let ok=true;for(let s=-1;s<=6&&ok;s++)ok=G.free(x+dx*s,y+dy*s)&&G.free(x+dx*s+(dy?1:0),y+dy*s+(dx?1:0));if(ok){w.player.setPosition(x*G.C+G.C/2,y*G.C+G.C/2+3);return;}}},[dx,dy]);
  await p.waitForTimeout(200);const a=await P();await p.keyboard.down(k);await p.waitForTimeout(450);await p.keyboard.up(k);await p.waitForTimeout(100);const c=await P();
  const mv=[c[0]-a[0],c[1]-a[1]];check(mv[0]*dx+mv[1]*dy>8,`holding ${k} walks him that way (${mv.map(Math.round).join(',')})`);}
// E talks to the person in front; Enter moves the talk on and ends it
const npcAt=await W(()=>{const w=window.__w,n=w.npcs.find(n=>!n.challenge&&n.spr.visible&&!n.who);if(!n)return null;n.wander=false;w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.player.setTexture('h-liubei-up-0');return n.sprite;});
await p.waitForTimeout(300);await p.keyboard.press('e');await p.waitForTimeout(500);
check(await busy(),'E talks to the villager in front ('+npcAt+')');
const n1=await enterThrough();
if(await busy()){const diag=[];for(let i=0;i<4;i++){diag.push(await W(()=>{const d=document.querySelector('.town-ui .town-dlg');return (d&&!d.hidden?'"'+d.querySelector('.town-en').textContent.slice(0,40)+'"':'no box')+(window.__w.cine?' cine':'')+(window.__w.ui.busy()?' busy':' free');}));await p.keyboard.press('Enter');await p.waitForTimeout(800);}
  console.log('     still talking after the Enters; then:',diag.join(' > '),'> now',await busy()?'busy':'free');}
check(!(await busy()),`Enter moves the talk on and ends it (${n1} presses)`);
const k2=await walksAgain();check(!!k2&&!(await busy()),'after the talk the keys walk him again ('+k2+')');
// a challenger's problem by keys
const key=await W(()=>{const w=window.__w,n=w.npcs.find(n=>n.challenge&&!TK.cleared(n.challenge));n.wander=false;w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.player.setTexture('h-liubei-up-0');return n.challenge;});
await p.waitForTimeout(300);await p.keyboard.press('e');await p.waitForTimeout(400);await enterThrough();
check(await p.locator('.tk-duel svg').count()>0,'E and Enter bring up a challenger\'s problem ('+key+')');
await p.waitForTimeout(800);
// a right first move by mouse, then the keys
const first=await W(()=>{const t=window.__trainer,els=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')];
  for(const L of [...t.p.lines.filter(L=>L[0]===1&&L.length>3),...t.p.lines.filter(L=>L[0]<=2)]){const m=L[1],c=m.charCodeAt(0)-97,r=m.charCodeAt(1)-97;const el=els.find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));if(el){const R=el.getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2,L.length];}}return null;});
const stones=()=>W(()=>window.__trainer.grid.flat().filter(Boolean).length);
check(!!first,'a first move can be clicked on the board');const s0=await stones();if(first)await p.mouse.click(first[0],first[1]);await p.waitForTimeout(1500);const s1=await stones();
if(first&&first[2]>3&&!(await p.locator('.tk-duel-go').count())){
  await p.keyboard.press('u');await p.waitForTimeout(500);const s2=await stones();check(s2<s1,`U undoes (${s1} -> ${s2} stones)`);
  await p.mouse.click(first[0],first[1]);await p.waitForTimeout(1500);await p.keyboard.press('r');await p.waitForTimeout(500);check(await stones()===s0,'R resets the board');}
await p.keyboard.press('h');await p.waitForTimeout(1500);
check(await W(()=>!!window.__trainer.flawed),'H gives a hint (and the solve no longer counts as flawless)');
await p.keyboard.press('Escape');await p.waitForTimeout(1200);await enterThrough();
check(!(await p.locator('.tk-duel').count())&&!(await W(k=>TK.cleared(k),key)),'Escape leaves the problem; not cleared');
const k3=await walksAgain();check(!!k3,'after Escape the world takes the keys again ('+k3+')');
// win one, then Enter continues (the rest from leaving is over first)
await W(()=>{const d=TK.ls('tk-rest');for(const k in d)d[k]=Date.now()-1;TK.lsSet('tk-rest',d);});
await W(k=>{const w=window.__w,n=w.npcs.find(n=>n.challenge===k);w.player.setPosition(n.spr.x,n.spr.y+14);w.player.facing='up';w.player.setTexture('h-liubei-up-0');},key);
await p.waitForTimeout(300);await p.keyboard.press('e');await p.waitForTimeout(400);await enterThrough();await p.waitForTimeout(800);
for(let i=0;i<30;i++){if(await p.locator('.tk-duel-go').count())break;const m=await W(()=>{const t=window.__trainer;if(!t||t.done||t.engineBusy||t.played.length%2)return null;const n=t.played.length,memo=new Map(),open=L=>L.length-1>n&&t.played.every((m,i)=>m===L[i+1]);
  const ms=[...new Set(t.p.lines.filter(L=>L[0]<=2&&open(L)).map(L=>L[n+1]))];const mv=ms.find(m=>t.outcome([...t.played,m],memo)==='ok')||ms[0];if(!mv)return null;const c=mv.charCodeAt(0)-97,r=mv.charCodeAt(1)-97;
  const el=[...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e=>+e.getAttribute('cx')===t.goban.px(c)&&+e.getAttribute('cy')===t.goban.py(r));const R=el.getBoundingClientRect();return [R.left+R.width/2,R.top+R.height/2];});
  if(m){await p.mouse.click(m[0],m[1]);await p.waitForTimeout(900);}else await p.waitForTimeout(400);}
check(await p.locator('.tk-duel-go').count()>0,'solved: the Continue button is up');
await p.keyboard.press('Enter');await p.waitForTimeout(1200);await enterThrough();
check(!(await p.locator('.tk-duel').count())&&await W(k=>TK.cleared(k),key),'Enter continues after the win; cleared');
// walk off the map's edge with the keys: shut while the story hasn't opened it, then open
const edge=()=>W(()=>{const w=window.__w,G=w.walkGrid(),V={E:[1,0,'ArrowRight'],W:[-1,0,'ArrowLeft'],S:[0,1,'ArrowDown'],N:[0,-1,'ArrowUp']};
  for(const e of w.exits){if((e.side==='N'&&e.rect.width<16)||!V[e.side])continue;const [dx,dy,k]=V[e.side];
    for(const back of [40,30,24]){const x=e.rect.centerX-dx*back,y=e.rect.centerY-dy*back+3;if(G.free(Math.floor(x/G.C),Math.floor((y-3)/G.C))){w.player.setPosition(x,y);return {to:e.to,key:k,open:w.placeOpen(e.to)};}}}return null;});
const walkOff=async ex=>{await p.waitForTimeout(300);await p.keyboard.down(ex.key);let r='';for(let i=0;i<30;i++){await p.waitForTimeout(150);r=await W(to=>window.__w.placeId===to||window.__w.leaving?'went':window.__w.ui.busy()?'told':'',ex.to);if(r)break;}await p.keyboard.up(ex.key);return r;};
let ex=await edge();
if(ex&&!ex.open){const r=await walkOff(ex);await p.waitForTimeout(1500);const said=await W(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?d.querySelector('.town-en').textContent:'';});
  check(r==='told'&&/isn't open yet/.test(said),`a road the story hasn't opened stops him: "${said.slice(0,50)}"`);await enterThrough();
  await W(()=>TK.markCleared('1-start'));ex=await edge();}
if(ex){const r=await walkOff(ex);await p.waitForTimeout(1500);check(await W(to=>window.__w.placeId===to,ex.to),'holding '+ex.key+' walks off the edge to '+ex.to);}
else check(false,'no edge exit to walk off');
await p.screenshot({path:SP+'/keyboard-end.png'});
console.log(`keyboard: ${fails} failed`);await b.close();})();
