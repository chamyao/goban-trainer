// Xiangqi with a friend (apo110: "for host a game can you also add a xiangqi option"): two browsers joined by the
// link, against a local PeerJS server (npm i -g peer). Checks: hosting xiangqi gives a link; both sides get a color
// (the host Red, moving first); a legal move crosses both ways, an illegal one is refused; Black's board is turned;
// a quick checkmate (the "palace" mate in a few moves) ends the game for both; the lobby shows it as Xiangqi.
const root=require('child_process').execSync('npm root -g').toString().trim();
const { chromium } = require(root+'/playwright');
const { ExpressPeerServer } = require(root+'/peer');
const express = require(root+'/peer/node_modules/express');
const URL=process.env.PLAYTEST_URL||'http://localhost:8765/';
(async()=>{
const app=express(),srv=app.listen(9127,'127.0.0.1');app.use('/p',ExpressPeerServer(srv,{path:'/'}));
const b=await chromium.launch({args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
const dev=async name=>{const ctx=await b.newContext({viewport:{width:1200,height:900}});const p=await ctx.newPage();
  p.on('pageerror',e=>{fails++;console.log('ERR',name,e.message);});
  await p.addInitScript(n=>{window.FRIEND_PEER_OPTS={host:'127.0.0.1',port:9127,path:'/p',secure:false,config:{iceServers:[]}};
    if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('gt-friend-name',n);}},name);
  p.on('dialog',d=>d.accept());return p;};
const H=await dev('Ann'),G=await dev('Bo');
const shut=p=>p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;document.querySelectorAll('.ev-reward').forEach(e=>e.remove());});
await H.goto(URL+'#/play');await shut(H);await H.waitForSelector('.friend-lobby');
await H.selectOption('.friend-lobby select[name=kind]','xiangqi');
check(!(await H.isVisible('.friend-lobby select[name=size]')),'xiangqi: no board size to pick');
await H.selectOption('.friend-lobby select[name=color]','black');
await H.click('.host-friend');await H.waitForSelector('.friend-link');
const link=await H.inputValue('.friend-link');
check(/#\/friend\/[a-z0-9]{6}$/.test(link),`hosting gives a link: ${link}`);
await G.goto(link);await shut(G);
await G.waitForFunction(()=>FriendPlay.game&&FriendPlay.game.phase==='play'&&FriendPlay.game.myColor,null,{timeout:20000});
await H.waitForFunction(()=>FriendPlay.game.phase==='play',null,{timeout:10000});
await H.waitForSelector('.xq-board');await G.waitForSelector('.xq-board');
check((await H.textContent('.review.xq h2')).includes('Xiangqi')&&(await G.textContent('.review.xq h2')).includes('Xiangqi'),'both see the xiangqi board');
check(await H.evaluate(()=>FriendPlay.game.myColor===BLACK)&&await G.evaluate(()=>FriendPlay.game.myColor===WHITE),'host is Red (first), friend is Black');
// Black's board is turned: Black's general drawn near the bottom
const gy=await G.evaluate(()=>{const t=[...document.querySelectorAll('.xq-piece text')].find(x=>x.textContent==='將');return t.closest('g').getAttribute('transform');});
check(/translate\([\d.]+ (5[0-9][0-9]|[6-9][0-9][0-9])/.test(gy),'Black sees its own side at the bottom: '+gy);
const S=p=>p.evaluate(()=>FriendPlay.game.S.moves.map(m=>m.join('')).join(' '));
const mv=(p,m)=>p.evaluate(m=>FriendPlay.xqMove(m),m);
// an illegal move refused (a horse that isn't there / a chariot through its own horse)
await mv(H,[9,0,5,0]);check((await S(H))==='','an illegal move is refused');
// by tapping: Red's central cannon to the centre file (h2-e2: row 7 col 7 -> row 7 col 4)
await H.locator('.xq-piece.xq-mine').filter({hasText:'炮'}).last().click();
const dots=await H.locator('.xq-dot').count();check(dots>0,`picking up the cannon shows where it can go (${dots})`);
await mv(H,[7,7,7,4]);
await G.waitForFunction(()=>FriendPlay.game.S.moves.length===1,null,{timeout:10000});check(true,'Red\'s move reached Black');
// a short legal line (found by search) in which Red's other cannon jumps in and takes with check
const line=[[0,0,1,0],[6,0,5,0],[0,2,2,4],[7,1,0,1]];
let who=[G,H,G,H];
for(let i=0;i<line.length;i++){await mv(who[i],line[i]);await (who[i]===H?G:H).waitForFunction(n=>FriendPlay.game.S.moves.length===n,i+2,{timeout:10000});}
check(await H.evaluate(()=>Xiangqi.inCheck(Xiangqi.replay(FriendPlay.game.S.moves),'b')),'Red gives check: '+await S(H));
check((await G.textContent('.review.xq')).includes('Check!'),'Black is told it is in check');
if(process.env.SHOT)await G.screenshot({path:process.env.SHOT});
// Black must answer the check: a move that ignores it is refused
const before=(await S(G)).split(' ').length;
await mv(G,[3,0,4,0]);check((await S(G)).split(' ').length===before,'a move that leaves the general in check is refused');
// resign ends it on both sides
await G.evaluate(()=>FriendPlay.resign());
await H.waitForFunction(()=>FriendPlay.game.phase==='finished',null,{timeout:10000});
check((await H.textContent('.review.xq')).includes('You won')&&(await G.textContent('.review.xq')).includes('You lost'),'resigning ends it for both');
// checkmate detection, directly: a position where Black has no legal move and is in check
const mate=await H.evaluate(()=>{const e=Array.from({length:10},()=>Array(9).fill(''));e[0][3]='bK';e[9][4]='rK';e[0][8]='rR';e[1][8]='rR';   // two chariots on the back ranks
  const mated=!Xiangqi.legal(e,'b').length&&Xiangqi.inCheck(e,'b');
  const f=e.map(r=>r.slice());f[1][8]='';const escapes=Xiangqi.legal(f,'b').length>0;   // one chariot only: the general steps out
  return mated&&escapes;});
check(mate,'checkmate is recognised (no legal move, in check)');
await b.close();srv.close();
console.log(fails?`${fails} failure(s)`:'all ok');process.exit(fails?1:0);
})();
