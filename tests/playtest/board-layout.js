// Decision boards in the world (Book 12, test mode), at phone, small phone, phone on its side, desktop and wide
// screen: the board, the dilemma, the dialogue, the keys and the lead's portrait don't overlap, run off screen
// or get cut off by the frame (a side column taller than the frame lost its dilemma off the top). Text under
// 12px is reported, not failed. Screenshots in out/board-*.png. KEYS: comma list (default a9~2, a14, a2, a17).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const OUT=require('path').join(__dirname,'out');let fails=0,checked=0;
const SIZES=[['phone',{...devices['iPhone 13']}],['phone-small',{...devices['Galaxy S9+'],viewport:{width:360,height:640}}],['phone-land',{...devices['iPhone 13 landscape']}],['desktop',{viewport:{width:1280,height:800}}],['wide',{viewport:{width:1920,height:1080}}]];
const KEYS=(process.env.KEYS||process.argv[2]||'12-a9~2,12-a14,12-a2,12-a17,12-a14!tall').split(',');   // !tall: the boss pinned to a tall crop (an adaptive pick can be 7 wide by 12 tall)
let TALL=null;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
for(const [name,dev] of SIZES){const ctx=await b.newContext(dev);const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
  await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
  await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html?test=1#/');await p.waitForTimeout(800);await p.evaluate(()=>TK.load());
  for(const key0 of KEYS){const key=key0.split('!')[0],base=key.split('~')[0];
    await p.evaluate(base=>{localStorage.setItem('tk-guide','off');const w=TK.world(12),ks=w.nodes.map(n=>n.key),i=ks.indexOf(base);for(const [j,n] of w.nodes.entries())if(j<i&&!['side','short'].includes(n.role))TK.markCleared(n.key);
      // the party the story has by then (its last party step), so the right lead shows
      let party=null;for(const k of ks.slice(0,i)){const sc=w.scenes&&w.scenes[(w.nodes.find(n=>n.key===k)||{}).scene];for(const s of (sc&&sc.steps)||[])if(s[0]==='party')party=s[1];}if(party)TK.setParty(w,party);},base);
    await p.evaluate(()=>{location.hash='#/tk/12';});await p.reload();
    for(let i=0;i<80;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap().catch(()=>c.first().click());const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().click().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&!window.__w.cine)))break;await p.waitForTimeout(150);}
    for(let i=0;i<30&&await p.evaluate(()=>window.__w.ui.busy());i++){await p.evaluate(()=>window.__w.ui.advance());await p.waitForTimeout(120);}
    if(key0.endsWith('!tall')){   // find a tall crop in the rated pool once (open the boss on each until one is), then pin the boss to it
      const pin=ref=>p.evaluate(([k,ref])=>{const p0=loadProgress();p0.tkElo=p0.tkElo||{r:700,n:0,used:[],slots:{}};p0.tkElo.slots=p0.tkElo.slots||{};p0.tkElo.slots[k+'~0']=ref;TK.saveProg(p0);},[key,ref]);
      const aspect=async()=>{await p.evaluate(k=>{window.__w.duel(k);},key);for(let i=0;i<40;i++){await p.waitForTimeout(200);const a=await p.evaluate(()=>{const v=document.querySelector('.tk-duel svg');const b=v&&v.viewBox.baseVal;return b&&b.width?b.height/b.width:null;});if(a)return a;}return null;};
      if(!TALL){const cands=await p.evaluate(()=>{const r=TK.world(12).rated.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r.slice(0,60).map(x=>[x[0],x[1]]);});
        for(const ref of cands){await pin(ref);const a=await aspect();if(a&&a>=1.5){TALL=ref;console.log(`     a tall crop: ${ref.join(':')} (${a.toFixed(2)} tall to 1 wide)`);break;}await p.reload();await p.waitForTimeout(1500);for(let i=0;i<30&&await p.evaluate(()=>!(window.__w&&window.__w.player));i++)await p.waitForTimeout(200);}
        if(!TALL){checked++;fails++;console.log(`FAIL ${name} ${key0}: no crop 1.5x taller than wide among 60 rated problems`);continue;}
        await p.reload();await p.waitForTimeout(1500);for(let i=0;i<30&&await p.evaluate(()=>!(window.__w&&window.__w.player));i++)await p.waitForTimeout(200);}
      await pin(TALL);}
    await p.evaluate(k=>{window.__w.duel(k);},key);
    let ok=false;for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.locator('.tk-duel svg').count()){ok=true;break;}}
    const hash=await p.evaluate(()=>location.hash);
    checked++;if(!ok){fails++;console.log(`FAIL ${name} ${key0}: no board (now at ${hash})`);continue;}
    await p.waitForTimeout(1500);
    const r=await p.evaluate(()=>{const q=s=>[...document.querySelectorAll(s)].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed');const box=e=>{const r=e.getBoundingClientRect();return {x:r.left|0,y:r.top|0,r:r.right|0,b:r.bottom|0,w:r.width|0,h:r.height|0};};
      const parts={board:q('.tk-duel svg')[0],dilemma:q('.tk-duel-dilemma')[0],dialog:q('.tk-duel-dlgrow')[0],keys:q('.tk-duel-keys')[0],lead:q('.tk-duel-lead')[0],leadsm:q('.tk-duel-lead-sm')[0],src:q('.tk-duel-src')[0]};
      const B={};for(const [k,e] of Object.entries(parts))if(e){const bx=box(e);if(bx.w&&bx.h)B[k]=bx;}
      const vw=innerWidth,vh=innerHeight,issues=[];
      const names=Object.keys(B);for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=B[names[i]],c=B[names[j]];
        if(names[i]==='dialog'&&names[j]==='leadsm'||names[j]==='dialog'&&names[i]==='leadsm')continue;   // the small portrait sits inside the dialogue row
        if([names[i],names[j]].sort().join()==='board,lead'&&+getComputedStyle(parts.lead).zIndex<+getComputedStyle(parts.board.closest('.tk-duel-board')||parts.board).zIndex)continue;   // the big portrait tucks behind the board's edge (the user's note): below it, never over it
        const ox=Math.min(a.r,c.r)-Math.max(a.x,c.x),oy=Math.min(a.b,c.b)-Math.max(a.y,c.y);if(ox>2&&oy>2)issues.push(`${names[i]} overlaps ${names[j]} (${ox}x${oy})`);}
      for(const [k,a] of Object.entries(B)){if(a.x<-1||a.r>vw+1)issues.push(`${k} off screen sideways (${a.x}..${a.r} of ${vw})`);if(a.b>vh+1&&k!=='src')issues.push(`${k} below the fold (${a.y}..${a.b} of ${vh})`);}
      // text: clipped, or too small to read
      for(const s of ['.tk-duel-dilemma','.tk-duel-dlgrow .town-en','.tk-duel-dlgrow','.tk-duel-dilemma b','.tk-duel-dilemma span']){const e=q(s)[0];if(!e)continue;
        if(e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflowY!=='visible')issues.push(`${s} clipped (${e.scrollHeight} > ${e.clientHeight})`);if(e.scrollWidth>e.clientWidth+2)issues.push(`${s} cut off sideways`);
        const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<12)issues.push(`${s} text ${fs}px`);}
      // clipped by a frame: any part hidden by an ancestor that cuts off what overflows it
      for(const [k,e] of Object.entries(parts)){if(!e)continue;const r=e.getBoundingClientRect();for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const cs=getComputedStyle(a);if(cs.overflow==='visible'&&cs.overflowY==='visible')continue;const ar=a.getBoundingClientRect();
        const cut=[ar.top-r.top,r.bottom-ar.bottom,ar.left-r.left,r.right-ar.right].map(v=>Math.max(0,v|0));if(cut.some(v=>v>2))issues.push(k+' cut off by .'+String(a.className).split(' ')[0]+' (top '+cut[0]+', bottom '+cut[1]+', left '+cut[2]+', right '+cut[3]+' px)');break;}}
      const dil=q('.tk-duel-dilemma')[0];
      return {vw,vh,B,issues,dil:dil&&dil.textContent.slice(0,60),lead:(q('.tk-duel-lead')[0]||q('.tk-duel-lead-sm')[0]||{}).src};});
    const f=`${OUT}/board-${name}-${key.replace('~','_')}.png`;await p.screenshot({path:f});
    const bad=r.issues.filter(x=>!/ text [0-9.]+px$/.test(x)),small=r.issues.filter(x=>/ text [0-9.]+px$/.test(x));if(bad.length)fails++;
    console.log(`${bad.length?'FAIL':'ok  '} ${name} ${r.vw}x${r.vh} ${key}: ${bad.length?bad.join('; '):'clear'}${small.length?' (small text: '+small.join(', ')+')':''} | dilemma "${r.dil||'none'}" | lead ${(r.lead||'none').split('/').pop().split('?')[0]} | board ${r.B.board?r.B.board.w+'x'+r.B.board.h:'?'}`);
  }
  await ctx.close();}
console.log(`board-layout: ${checked-fails}/${checked}`);await b.close();process.exit(fails?1:0);})();
