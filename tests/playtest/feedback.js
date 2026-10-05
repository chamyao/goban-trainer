// Desktop, keys: the feedback box in the game menu. Typing "wasd" and Enter in it doesn't walk Liu Bei
// or talk; Enter sends (fetch stubbed, nothing really sent) a payload with the message and a context
// string naming the book and place; the menu stays open; an empty box asks for words and sends nothing;
// Shift+Enter is a new line, not a send. After the menu closes, D walks him again.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['Desktop Chrome']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.route(/script\.google(usercontent)?\.com/,r=>r.fulfill({status:200,body:'{}'}));   // never reaches the real sheet
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{['1-start','1-c1','1-n1'].forEach(k=>TK.markCleared(k));localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
for(let i=0;i<6;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().click();const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
const ready=async()=>{for(let i=0;i<75;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving&&window.__w.sys.isActive())))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
await ready();
await p.evaluate(()=>{window.__w.leaving=false;window.__w.go('zhuo-county');});await p.waitForTimeout(1500);await ready();
await p.evaluate(()=>{window.__fb=[];const f=window.fetch;window.fetch=(u,o)=>{if(String(u)===Sync.API_URL){window.__fb.push(JSON.parse(o.body));return Promise.resolve(new Response('{}',{status:200}));}return f(u,o);};});
const state=()=>p.evaluate(()=>{const w=window.__w;return {x:Math.round(w.player.x),y:Math.round(w.player.y),busy:w.ui.busy(),place:w.placeId,open:!document.querySelector('.tk-menu-panel').hidden,fb:window.__fb,ta:document.querySelector('.tk-fb-text').value,msg:document.querySelector('.tk-fb-msg').textContent};});
await p.locator('.tk-menu-btn',{hasText:'Menu'}).click();await p.waitForTimeout(300);
const ta=p.locator('.tk-fb-text');check(await ta.isVisible(),'the feedback box is in the open menu');
const s0=await state();
await ta.click();await p.keyboard.type('wasd');await p.keyboard.down('d');await p.waitForTimeout(500);await p.keyboard.up('d');await p.keyboard.press('Enter');await p.waitForTimeout(800);
const s1=await state();
check(s1.x===s0.x&&s1.y===s0.y,`typing "wasd" doesn't walk him (${s0.x},${s0.y} -> ${s1.x},${s1.y})`);
check(!s1.busy,'Enter in the box doesn\'t start talk');
check(s1.fb.length===1,`Enter sends once (${s1.fb.length} sent)`);
const pl=s1.fb[0]||{},d=pl.data||{};
check(pl.kind==='feedback'&&/^wasdd+$/.test(d.message||''),`the payload carries the message: ${JSON.stringify(d.message)}`);
check(typeof d.context==='string'&&d.context.includes('Book 1')&&d.context.includes(s0.place),'the context names the book and place: '+String(d.context).slice(0,160));
check(s1.open,'the menu stays open after sending');
check(s1.ta===''&&/Sent/.test(s1.msg),`the box clears and says so ("${s1.msg}")`);
// empty: asks for words, sends nothing
await p.locator('.tk-fb-row button').click();await p.waitForTimeout(300);
const s2=await state();check(s2.fb.length===1&&/Write something/.test(s2.msg),`an empty box asks for words and sends nothing ("${s2.msg}")`);
// Shift+Enter: a new line
await ta.click();await p.keyboard.type('line one');await p.keyboard.press('Shift+Enter');await p.keyboard.type('two');await p.waitForTimeout(300);
const s3=await state();check(s3.fb.length===1&&s3.ta==='line one\ntwo','Shift+Enter is a new line, not a send');
// closing the menu gives the keys back
await p.locator('.tk-menu-btn',{hasText:'Menu'}).click();await p.waitForTimeout(300);
await p.waitForTimeout(500);
// D, or A if a wall is to his right
const a=await state();let z=a;for(const k of ['d','a']){await p.keyboard.down(k);await p.waitForTimeout(500);await p.keyboard.up(k);await p.waitForTimeout(200);z=await state();if(z.x!==a.x||z.y!==a.y)break;}
check(z.x!==a.x||z.y!==a.y,`after the menu closes, the keys walk him (${a.x},${a.y} -> ${z.x},${z.y})`);
console.log(fails?`feedback: ${fails} failed`:'feedback: all ok');await b.close();process.exit(fails?1:0);})();
