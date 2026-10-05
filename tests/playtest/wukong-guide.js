const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);
{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().tap();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().tap();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);
const mb=await p.evaluate(()=>[...document.querySelectorAll('.tk-menu-panel button')].filter(b=>!b.hidden).map(b=>b.textContent));check(!mb.some(t=>/guide|向导|Wukong|悟空/i.test(t)),'the menu has no guide switch: '+mb.join(' | '));
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();
await p.evaluate(()=>{WorldGuide.STUCK=1500;});
check(!(await p.evaluate(()=>{const g=document.querySelector('.town-guide');return !!g&&!g.hidden;})),'Wukong isn\'t there right away');
await p.waitForTimeout(4000);
check(await p.evaluate(()=>{const g=document.querySelector('.town-guide');return !!g&&!g.hidden;}),'Wukong appears after standing still a while (even with the old saved setting off)');
// under a story scroll (the Chronicle) neither the site's Wukong nor his button shows over it
await p.locator('.tk-menu-btn',{hasText:'Menu'}).tap();await p.waitForTimeout(300);await p.locator('.tk-menu-panel button',{hasText:'Chronicle'}).tap();await p.waitForTimeout(800);
const over=await p.evaluate(()=>[...document.querySelectorAll('body > canvas, .wukong-toggle, #wukong')].filter(e=>{const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.zIndex>95;}).map(e=>e.tagName+'.'+e.className+'#'+e.id+' z'+getComputedStyle(e).zIndex));
check(await p.evaluate(()=>!!document.querySelector('.tk-scroll-wrap'))&&!over.length,'with a scroll up, nothing of Wukong is drawn over it'+(over.length?': '+over.join(', '):''));
console.log(`wukong-guide: ${fails} failed`);
await b.close();})();
