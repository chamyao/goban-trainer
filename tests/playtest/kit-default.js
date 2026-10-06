// Phone: Jade is the main look. A fresh browser opens in Jade; a player who had another look saved (an old save,
// before the switch) is moved to Jade once; after that, a look chosen with the menu's art button is kept
// across reloads (the one-time switch doesn't undo it).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);return ok;};
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1';
const up=async()=>{for(let i=0;i<80;i++){const c=p.getByText('Cancel',{exact:true});if(await c.count()&&await c.first().isVisible())await c.first().tap();const g=p.locator('.tk-scroll-go');if(await g.count())await g.first().tap().catch(()=>{});if(await p.evaluate(()=>!!(window.__w&&window.__w.player&&!window.__w.leaving)))break;await p.waitForTimeout(200);}await p.waitForTimeout(500);};
const kit=()=>p.evaluate(()=>({world:window.__w&&window.__w.kit&&window.__w.kit.kit,saved:localStorage.getItem('tk-kit'),marker:localStorage.getItem('tk-kit-main')}));
await p.goto(URL);await p.waitForTimeout(800);
await p.evaluate(()=>{localStorage.clear();TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await up();
let k=await kit();check(k.world==='jade',`a fresh browser opens in Jade (${JSON.stringify(k)})`);
// an old player on another look, from before the switch
await p.evaluate(()=>{localStorage.setItem('tk-kit','xianxia');localStorage.removeItem('tk-kit-main');});await p.reload();await up();
k=await kit();check(k.world==='jade'&&k.marker==='jade',`an old Xianxia save is moved to Jade once (${JSON.stringify(k)})`);
// the player picks another look with the menu's art button
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);
const art=p.locator('.tk-menu-panel button').filter({hasText:/画风/}).first();await art.tap();await p.waitForTimeout(1500);await up();
const chosen=(await kit()).world;check(chosen&&chosen!=='jade',`the art button switches the look (now ${chosen})`);
for(let i=1;i<=2;i++){await p.reload();await up();k=await kit();check(k.world===chosen,`reload ${i}: the chosen look is kept (${JSON.stringify(k)})`);}
console.log(fails?`kit-default: ${fails} failed`:'kit-default: all ok');await b.close();process.exit(fails?1:0);})();
