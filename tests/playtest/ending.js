const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const shot=n=>p.screenshot({path:SP+'/mfr_'+n+'.png'});
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&window.__w.ui)))return;await p.waitForTimeout(200);}};
const busy=()=>p.evaluate(()=>!!(window.__w&&window.__w.ui.busy()));
const tapW=async(x,y)=>{const [a,b2]=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k, r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(a,b2);};
const act=async()=>{if(!(await p.evaluate(()=>!!window.__w&&(window.__w.ui.busy()||!!window.__w.cine))))return;const box=await p.evaluate(()=>{const r=window.__w.game.canvas.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height*0.6];});await p.touchscreen.tap(box[0],box[1]);};
const tapSpot=async node=>{const s=await p.evaluate(node=>{const s=Object.values(window.__w.spots).find(s=>s.node===node);return s&&[s.x,s.y];},node);if(s)await tapW(s[0],s[1]);};
const line=()=>p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');return d&&!d.hidden?(d.querySelector('.town-who').textContent?d.querySelector('.town-who').textContent+': ':'')+d.querySelector('.town-en').textContent:null});
const front=node=>p.evaluate(node=>{const w=window.__w;const s=Object.values(w.spots).find(s=>s.node===node);if(!s)return 'nospot';
  for(const [dx,dy,f] of [[0,14,'up'],[0,-12,'down'],[-14,2,'right'],[14,2,'left']]){w.player.setPosition(s.x+dx,s.y+dy);w.player.facing=f;const tg=w.target();if(tg&&tg.kind==='spot')return f;}return 'none';},node);
const go=async place=>{await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},place);await p.waitForTimeout(1000);await ready();await p.waitForTimeout(400);};
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1500);const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
await ready();
console.log('fresh goal:',await p.evaluate(()=>document.querySelector('.town-goal').textContent),'| next:',await p.evaluate(()=>window.__w.nextMain().node));
const beats=[['lousang-village','1-start'],['zhuo-county--office','1-c1'],['zhuo-county','1-n1'],['zhuo-county--inn','1-i1'],['the-peach-garden','1-n2'],['horse-trail','1-as'],['daxing-mountain','1-n3'],['qingzhou','1-n4'],['guangzong-road--luzhi-tent','1-t1'],['guangzong-road','1-n5'],['dong-zhuos-camp','1-n6'],['hills-of-black-wind','1-n7'],['hills-of-black-wind','1-n7b'],['yangcheng','1-boss'],['anxi--hostel','1-ax1'],['anxi','1-ax2']];
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2','1-as','1-n3','1-n4','1-t1','1-n5','1-bs','1-n6','1-n7','1-n7b'].forEach(k=>TK.markCleared(k));['pigblood','sheepblood','dogblood'].forEach(k=>WorldItems.add(TK.world(1),k));['ridge_left','ridge_right'].forEach(m=>WorldMarks.add(TK.world(1),m));});
for(const [place,node] of beats.slice(13)){
  
  if(node==='1-n6')await p.evaluate(()=>TK.markCleared('1-bs'));
  await go(place);
  console.log(`\n=== ${node} @ ${place}  face ${await front(node)}`);
  await p.evaluate(()=>{const w=window.__w;w.player.y+=10;}); await p.waitForTimeout(1200); await tapSpot(node); await p.waitForTimeout(1500); await p.waitForTimeout(200);
  const before=[];let t0=Date.now();
  for(let i=0;i<500;i++){ if(await p.locator('.tk-duel svg').count())break; const l=await line(); if(l&&before[before.length-1]!==l)before.push(l); await act(); await p.waitForTimeout(80);}
  console.log(' BEFORE ('+((Date.now()-t0)/1000).toFixed(0)+'s): '+before.map(x=>x.slice(0,90)).join('\n   '));
  await p.waitForTimeout(900);
  const who=await p.evaluate(()=>{const d=document.querySelector('.tk-duel-dlg');return d?d.querySelector('.town-who').textContent+' | '+d.querySelector('.town-en').textContent:'?'});
  console.log(' BOARD: '+who); await shot(node);
  await p.evaluate(()=>window.dispatchEvent(new CustomEvent('tczw:result',{detail:'ok'})));await p.waitForTimeout(300);
  await p.locator('.tk-duel-go').tap(); await p.waitForTimeout(500);
  const after=[];t0=Date.now();
  for(let i=0;i<600;i++){ if(!(await busy())&&!(await p.evaluate(()=>!!window.__w.cine)))break; const l=await line(); if(l&&after[after.length-1]!==l)after.push(l); if(await p.locator('.tk-scroll-go').count()){after.push('[scroll] '+await p.evaluate(()=>document.querySelector('.tk-scroll h3')&&document.querySelector('.tk-scroll h3').textContent));await p.locator('.tk-scroll-go').first().tap();} await act(); await p.waitForTimeout(80);}
  console.log(' AFTER ('+((Date.now()-t0)/1000).toFixed(0)+'s): '+after.map(x=>x.slice(0,90)).join('\n   '));
  for(let k=0;k<20;k++){await p.waitForTimeout(300);const g=p.locator('.tk-scroll-go');if(await g.count()){after.push('[scroll] '+await p.evaluate(()=>document.querySelector('.tk-scroll h3')&&document.querySelector('.tk-scroll h3').textContent));await g.first().tap();k=0;}}
  console.log(' AFTER2: '+after.filter(x=>x.startsWith('[scroll]')).join(' | '));
  console.log(' cleared',await p.evaluate(n=>TK.cleared(n),node),'goal:',await p.evaluate(()=>document.querySelector('.town-goal')&&document.querySelector('.town-goal').textContent.slice(0,60)));
}
await b.close();})();
