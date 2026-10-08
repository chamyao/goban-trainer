// Book 13's chase ambushers (Places' layout, luoyang.tmj's "chase"): twelve soldiers in Luoyang's doorways in state
// "sword", hidden till Cao Cao rides at their line, then across the street; a touch is a board.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const URL=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(URL+'/index.html#/tk/13');await p.waitForTimeout(800);
await p.evaluate(async()=>{localStorage.clear();localStorage.setItem('tk-guide','off');await TK.load();const w=TK.world(13);for(const n of w.nodes){if(n.key==='13-c17')break;TK.markCleared(n.key);}TK.markCleared('13-start');
 localStorage.setItem('tk-world-13',JSON.stringify({place:'luoyang',party:['caocao']}));});
await p.reload();
for(let i=0;i<100;i++){const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.ui.busy())))break;await p.waitForTimeout(200);}
for(let i=0;i<10;i++){if(await p.locator('.town-dlg:not([hidden])').count())await p.keyboard.press('Enter');await p.waitForTimeout(200);}
const s1=await p.evaluate(()=>{const w=window.__w,a=(w.chase&&w.chase.amb)||[];return {place:w.placeId,chase:!!w.chase,n:a.length,hidden:a.every(x=>!x.spr.visible),riders:w.npcs.filter(n=>n.rider).length};});
check(s1.place==='luoyang'&&s1.chase&&s1.n===12&&s1.hidden&&s1.riders===0,`twelve ambushers, hidden in their doorways, no riders (${JSON.stringify(s1)})`);
for(let i=0;i<20;i++){if(!await p.evaluate(()=>window.__w.ui.busy()))break;await p.keyboard.press('Enter');await p.waitForTimeout(250);}
// hold the wave back; ride up to the jailers at the lodging's gate down the middle of the main street
await p.evaluate(()=>{const w=window.__w;w.chase.wt=-60000;const a=w.chase.amb.find(m=>m.id==='lodging');w.player.setPosition(a.post.x-8*16,a.post.y+3*16);});
let out=false,board=false;for(let i=0;i<30;i++){await p.evaluate(()=>{const w=window.__w;if(!w.engaged)w.player.setVelocity(165,0);w.player.setPosition(w.player.x+8,w.player.y);});
 const s=await p.evaluate(()=>{const a=window.__w.chase.amb.find(m=>m.id==='lodging');return {out:a.st!=='wait',vis:a.spr.visible};});if(s.out||s.vis)out=true;
 if(await p.locator('.tk-duel').count()){board=true;break;}await p.waitForTimeout(50);}
check(out,'riding along the main street, the lodging\'s jailer springs out of his gate');
console.log('     (and catches him: '+board+')');
await b.close();console.log(fails?`ambush: ${fails} failed`:'ambush: all ok');})();
