const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const SP=require('path').join(__dirname,'out');require('fs').mkdirSync(SP,{recursive:true});
async function run(b,name,ctxo){const ctx=await b.newContext(ctxo);const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/phaser.min.js',r=>r.fulfill({path:require('path').join(__dirname,'vendor/phaser.min.js'),contentType:'application/javascript'}));
await p.route('**/*.mp3',r=>r.fulfill({status:404,body:''}));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html'+(process.env.PLAYTEST_KIT?'?kit='+process.env.PLAYTEST_KIT:'')+'#/tk/1');await p.waitForTimeout(1200);
await p.evaluate(()=>{TK.markCleared('1-start');localStorage.setItem('tk-guide','off');});await p.reload();await p.waitForTimeout(1500);{const c=p.getByText('Cancel',{exact:true});if(await c.count())await c.first().click();}
for(let i=0;i<6;i++){const g=p.locator('.tk-scroll-go');if(await g.count()){await g.first().click();await p.waitForTimeout(400);}}
for(let i=0;i<60;i++){if(await p.evaluate(()=>!!(window.__w&&window.__w.player)))break;await p.waitForTimeout(200);}
await p.waitForTimeout(800);
const st=()=>p.evaluate(()=>{const m=document.querySelector('.tk-map'),r=m.getBoundingClientRect(),c=window.__w.game.canvas.getBoundingClientRect();return {full:m.classList.contains('tk-fullwin'),box:[r.width,r.height].map(Math.round),game:[window.__w.scale.width,window.__w.scale.height],canvas:[c.width,c.height].map(Math.round),win:[innerWidth,innerHeight]};});
console.log(name,'start',JSON.stringify(await st()));await p.screenshot({path:SP+`/full-${name}-a.png`});
await p.locator('.tk-menu-btn',{hasText:/Full|Exit/}).click();await p.waitForTimeout(700);
console.log(name,'toggled',JSON.stringify(await st()));await p.screenshot({path:SP+`/full-${name}-b.png`});
await ctx.close();}
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl']});
await run(b,'phone',{...devices['iPhone 13']});
await run(b,'phoneland',{...devices['iPhone 13 landscape']});
await run(b,'desk',{viewport:{width:1280,height:800}});
await b.close();})();
