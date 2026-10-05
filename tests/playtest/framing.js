// Phone portrait and landscape: a room or map smaller than the screen sits in the middle of it
// (not stuck to the top with an empty band below), and on arriving Liu Bei isn't hidden under his brothers.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});let fails=0,checked=0;
for(const [label,dev] of [['portrait',devices['iPhone 13']],['landscape',devices['iPhone 13 landscape']]]){
const ctx=await b.newContext({...dev});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
// the three brothers travel together after the peach garden
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1','1-n2'].forEach(k=>TK.markCleared(k));TK.setParty({n:1},['liubei','guanyu','zhangfei']);localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
await ready();
for(const place of ['zhuo-county--inn','lousang-village--house-2','zhuo-county--office','horse-trail','the-peach-garden','zhuo-county']){
  await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},place);await p.waitForTimeout(1500);await ready();
  const r=await p.evaluate(()=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,cr=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;
    const toS=(x,y)=>[cr.left+(x-cam.worldView.x)*cam.zoom*k,cr.top+(y-cam.worldView.y)*cam.zoom*k];
    const wb=w.physics.world.bounds,[x0,y0]=toS(0,0),[x1,y1]=toS(wb.width,wb.height),P=w.player;
    const fol=w.followers.map(F=>({who:F.who,d:Math.round(Math.hypot(F.spr.x-P.x,F.spr.y-P.y)),over:F.spr.depth>P.depth}));
    return {map:[x0,y0,x1,y1].map(Math.round),cv:[cr.left,cr.top,cr.right,cr.bottom].map(Math.round),fol};});
  const [x0,y0,x1,y1]=r.map,[L,T,R,B]=r.cv,out=[];
  // smaller than the screen in a direction: the margins either side match (within 12 px)
  if(x1-x0<R-L-2&&Math.abs((x0-L)-(R-x1))>12)out.push(`not centred across: margins ${x0-L} / ${R-x1}`);
  if(y1-y0<B-T-2&&Math.abs((y0-T)-(B-y1))>12)out.push(`not centred down: margins ${y0-T} / ${B-y1}`);
  // bigger than the screen: no empty band (the map covers the screen)
  if(x1-x0>=R-L&&(x0>L+1||x1<R-1))out.push(`empty band across: map ${x0}..${x1} screen ${L}..${R}`);
  if(y1-y0>=B-T&&(y0>T+1||y1<B-1))out.push(`empty band down: map ${y0}..${y1} screen ${T}..${B}`);
  for(const f of r.fol)if(f.d<6||f.over&&f.d<14)out.push(`${f.who} ${f.d}px from Liu Bei${f.over?', drawn over him':''}`);
  checked++;if(out.length){fails++;await p.screenshot({path:SP+`/framing-${label}-${place}.png`});}
  console.log(`${out.length?'FAIL':'ok  '} ${label} ${place}: map on screen ${r.map.join(',')} (screen ${r.cv.join(',')}), brothers ${r.fol.map(f=>f.who+' '+f.d+'px').join(', ')||'none'}${out.length?' — '+out.join('; '):''}`);
}
await ctx.close();}
console.log(`checked ${checked}, failed ${fails}`);await b.close();})();
