// Game records in the Library (app.js viewGames, data/games): the Go Seigen shelf lists his games, a search
// narrows them, and a game opens in the Review tab with all its moves.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:800}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForSelector('.book-games');
check((await p.textContent('.book-games')).includes('883 games'),'the Library has a Go Seigen book on a Game records shelf');
check((await p.locator('.book-games').count())===5&&(await p.locator('.book-games').nth(1).textContent()).includes('121 games')&&(await p.locator('.book-games').nth(2).textContent()).includes('1740 games')&&(await p.locator('.book-games').nth(3).textContent()).includes('163 games')&&(await p.locator('.book-games').nth(4).textContent()).includes('12 games'),'and Huang Longshi (121), Takemiya Masaki (1740), Honinbo Dosaku (163) and Honinbo Doteki (12) books');
await p.locator('.book-games').first().click();await p.waitForSelector('.games-row');
check(await p.locator('.games-row').count()===400&&(await p.textContent('.games-head')).includes('883 games'),'the shelf lists his games (the first 400 of 883 until searched)');
await p.fill('.games-search','Kitani 1939');await p.waitForTimeout(200);
const rows=await p.locator('.games-row').allTextContents();
check(rows.length>0&&rows.every(r=>r.includes('Kitani')&&r.includes('1939')),`a search narrows them: ${rows.length} games with Kitani in 1939`);
await p.locator('.games-row').first().click();
await p.waitForFunction(()=>location.hash.startsWith('#/review')&&Review.game&&Review.game.n>50,null,{timeout:10000});
const g=await p.evaluate(()=>({n:Review.game.n,pb:Review.game.meta.PB||(Review.game.meta.black||''),pw:Review.game.meta.PW||(Review.game.meta.white||'')}));
check(g.n>50,`it opens in the Review tab with its moves (${g.n})`);
console.log(fails?`game-records: ${fails} failed`:'game-records: all ok');await b.close();process.exit(fails?1:0);
})();
