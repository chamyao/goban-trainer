// The Play tab (app.js playGame): in your byoyomi's last 10 seconds, the seconds count down on the opponent's last
// stone, as OGS does; never on their turn, never with more than 10 s left. A stand-in game object drives it.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/feedback');
await p.waitForFunction(()=>typeof playGame!=='undefined');
const run=(myTurn,period)=>p.evaluate(async([myTurn,period])=>{
  const grid=Array.from({length:19},()=>new Array(19).fill(0));grid[3][3]=1;grid[15][15]=2;   // White (them) just played at P4
  const g={id:1,phase:'play',myColor:BLACK,myTurn,pending:null,error:'',removed:new Set(),
    replay:()=>({grid,last:[15,15]}),toMove:()=>myTurn?BLACK:WHITE,player:c=>({username:c===BLACK?'me':'them'}),
    timeLeft:c=>c===BLACK?{main:0,periods:3,period,byo:true}:{main:120,periods:5,period:30,byo:false},resultText:()=>''};
  root.innerHTML='';root.append(...playGame(g));await new Promise(z=>setTimeout(z,400));
  const t=document.querySelector('.pl-countdown'),svg=document.querySelector('.board-card svg'),ring=svg.querySelector('.last-move');
  return {text:t&&t.textContent,fill:t&&t.getAttribute('fill'),at:t&&[+t.getAttribute('x'),+t.getAttribute('y')],ringHidden:ring&&getComputedStyle(ring).display==='none'};
},[myTurn,period]);
let r=await run(true,7.4);
check(r.text==='8'&&r.fill==='#111'&&r.ringHidden,`my turn, 7.4 s left in the period: "8" on their (white) stone, dark, the last-move ring hidden (${JSON.stringify(r)})`);
r=await run(true,24);
check(r.text===''&&!r.ringHidden,'24 s left: no number, the ring as usual');
r=await run(false,7.4);
check(r.text==='','their turn: no countdown on the board');
console.log(fails?`byoyomi-countdown: ${fails} failed`:'byoyomi-countdown: all ok');await b.close();process.exit(fails?1:0);
})();
