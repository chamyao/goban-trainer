const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const p=await b.newPage({viewport:{width:1280,height:800}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(300);};
await ready();
const places=await p.evaluate(()=>window.__w.region.quests.filter(q=>q.scene||true).map(q=>q.place));
for(const pl of [...new Set(places)]){
  await p.evaluate(pl=>{const w=window.__w;w.ui.busy=()=>false;w.cine=null;w.leaving=false;w.go(pl);},pl);await p.waitForTimeout(1200);await ready();
  const r=await p.evaluate(()=>{const w=window.__w,G=w.walkGrid(),out=[];
    for(const s of Object.values(w.spots)){ if(!s.node||s.trigger==='talk')continue; let best=1e9;
      // reachable cells from the arrival point (flood fill), feet at cell centre + 3
      const C=G.C,seen=new Set();let sx=Math.floor(w.player.x/C),sy=Math.floor((w.player.y-3)/C);if(!G.free(sx,sy)){let b2=null;for(let r=1;r<6&&!b2;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(!b2&&G.free(sx+dx,sy+dy))b2=[sx+dx,sy+dy];if(b2)[sx,sy]=b2;}const st=[[sx,sy]];
      while(st.length){const [x,y]=st.pop();const k=y*G.cols+x;if(seen.has(k)||!G.free(x,y))continue;seen.add(k);
        best=Math.min(best,Math.hypot(x*C+C/2-s.x,y*C+C/2+3-s.y));st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
      out.push(s.node+' '+Math.round(best)+'px'+(best>=36?'  <-- UNREACHABLE by walking':''));}
    return w.placeId+': '+out.join(', ');});
  console.log(r);
}
await b.close();})();
