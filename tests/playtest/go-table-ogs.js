const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const MODE=process.argv[2]||'phone';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
const ctx=await b.newContext(MODE==='phone'?{...devices['iPhone 13']}:{viewport:{width:1280,height:800}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
// a stand-in OGS: records what the table sends, and lets the test speak for the server
await p.evaluate(()=>{window.__sent=[];
  OGSPlay.loggedIn=()=>true;
  OGSPlay.ongoing=async()=>[];
  OGSPlay.connect=async()=>{ if(OGSPlay.sock) return; OGSPlay.me={id:1,username:'me'};
    OGSPlay.sock={ready:true,send(c,d){window.__sent.push([c,d]);},async request(c,d){window.__sent.push([c,d]); if(c==='game/move'){const g=OGSPlay.game;setTimeout(()=>OGSPlay.onMessage(`game/${g.id}/move`,{move_number:g.moves.length+1,move:d.move==='..'?[-1,-1]:[d.move.charCodeAt(0)-97,d.move.charCodeAt(1)-97]}),50);} return {};},close(){}};
    OGSPlay.sendSearch(); };
});
const sent=()=>p.evaluate(()=>window.__sent.map(([c,d])=>c+(d&&d.size_speed_options?' '+JSON.stringify(d.size_speed_options):'')+(d&&d.move?' '+d.move:'')));
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const [a,b2]=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);if(MODE==='phone')await p.touchscreen.tap(a,b2);else await p.mouse.click(a,b2);};
const spot=await p.evaluate(()=>{const s=Object.values(window.__w.spots).find(s=>s.use==='ogs');window.__w.player.setPosition(s.x+30,s.y+30);return [s.x,s.y];});
await p.waitForTimeout(900);
await tapW(spot[0],spot[1]); await p.waitForTimeout(2500);
console.log('seated',await p.evaluate(()=>window.__w.seated),'| panel:',await p.evaluate(()=>{const e=document.querySelector('.tk-table-panel');return e&&e.innerText.replace(/\n/g,' / ')}));
console.log('sent:',JSON.stringify(await sent()));
await p.screenshot({path:SP+`/table-${MODE}-wait.png`});
// the server finds a match
await p.evaluate(()=>{const now=Date.now();OGSPlay.onMessage('automatch/start',{uuid:OGSPlay.search.uuid,game_id:777});
  OGSPlay.onMessage('game/777/gamedata',{phase:'play',width:9,height:9,initial_player:'black',moves:[],players:{black:{id:1,username:'me',ranking:22},white:{id:2,username:'MengDe',ranking:24.6}},
    clock:{current_player:1,black_time:{thinking_time:120,periods:5,period_time:10},white_time:{thinking_time:120,periods:5,period_time:10},now,last_move:now}});});
await p.waitForTimeout(600);
console.log('arriving: hash',await p.evaluate(()=>location.hash),'| foe sprite',await p.evaluate(()=>TKTable.foe&&[TKTable.foe.who,Math.round(TKTable.foe.spr.x),Math.round(TKTable.foe.spr.y)]));
await p.screenshot({path:SP+`/table-${MODE}-arrive.png`});
for(let i=0;i<30&&!(await p.locator('.tk-table svg').count());i++) await p.waitForTimeout(200);
await p.waitForTimeout(700);
console.log('board up:',await p.locator('.tk-table svg').count(),'| text:',await p.evaluate(()=>document.querySelector('.tk-table .town-txt').innerText.replace(/\n/g,' / ')));
await p.screenshot({path:SP+`/table-${MODE}-board.png`});await p.evaluate(()=>{TKTable.ui.style.visibility='hidden'});await p.screenshot({path:SP+`/table-${MODE}-seated.png`});await p.evaluate(()=>{TKTable.ui.style.visibility=''});
// play the centre: tap point (4,4)
const bb=await p.locator('.tk-table svg').boundingBox(); const k=bb.width/400; const tapB=async(c,r)=>{const x=bb.x+(40+c*40)*k,y=bb.y+(40+r*40)*k; if(MODE==='phone')await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);};
await tapB(4,4); await p.waitForTimeout(400);
await p.evaluate(()=>OGSPlay.onMessage('game/777/move',{move_number:2,move:[2,2]}));
await p.evaluate(()=>{const now=Date.now();OGSPlay.onMessage('game/777/clock',{current_player:1,black_time:{thinking_time:110,periods:5,period_time:10},white_time:{thinking_time:115,periods:5,period_time:10},now,last_move:now});});
await p.waitForTimeout(400);
console.log('after moves: sent',JSON.stringify((await sent()).slice(-2)),'| stones',await p.evaluate(()=>document.querySelectorAll('.tk-table svg circle[fill^="url"]').length),'|',await p.evaluate(()=>document.querySelector('.tk-table .town-txt').innerText.replace(/\n/g,' / ')));
await p.screenshot({path:SP+`/table-${MODE}-play.png`});
// resign needs two taps
const res=p.locator('.tk-table button',{hasText:'Resign'}); await res.first().click(); await p.waitForTimeout(200);
console.log('resign asks again:',await p.locator('.tk-table button',{hasText:'Really'}).count());
await p.locator('.tk-table button',{hasText:'Really'}).click(); await p.waitForTimeout(200);
console.log('sent resign:',(await sent()).includes('game/resign'));
await p.evaluate(()=>{OGSPlay.onMessage('game/777/phase','finished');OGSPlay.onMessage('game/777/gamedata',Object.assign({},OGSPlay.game.data,{phase:'finished',winner:2,outcome:'Resignation',moves:[[4,4],[2,2]]}));});
await p.waitForTimeout(400);
console.log('over:',await p.evaluate(()=>document.querySelector('.tk-table .town-txt').innerText.replace(/\n/g,' / ')));
await p.locator('.tk-table button',{hasText:'Leave the table'}).click(); await p.waitForTimeout(1800);
console.log('left: seated',await p.evaluate(()=>window.__w.seated),'| board gone',!(await p.locator('.tk-table').count()),'| foe gone',await p.evaluate(()=>!TKTable.foe),'| state',await p.evaluate(()=>TKTable.state));
await p.screenshot({path:SP+`/table-${MODE}-left.png`});
await b.close();})();
