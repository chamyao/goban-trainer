// Phone: a tap on the road in front of a building walks there (doesn't go in); a tap on the building's face goes in.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1','1-i1'].forEach(k=>TK.markCleared(k));/* no story scene waiting inside a building */localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
const go=async pl=>{await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},pl);await p.waitForTimeout(1500);await ready();};
const tapW=async(x,y)=>{await p.evaluate(()=>new Promise(r=>{const w=window.__w;if(!w||!w.cameras){r();return;}const cam=w.cameras.main;let last='',same=0,n=0;const t=setInterval(()=>{const v=Math.round(cam.worldView.x)+','+Math.round(cam.worldView.y);same=v===last?same+1:0;last=v;if(same>=3||++n>40){clearInterval(t);r();}},40);}));/* the camera eases after him: tap once it has settled */const s=await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;return [r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k,r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k];},[x,y]);await p.touchscreen.tap(...s);};
await ready();
let fails=0,checked=0;
for(const place of ['lousang-village','zhuo-county']){
  await go(place);
  const doors=await p.evaluate(()=>{const w=window.__w;return w.exits.filter(e=>e.side==='N'&&e.rect.width<16&&w.placeOpen(e.to)).map(e=>({to:e.to,x:e.rect.centerX,cy:e.rect.centerY,bottom:e.rect.bottom}));});
  // (the step just below the doorway and the road beside it used to count as the door)
  for(const d of doors){
    // the road just in front of the door: stand to one side, tap it
    const iso=await p.evaluate(()=>!!window.__w.iso);   // isometric: the doorstep is drawn on the building's base, so "in front" is a little further out
    for(const [what,tx,ty,expectIn] of [['road in front',d.x,d.bottom+(iso?12:3),false],['road beside',d.x+24,d.bottom+3,false],['road beside',d.x-24,d.bottom+3,false],['building face',d.x,d.cy-30,true]]){
      if(await p.evaluate(pl=>window.__w.placeId!==pl,place))await go(place);
      const ok=await p.evaluate(([x,y])=>{const w=window.__w,G=w.walkGrid(),C=G.C;for(const dx of [40,-40,0])for(const dy of [30,50]){const px=x+dx,py=y+dy;if(G.free(Math.floor(px/C),Math.floor((py-3)/C))){w.player.setPosition(px,py);return true;}}return false;},[d.x,d.bottom+14]);
      if(!ok){console.log(`skip ${place} -> ${d.to}: no open ground near the door`);continue;}
      if(!expectIn&&!(await p.evaluate(([x,y])=>{const G=window.__w.walkGrid();return G.free(Math.floor(x/G.C),Math.floor((y+1)/G.C));},[tx,ty]))){console.log(`skip ${what} ${d.to}: not open ground`);continue;}
      // villagers are left to wander (they keep out of doorways); a tap that lands on one opens a chat: close it first
      for(let k=0;k<30&&await p.evaluate(()=>window.__w.ui.busy());k++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}
      await p.waitForTimeout(300);if(await p.locator('.tk-duel').count()){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap().catch(()=>{});await p.waitForTimeout(900);}   // a challenger's chat leads into his problem
      await p.waitForTimeout(400);
      let kind=await p.evaluate(([x,y])=>{const t=window.__w.pick(x,y);return t?t.kind:'ground';},[tx,ty]);
      // a villager wandering across the spot right then: wait for him to pass, as a player would
      for(let k=0;k<6&&kind==='npc';k++){await p.waitForTimeout(800);kind=await p.evaluate(([x,y])=>{const t=window.__w.pick(x,y);return t?t.kind:'ground';},[tx,ty]);}
      if(process.env.DEBUG_DOOR&&d.to===process.env.DEBUG_DOOR&&expectIn){p.on('console',m=>{if(m.text().startsWith('DBG'))console.log('   ',m.text());});
        console.log('    DBG target screen:',await p.evaluate(([x,y])=>{const w=window.__w,cam=w.cameras.main,cv=w.game.canvas,r=cv.getBoundingClientRect(),k=cv.clientWidth/w.scale.width;const sx=r.left+((window.__w.view?window.__w.view(x,y).x:x)-cam.worldView.x)*cam.zoom*k,sy=r.top+((window.__w.view?window.__w.view(x,y).y:y)-cam.worldView.y)*cam.zoom*k;const el=document.elementFromPoint(sx,sy);const g=document.querySelector('.town-goal').getBoundingClientRect();return JSON.stringify({sx:Math.round(sx),sy:Math.round(sy),on:el&&(el.tagName+' '+(el.getAttribute('class')||'')+' < '+(el.parentElement&&(el.parentElement.tagName+'.'+(el.parentElement.getAttribute('class')||'')))+' < '+(el.closest('[class]')&&el.closest('[class]').getAttribute('class'))+' z'+getComputedStyle(el.closest('svg')||el).zIndex),goal:[g.top,g.bottom].map(Math.round)});},[tx,ty]));
        await p.evaluate(()=>{const w=window.__w;if(w.__dbg)return;w.__dbg=1;const ta=w.tapAt.bind(w),wt=w.walkTo.bind(w);w.tapAt=(x,y)=>{console.log('DBG tapAt '+Math.round(x)+','+Math.round(y)+' canMove '+w.canMove()+' busy '+w.ui.busy()+' pick '+JSON.stringify(w.pick(x,y)&&w.pick(x,y).kind));return ta(x,y);};w.walkTo=(a,b,o)=>{const r=wt(a,b,o);console.log('DBG walkTo '+Math.round(a)+','+Math.round(b)+' -> '+r+' walk '+!!w.walk);return r;};});}
      // the walk to a door may pass a story spot, whose scene would rightly start on the way: spots aside here (spot-reach, spot-tap-once test them)
      await p.evaluate(()=>{const w=window.__w;if(!w.__noSpots){w.__noSpots=w.nearSpots;w.nearSpots=()=>{};}});
      await tapW(tx,ty);
      let inside=false;for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await p.locator('.tk-duel').count()){await p.locator('.tk-duel-key',{hasText:'Leave'}).tap().catch(()=>{});await p.waitForTimeout(900);}   // a challenger tapped: his problem, not a door
        const st=await p.evaluate(to=>!window.__w||window.__w.placeId===to?'in':window.__w.walk||window.__w.ui.busy()?'walking':'still',d.to);if(st==='in'){inside=true;break;}if(st==='still'&&i>=4)break;}
      checked++;
      const res=inside===expectIn;if(!res)fails++;
      if(!res&&inside)console.log('     state:',await p.evaluate(()=>{const w=window.__w;return w?JSON.stringify({place:w.placeId,leaving:w.leaving,busy:w.ui.busy(),cine:!!w.cine,appr:!!w.approaching,walk:!!w.walk,P:[Math.round(w.player.x),Math.round(w.player.y)]}):'no world';}));
      console.log(`${res?'ok  ':'FAIL'} ${place}: tap the ${what} ${d.to} (${tx-d.x},+${ty-d.bottom}) (picks ${kind}) -> ${inside?'went in':'stayed out'}`);
      if(!res&&!inside)console.log('   in the way:',await p.evaluate(([x,y])=>{const w=window.__w;return JSON.stringify({place:w.placeId,canMove:w.canMove(),busy:w.ui.busy(),leaving:w.leaving,appr:!!w.approaching,cine:!!w.cine,overlay:!!document.querySelector('.tk-duel'),seated:w.seated,P:[Math.round(w.player.x),Math.round(w.player.y)],walk:w.walk&&{n:w.walk.path.length,stuck:Math.round(w.walk.stuck),retries:w.walk.retries},npcs:w.npcs.filter(n=>n.spr.visible&&Math.hypot(n.spr.x-x,n.spr.y-y)<30).map(n=>[n.sprite,Math.round(n.spr.x-x),Math.round(n.spr.y-y)])});},[d.x,d.bottom]));
      if(!res)await p.screenshot({path:SP+`/door-taps-${d.to}.png`});
      if(inside){await p.waitForTimeout(800);await ready();
        // walk back out through the room's door, as a player does (no jumps between places)
        for(let k=0;k<6&&await p.evaluate(pl=>window.__w.placeId!==pl,place);k++){
          for(let j=0;j<20&&await p.evaluate(()=>window.__w.ui.busy());j++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}
          const ex=await p.evaluate(()=>{const w=window.__w,e=w.exits[0];return e?[e.rect.centerX,e.rect.centerY]:null;});if(!ex)break;
          await tapW(ex[0],ex[1]);for(let j=0;j<25;j++){await p.waitForTimeout(200);if(await p.evaluate(pl=>window.__w&&window.__w.placeId===pl&&!window.__w.leaving,place))break;}await ready();}
        if(await p.evaluate(pl=>window.__w.placeId!==pl,place)){console.log('FAIL could not walk back out of '+d.to);fails++;}
        const st=await p.evaluate(()=>({leaving:window.__w.leaving,busy:window.__w.ui.busy()}));if(st.leaving){console.log('FAIL back on the street but still "leaving": taps do nothing');fails++;}}
    }
  }
}
console.log(`checked ${checked}, failed ${fails}`);if(!checked)console.log('FAIL nothing checked');
await b.close();})();
