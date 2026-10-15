// Play a friend on phones (the user: "does this work on mobile"): an iPhone hosts, a Pixel joins from Open games by a tap,
// and a 19×19 move takes two taps (before: four, the board's confirm and the game's own both asking).
const root=require('child_process').execSync('npm root -g').toString().trim();
const { chromium, devices } = require(root+'/playwright');const { ExpressPeerServer } = require(root+'/peer');const express=require(root+'/peer/node_modules/express');
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
(async()=>{const app=express(),srv=app.listen(9125,'127.0.0.1');app.use('/p',ExpressPeerServer(srv,{path:'/'}));
const b=await chromium.launch({args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
const dev=async(d)=>{const c=await b.newContext(d);const p=await c.newPage();p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});p.on('dialog',x=>x.accept());await p.addInitScript(()=>{window.FRIEND_PEER_OPTS={host:'127.0.0.1',port:9125,path:'/p',secure:false,config:{iceServers:[]}};});return p;};
const A=await dev(devices['iPhone 13']),B=await dev(devices['Pixel 7']);
await A.goto((process.env.PLAYTEST_URL||'http://localhost:8765/')+'#/play');await A.evaluate(()=>{document.getElementById('authModalBackdrop').hidden=true;});await A.waitForSelector('.friend-lobby');
await A.selectOption('.friend-lobby select[name=color]','black');await A.tap('.host-friend');await A.waitForSelector('.friend-link');
await B.goto((process.env.PLAYTEST_URL||'http://localhost:8765/')+'#/play');await B.evaluate(()=>{document.getElementById('authModalBackdrop').hidden=true;});
await B.waitForSelector('.friend-game',{timeout:20000});await B.tap('.friend-game');
await A.waitForFunction(()=>FriendPlay.game.phase==='play',null,{timeout:20000});await A.waitForTimeout(500);
const pt=i=>A.locator('.board-card svg [cursor=pointer]').nth(i);
let taps=0;for(;taps<6;){const bx=await pt(3*19+15).boundingBox();await A.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);taps++;await A.waitForTimeout(250);if(await A.evaluate(()=>FriendPlay.game.S.moves.length))break;}
check(taps===2,`a 19×19 move on an iPhone takes two taps (a ghost stone, then the stone): ${taps}`);
check(await B.waitForFunction(()=>FriendPlay.game.S.moves.length===1,null,{timeout:5000}).then(()=>true,()=>false),'it crosses to the Pixel');
await b.close();srv.close();console.log(fails?`friend-mobile: ${fails} failed`:'friend-mobile: all ok');process.exit(fails?1:0);})();
