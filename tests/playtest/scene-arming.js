const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start'].forEach(k=>TK.markCleared(k));});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
await ready();
const scr=(x,y)=>p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k, r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);
const tapW=async(x,y)=>{const [a,c]=await scr(x,y);await p.touchscreen.tap(a,c);};
const busy=()=>p.evaluate(()=>window.__w.ui.busy()||!!window.__w.cine);
// 1) travel straight to the county office's room (arrive 38px from its spot)
await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county--office');});await p.waitForTimeout(1500);await ready();await p.waitForTimeout(1500);
console.log('office: on arrival, scene playing?',await busy());
const s=await p.evaluate(()=>{const s=Object.values(window.__w.spots).find(s=>s.node==='1-c1');return [s.x,s.y];});
await tapW(s[0],s[1]+20); await p.waitForTimeout(1500);
console.log('office: after walking up toward the desk, scene playing?',await busy(),JSON.stringify(await p.evaluate(()=>{const w=window.__w,s=Object.values(w.spots).find(s=>s.node==='1-c1');const q=w.region.quests.find(q=>q.node==='1-c1');return {P:[Math.round(w.player.x),Math.round(w.player.y)],S:[s.x,s.y],trig:s.trigger,armed:s.armed,armAt:s.armAt,d:Math.round(Math.hypot(w.player.x-s.x,w.player.y-s.y)),open:!!w.openQuest(s),q:q?[q.place,q.room]:null};})));
// 2) travel (map) to a place whose default arrival is on the spot: mark up to n4 cleared so n5 is open
await p.evaluate(()=>{['1-c1','1-n1','1-i1','1-n2','1-as','1-n3','1-n4','1-t1'].forEach(k=>TK.markCleared(k));});
await p.evaluate(()=>{window.__w.ui.busy=()=>false;window.__w.cine=null;window.__w.leaving=false;window.__w.go('guangzong-road');});await p.waitForTimeout(1500);await ready();await p.waitForTimeout(2000);
const P0=await p.evaluate(()=>[window.__w.player.x,window.__w.player.y,Math.round(Math.hypot(window.__w.player.x-Object.values(window.__w.spots).find(s=>s.node==='1-n5').x,window.__w.player.y-Object.values(window.__w.spots).find(s=>s.node==='1-n5').y))]);
console.log('guangzong (travel): arrived',P0[2],'px from the spot; scene playing after 2 s standing?',await busy());
await tapW(P0[0]+40,P0[1]); await p.waitForTimeout(1500);
console.log('guangzong: after a few steps, scene playing?',await busy());
await b.close();})();
