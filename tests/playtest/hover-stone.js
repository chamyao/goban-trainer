// The hover stone is the point under the pointer (the user: "when I hover over the play board there's a bug that makes a
// ghost stone appear a few squares left"): a live game draws its board again at each move, and the avatar's column goes
// back beside it a frame later, so the board shifts under a still mouse; the point entered in that frame stayed lit,
// points off. Here: a board, hovered, shifted under the mouse, the mouse nudged: only the point under it is lit.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/stream');await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>window.__trainer&&window.__trainer.goban);await p.waitForTimeout(800);
const g=()=>p.evaluate(()=>{const g=window.__trainer.goban,t=window.__trainer,R=g.svg.getBoundingClientRect(),k=R.width/g.W;
  const pts=[];for(let r=g.crop.r0;r<=g.crop.r1;r++)for(let c=g.crop.c0;c<=g.crop.c1;c++)if(t.grid[r][c]===0)pts.push([c,r]);
  return {pts,k,left:R.left,top:R.top,pad:g.pad,cell:g.cell,c0:g.crop.c0,r0:g.crop.r0};});
const lit=()=>p.evaluate(()=>{const g=window.__trainer.goban;return [...g.svg.querySelectorAll('circle')].filter(e=>/rgba/.test(e.getAttribute('fill')||'')).map(e=>[Math.round((e.getAttribute('cx')-g.pad)/g.cell)+g.crop.c0,Math.round((e.getAttribute('cy')-g.pad)/g.cell)+g.crop.r0].join(','));});
let G=await g();const far=G.pts.reduce((a,b)=>b[0]>a[0]?b:a);   // an empty point to the right, with room to shift
const at=(G,c,r)=>[G.left+(G.pad+(c-G.c0)*G.cell)*G.k,G.top+(G.pad+(r-G.r0)*G.cell)*G.k];
await p.mouse.move(...at(G,...far));await p.waitForTimeout(150);
check((await lit()).join()===far.join(),`hovered: the point under the mouse is lit (${far})`);
// a live game's redraw under the still mouse: the board drawn 3 points to the right for a frame (the avatar's column not
// back yet), a hover registered there, then the column back
const [x,y]=at(G,...far);
await p.evaluate(px=>{const t=window.__trainer,card=document.querySelector('.board-card');card.style.transform=`translateX(${px}px)`;t.render();
  requestAnimationFrame(()=>{card.style.transform='';});},3*G.cell*G.k);
await p.waitForTimeout(300);
const l=await lit();
check(l.length===1&&l[0]===far.join(),`drawn again under a still mouse while the page shifts: one stone, under the mouse (${l.join(' ')||'none'})`);
await p.mouse.move(5,5);await p.waitForTimeout(100);
check((await lit()).length===0,'the mouse off the board: none');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);})();
