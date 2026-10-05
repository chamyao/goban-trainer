// Phone: a room's story scene keeps its cast on screen and on the floor (not inside a wall).
// Samples every hero sprite (feet inside a solid: furniture or wall) through the scene. (arg: kit; default the game's.) Rooms: the Zhuo inn
// and county office, the Julu house, Lu Zhi's tent, the Anxi hostel.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
const ONLY=process.argv[2];
const ROOMS0=[['zhuo-county--inn','1-i1'],['zhuo-county--office','1-c1'],['julu--house-1','1-a2'],['guangzong-road--luzhi-tent','1-t1'],['anxi--hostel','1-ax1']];
const ROOMS=ONLY?ROOMS0.filter(r=>r[0]===ONLY):ROOMS0;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});let fails=0;
for(const [room,node] of ROOMS){
  const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
  await p.evaluate(()=>localStorage.setItem('tk-guide','off'));await p.reload();await p.waitForTimeout(1500);
  for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
  for(let i=0;i<60&&!(await p.evaluate(()=>!!(window.__w&&window.__w.player)));i++)await p.waitForTimeout(200);
  await p.evaluate(node=>{const Q=window.__w.region.quests,seen=new Set(),st=[...Q.find(q=>q.node===node).after];while(st.length){const k=st.pop();if(seen.has(k))continue;seen.add(k);TK.markCleared(k);const q=Q.find(q=>q.node===k);if(q)st.push(...q.after);}
    TK.setParty({n:1},TK.cleared('1-n2')?['liubei','guanyu','zhangfei']:TK.cleared('1-n1')?['liubei','zhangfei']:['liubei']);},node);
  await p.evaluate(pl=>{window.__w.leaving=false;window.__w.go(pl);},room);
  const bad=new Map();let skipBad='';let samples=0,shot=false,sawCine=false;
  for(let i=0;i<260;i++){await p.waitForTimeout(150);if(await p.locator('.tk-duel svg').count())break;
    const r=await p.evaluate(()=>{const w=window.__w;if(!w||!w.cine||!w.cameras)return null;const cam=w.cameras.main,v=cam.worldView,G=w.walkGrid();
      const out=[];for(const o of w.children.list){if(!o.visible||!o.texture||!/^h-/.test(o.texture.key))continue;
        const who=o.texture.key.split('-')[1],x=o.x,y=o.y,on=x>=v.x-2&&x<=v.right+2&&y-o.height*.5>=v.y-2&&y<=v.bottom+2;
        // feet inside a solid (furniture, wall): the drawn bodies, not the walk grid's padding
        const inside=w.solids.getChildren().find(z=>{const bd=z.body;return x>bd.x+1&&x<bd.right-1&&y-2>bd.y&&y-2<bd.bottom;});let near=false;const cx=Math.floor(x/G.C),cy=Math.floor((y-3)/G.C);for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2&&!near;dx++)near=G.free(cx+dx,cy+dy);
        const floor=!inside&&near;
        out.push({who,x:Math.round(x),y:Math.round(y),on,floor,what:inside?(inside.frame&&inside.frame.name||inside.texture&&inside.texture.key||'a solid'):'a wall (no open ground within 2 tiles)'});}return out;});
    if(!r){if(sawCine)break;continue;}sawCine=true;samples++;
    if(r.some(a=>!a.on||!a.floor)&&!bad.size)await p.screenshot({path:SP+`/room-cast-${room}-bad.png`});
    for(const a of r)if(!a.on||!a.floor)bad.set(a.who+(a.on?'':' off screen')+(a.floor?'':' inside '+a.what),`${a.x},${a.y}`);
    if(samples===6){const sk=await p.evaluate(()=>{const b=document.querySelector('.town-skip');if(!b||b.offsetParent===null)return null;const r=b.getBoundingClientRect(),el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {box:[r.left,r.top,r.width,r.height].map(Math.round),top:el===b||b.contains(el),over:el?(el.className||el.tagName):''};});
      if(sk&&!sk.top)skipBad=`the Skip button at ${sk.box} is under "${String(sk.over).slice(0,30)}"`;}
    if(!shot&&samples===12){shot=true;await p.screenshot({path:SP+`/room-cast-${room}.png`});}
    const box=await p.evaluate(()=>{const d=document.querySelector('.town-ui .town-dlg');if(d&&!d.hidden){const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}return null;});
    if(box&&i%3===0)await p.touchscreen.tap(...box);}
  const ok=sawCine&&!bad.size&&!skipBad;if(!ok)fails++;
  console.log(`${ok?'ok  ':'FAIL'} ${room} (${node}): ${samples} samples during the scene${sawCine?'':' — NO SCENE SEEN'}${bad.size?' — '+[...bad].map(([k,v])=>k+' at '+v).join('; '):''}${skipBad?' — '+skipBad:''}`);
  await ctx.close();}
console.log(`room-cast: ${fails} failed`);await b.close();})();
