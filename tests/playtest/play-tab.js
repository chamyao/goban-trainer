const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto((process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html#/play');await p.waitForTimeout(1500);
console.log('play tab:',(await p.locator('main, #app, body').first().innerText()).slice(0,200).replace(/\n/g,' | '));
await b.close();})();
