// Play a friend, no login (the user: "host a game on the website without having to log in"): two browsers, joined
// by the link, against a local PeerJS server (npm i -g peer). Checks: hosting gives a link; the friend's page joins
// and both get a color; moves cross both ways; a ko can't be retaken at once; the host's reload keeps the game and the
// friend comes back to it; two passes, dead stones marked, both accept: the same score on both; resigning ends it.
const root=require('child_process').execSync('npm root -g').toString().trim();
const { chromium } = require(root+'/playwright');
const { ExpressPeerServer } = require(root+'/peer');
const express = require(root+'/peer/node_modules/express');
const URL=process.env.PLAYTEST_URL||'http://localhost:8765/';
(async()=>{
const app=express(),srv=app.listen(9123,'127.0.0.1');app.use('/p',ExpressPeerServer(srv,{path:'/'}));
const b=await chromium.launch({args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
const dev=async name=>{const ctx=await b.newContext({viewport:{width:1200,height:850}});const p=await ctx.newPage();
  p.on('pageerror',e=>{fails++;console.log('ERR',name,e.message);});
  await p.addInitScript(n=>{window.FRIEND_PEER_OPTS={host:'127.0.0.1',port:9123,path:'/p',secure:false,config:{iceServers:[]}};
    if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('gt-friend-name',n);}},name);
  p.on('dialog',d=>d.accept());return p;};
const H=await dev('Ann'),G=await dev('Bo');
const shut=p=>p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await H.goto(URL+'#/play');await shut(H);await H.waitForSelector('.friend-lobby');
await H.selectOption('.friend-lobby select[name=size]','9');await H.selectOption('.friend-lobby select[name=color]','black');
await H.click('.host-friend');await H.waitForSelector('.friend-link');
const link=await H.inputValue('.friend-link');
check(/#\/friend\/[a-z0-9]{6}$/.test(link)&&!link.includes('test='),`hosting gives a link: ${link}`);
await G.goto(link);await shut(G);
const S=p=>p.evaluate(()=>{const g=FriendPlay.game;return g&&{phase:g.phase,color:g.myColor,moves:g.S.moves.length,seq:g.S.seq,names:g.S.names,result:g.resultText(),removed:g.S.removed.length};});
await G.waitForFunction(()=>FriendPlay.game&&FriendPlay.game.phase==='play'&&FriendPlay.game.myColor,null,{timeout:20000});
await H.waitForFunction(()=>FriendPlay.game.phase==='play',null,{timeout:10000});
const h0=await S(H),g0=await S(G);
check(h0.color===1&&g0.color===2&&g0.names[1]==='Ann'&&h0.names[2]==='Bo',`the friend joins: host Black, friend White, names cross (${JSON.stringify(h0.names)})`);
check(await H.evaluate(()=>document.querySelectorAll('.board-card svg line').length)===18,'a 9×9 board is drawn');
// moves by clicks on the board
const play=async(p,c,r)=>{await p.evaluate(([c,r])=>FriendPlay.move(c,r),[c,r]);};
const waitN=(p,n)=>p.waitForFunction(n=>FriendPlay.game.S.moves.length===n,n,{timeout:10000});
// a ko: B c3? build the shape  . B W .   at row 4:  B at d4(3,3) b... use a classic ko
const seq=[[3,2],[4,2],[2,3],[5,3],[3,4],[4,4],[8,8],[3,3]];   // W d4 takes nothing yet; then B e4 captures d4 -> ko
for(let i=0;i<seq.length;i++){const p=i%2?G:H;await play(p,...seq[i]);await waitN(i%2?H:G,i+1);}
await play(H,4,3);await waitN(G,9);
const cap=await G.evaluate(()=>FriendPlay.game.replay().grid[3][3]);
check(cap===0,'Black takes the ko (d4 captured), seen on the friend\'s board');
const before=(await S(G)).moves;await play(G,3,3);
const ko=await G.evaluate(()=>({n:FriendPlay.game.S.moves.length,err:FriendPlay.game.error}));
check(ko.n===before&&/ko/.test(ko.err),`White can't retake the ko at once: "${ko.err}"`);
await play(G,7,7);await waitN(H,10);
// the host reloads: the game is kept, the friend comes back to it
await H.reload();await shut(H);
await H.waitForFunction(()=>FriendPlay.game&&FriendPlay.game.S.moves.length===10&&FriendPlay.conn&&FriendPlay.conn.open,null,{timeout:30000});
await play(H,0,0);await waitN(G,11);
check(true,'after the host\'s reload the game goes on (a move crosses)');
// two passes: scoring; mark a dead stone; both accept: the same result
await play(G,-1,-1);await waitN(H,12);await play(H,-1,-1);await waitN(G,13);
await G.waitForFunction(()=>FriendPlay.game.phase==='stone removal',null,{timeout:5000});
check((await H.evaluate(()=>document.querySelector('.play').textContent)).includes('komi'),'two passes: the score shows while marking');
await G.evaluate(()=>FriendPlay.setRemoved([[7,7]],true));await H.waitForFunction(()=>FriendPlay.game.S.removed.length===1,null,{timeout:5000});
await H.evaluate(()=>FriendPlay.acceptScore());await G.waitForFunction(()=>FriendPlay.game.S.accepted[1],null,{timeout:5000});
await G.evaluate(()=>FriendPlay.acceptScore());await H.waitForFunction(()=>FriendPlay.game.phase==='finished',null,{timeout:5000});
const hr=await S(H),gr=await S(G);
check(hr.result&&gr.result&&hr.result.split(':')[1]===gr.result.split(':')[1]&&/[BW]\+[\d.]+/.test(hr.result),`both accept: one score on both (host "${hr.result}", friend "${gr.result}")`);
const sgf=await H.evaluate(()=>FriendPlay.game.sgf());
check(/SZ\[9\]/.test(sgf)&&/PB\[Ann\]/.test(sgf)&&/RE\[[BW]\+/.test(sgf),'the finished game makes an SGF for Review');
// a rematch: asked by one, accepted by the other; both go to a new game, same board, colors swapped
await G.click('button.rematch');await H.waitForFunction(()=>/wants a rematch/.test(document.querySelector('.play').textContent),null,{timeout:5000});
check(true,'the rematch ask shows on the other side');
await H.click('button.rematch');
await H.waitForFunction(c=>FriendPlay.game&&FriendPlay.game.S.code!==c&&FriendPlay.game.phase==='play',link.split('/').pop(),{timeout:20000});
await G.waitForFunction(()=>FriendPlay.game&&FriendPlay.game.phase==='play'&&FriendPlay.game.myColor,null,{timeout:20000});
const rh=await S(H),rg=await S(G),rc=await H.evaluate(()=>({code:FriendPlay.game.S.code,size:FriendPlay.game.size}));
check(rh.color===2&&rg.color===1&&rc.size===9&&rh.names[2]==='Ann'&&rh.names[1]==='Bo'&&await G.evaluate(()=>FriendPlay.game.S.code)===rc.code,`the rematch starts: colors swapped (host now ${rh.color===2?'White':'Black'}), 9×9 again, same names`);
await play(G,4,4);await waitN(H,1);check(true,'and the first move crosses');
// a second game: resign
await H.goto(URL+'#/play');await shut(H);await H.waitForSelector('.friend-lobby');await H.click('.host-friend');await H.waitForSelector('.friend-link');
const link2=await H.inputValue('.friend-link');await G.goto(link2);
await G.waitForFunction(()=>FriendPlay.game&&FriendPlay.game.phase==='play'&&FriendPlay.game.myColor,null,{timeout:20000});
await G.evaluate(()=>FriendPlay.resign());await H.waitForFunction(()=>FriendPlay.game.phase==='finished',null,{timeout:5000});
check(/You won by resignation/.test((await S(H)).result),`resigning ends it: "${(await S(H)).result}"`);
const clock=await H.evaluate(()=>document.querySelector('.pl-clock').textContent);
check(/20:00/.test(clock),`the default clock is 20 min + byoyomi (${clock})`);
// Open games, no link (the user: "show the host to everyone"): a hosted game shows on the Play tab of others;
// a click there joins it, and it leaves the list once someone sits down; the list lives on when its holder leaves
const C=await dev('Cy');await C.goto(URL+'#/play');await shut(C);
await H.goto(URL+'#/play');await shut(H);await H.waitForSelector('.friend-lobby');
await H.selectOption('.friend-lobby select[name=size]','13');await H.click('.host-friend');await H.waitForSelector('.friend-link');
const code3=(await H.inputValue('.friend-link')).split('/').pop();
await G.goto(URL+'#/play');await shut(G);
await G.waitForFunction(c=>[...document.querySelectorAll('.friend-game')].some(e=>e.textContent.includes('Ann')&&e.textContent.includes('13×13')),code3,{timeout:20000});
check(true,'a hosted game shows in Open games on another browser, with the host\'s name and board');
const cy=await C.waitForFunction(()=>document.querySelectorAll('.friend-game').length>0,null,{timeout:20000}).then(()=>true,()=>false);
check(cy,'and on a third');
await G.click('.friend-game');
await G.waitForFunction(c=>FriendPlay.game&&FriendPlay.game.S.code===c&&FriendPlay.game.phase==='play'&&FriendPlay.game.myColor,code3,{timeout:20000});
check(await G.evaluate(()=>FriendPlay.game.size===13),'a click in Open games joins it (13×13, no link)');
const gone=await C.waitForFunction(()=>!document.querySelectorAll('.friend-game').length,null,{timeout:10000}).then(()=>true,()=>false);
check(gone,'once someone sits down, it leaves Open games');
// the list's holder leaves: the rest carry on (a new game still shows)
const hubs=async()=>({H:await H.evaluate(()=>FriendLobby.hub),G:await G.evaluate(()=>FriendLobby.hub),C:await C.evaluate(()=>FriendLobby.hub)});
const hb=await hubs();const holder=hb.H?H:hb.G?G:C;check(Object.values(hb).filter(Boolean).length===1,`one page holds the list (${JSON.stringify(hb)})`);
const others=[H,G,C].filter(p=>p!==holder);await holder.evaluate(()=>dispatchEvent(new Event('pagehide')));await holder.close();   /* (a closing tab fires pagehide; page.close() alone doesn't) */
await others[0].goto(URL+'#/play');await shut(others[0]);await others[0].waitForSelector('.friend-lobby');await others[0].click('.host-friend');await others[0].waitForSelector('.friend-link');
await others[1].goto(URL+'#/play');await shut(others[1]);
const re=await others[1].waitForFunction(()=>document.querySelectorAll('.friend-game').length>0,null,{timeout:30000}).then(()=>true,()=>false);
check(re,'after the holder leaves, another page takes the list and a new game shows');
await b.close();srv.close&&srv.close();console.log(fails?`friend-play: ${fails} failed`:'friend-play: all ok');process.exit(fails?1:0);})();
