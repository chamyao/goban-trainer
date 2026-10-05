const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);
console.log('menu:',await p.evaluate(()=>[...document.querySelectorAll('.tk-menu-panel button')].map(b=>b.textContent).join(' | ')));
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();
await p.evaluate(()=>{WorldGuide.STUCK=1500;});
console.log('guide right away:',await p.evaluate(()=>{const g=document.querySelector('.town-guide');return !!g&&!g.hidden;}));
await p.waitForTimeout(4000);
console.log('guide after standing still (old saved setting was off):',await p.evaluate(()=>{const g=document.querySelector('.town-guide');return !!g&&!g.hidden;}));
await b.close();})();
