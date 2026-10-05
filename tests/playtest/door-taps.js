// Phone: a tap on the road in front of a building walks there (doesn't go in); a tap on the building's face goes in.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
const go=async pl=>{await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},pl);await p.waitForTimeout(1500);await ready();};
const tapW=async(x,y)=>{const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+(x-cam.worldView.x)*cam.zoom*k,r.top+(y-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
await ready();
let fails=0,checked=0;
for(const place of ['lousang-village','zhuo-county']){
  await go(place);
  const doors=await p.evaluate(()=>{const w=window.__w;return w.exits.filter(e=>e.side==='N'&&e.rect.width<16&&w.placeOpen(e.to)).map(e=>({to:e.to,x:e.rect.centerX,cy:e.rect.centerY,bottom:e.rect.bottom}));});
  // (the step just below the doorway and the road beside it used to count as the door)
  for(const d of doors){
    // the road just in front of the door: stand to one side, tap it
    for(const [what,tx,ty,expectIn] of [['road in front',d.x,d.bottom+3,false],['road beside',d.x+24,d.bottom+3,false],['road beside',d.x-24,d.bottom+3,false],['building face',d.x,d.cy-30,true]]){
      if(await p.evaluate(pl=>window.__w.placeId!==pl,place))await go(place);
      const ok=await p.evaluate(([x,y])=>{const w=window.__w,G=w.walkGrid(),C=G.C;for(const dx of [40,-40,0])for(const dy of [30,50]){const px=x+dx,py=y+dy;if(G.free(Math.floor(px/C),Math.floor((py-3)/C))){w.player.setPosition(px,py);return true;}}return false;},[d.x,d.bottom+14]);
      if(!ok){console.log(`skip ${place} -> ${d.to}: no open ground near the door`);continue;}
      if(!expectIn&&!(await p.evaluate(([x,y])=>{const G=window.__w.walkGrid();return G.free(Math.floor(x/G.C),Math.floor((y+1)/G.C));},[tx,ty]))){console.log(`skip ${what} ${d.to}: not open ground`);continue;}
      await p.waitForTimeout(400);
      const kind=await p.evaluate(([x,y])=>{const t=window.__w.pick(x,y);return t?t.kind:'ground';},[tx,ty]);
      await tapW(tx,ty);
      let inside=false;for(let i=0;i<40;i++){await p.waitForTimeout(200);const st=await p.evaluate(to=>!window.__w||window.__w.placeId===to||window.__w.leaving?'in':window.__w.walk?'walking':'still',d.to);if(st==='in'){inside=true;break;}if(st==='still'&&i>=4)break;}
      checked++;
      const res=inside===expectIn;if(!res)fails++;
      console.log(`${res?'ok  ':'FAIL'} ${place}: tap the ${what} ${d.to} (${tx-d.x},+${ty-d.bottom}) (picks ${kind}) -> ${inside?'went in':'stayed out'}`);
      if(!res&&!inside)console.log('   in the way:',await p.evaluate(([x,y])=>{const w=window.__w;return JSON.stringify({P:[Math.round(w.player.x),Math.round(w.player.y)],walk:w.walk&&{n:w.walk.path.length,stuck:Math.round(w.walk.stuck),retries:w.walk.retries},npcs:w.npcs.filter(n=>n.spr.visible&&Math.hypot(n.spr.x-x,n.spr.y-y)<30).map(n=>[n.sprite,Math.round(n.spr.x-x),Math.round(n.spr.y-y)])});},[d.x,d.bottom]));
      if(!res)await p.screenshot({path:SP+`/door-taps-${d.to}.png`});
      if(inside){await p.waitForTimeout(800);await ready();}
    }
  }
}
console.log(`checked ${checked}, failed ${fails}`);if(!checked)console.log('FAIL nothing checked');
await b.close();})();
