const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const [a,b2]=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k, r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(a,b2);};
// walk to the village's way out, by taps (the camera follows, so re-aim each time)
const place=()=>p.evaluate(()=>window.__w&&window.__w.placeId);
console.log('start in',await place(),'| exits',JSON.stringify(await p.evaluate(()=>window.__w.exits.filter(e=>e.side!=='N'||e.rect.width>=16).map(e=>[e.to,e.side]))));
const out=await p.evaluate(()=>{const e=window.__w.exits.find(e=>!e.to.includes('--'));return {to:e.to,x:e.rect.centerX,y:e.rect.centerY};});
for(let i=0;i<12 && await place()==='lousang-village';i++){
  const t=await p.evaluate(o=>{const w=window.__w,P=w.player,dx=o.x-P.x,dy=o.y-P.y,d=Math.hypot(dx,dy),k=Math.min(1,90/d);return [P.x+dx*k,P.y+dy*k];},out);
  await tapW(t[0],t[1]); await p.waitForTimeout(1800);
  const talking=await p.evaluate(()=>window.__w.ui.busy());
  if(talking){console.log('blocked by a line:',await p.evaluate(()=>document.querySelector('.town-dlg .town-en')&&document.querySelector('.town-dlg .town-en').textContent));break;}
}
await ready();
console.log('after walking out:',await place());
if((await place())!=='zhuo-county'){await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();}
// tap the county office's building (above its door)
const d=await p.evaluate(()=>{const e=window.__w.exits.find(e=>e.to==='zhuo-county--office');window.__w.player.setPosition(e.rect.centerX-50,e.rect.bottom+30);return [e.rect.centerX,e.rect.centerY-24];});
await p.waitForTimeout(900);
await tapW(d[0],d[1]); 
for(let i=0;i<20&&(await place())!=='zhuo-county--office';i++) await p.waitForTimeout(300);
console.log('tapped the office building ->',await place());
await ready(); await p.waitForTimeout(600);
// inside: wander off from the door, then tap the doorway to leave
const ex=await p.evaluate(()=>{const w=window.__w,e=w.exits[0];w.player.setPosition(e.rect.centerX+40,e.rect.y-40);return {to:e.to,x:e.rect.centerX,y:e.rect.centerY};});
await p.waitForTimeout(900);
await tapW(ex.x,ex.y);
for(let i=0;i<20&&(await place())==='zhuo-county--office';i++) await p.waitForTimeout(300);
console.log('tapped the way out ->',await place(),JSON.stringify(await p.evaluate(()=>{const w=window.__w;return {busy:w.ui.busy(),cine:!!w.cine,leaving:w.leaving,p:[Math.round(w.player.x),Math.round(w.player.y)],walk:w.walk&&w.walk.path,pick:w.pick(w.exits[0].rect.centerX,w.exits[0].rect.centerY)&&'door'};})));
await ready();
// outdoors, tap the west road off the map edge (back to Lousang)
const ed=await p.evaluate(()=>{const w=window.__w,e=w.exits.find(e=>e.to==='lousang-village');w.player.setPosition(e.rect.right+60,e.rect.centerY);return {x:e.rect.centerX,y:e.rect.centerY};});
await p.waitForTimeout(1200);
await tapW(ed.x,ed.y);
for(let i=0;i<20&&(await place())==='zhuo-county';i++) await p.waitForTimeout(300);
console.log('tapped the road off the edge ->',await place());
await b.close();})();
