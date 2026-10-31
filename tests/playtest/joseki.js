// Joseki from the pros' games (app.js viewJoseki, data/joseki.json; the user: "curate based off a few pros' games, like
// Wu Qingyuan", "without annotations for now", transpositions "2 not 1"): the page; positions, not move orders (two
// orders to one position show it the same); the board keeps its orientation as a line steps through mirrored frames; a
// pro's own games alone; a game opens in Review at the move.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:950}});
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/joseki');await p.evaluate(()=>{localStorage.removeItem('goban.joseki');const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.reload();await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});await p.waitForSelector('.joseki-row');
const top=await p.$$eval('.joseki-row b',e=>e.slice(0,2).map(x=>x.textContent));
check(top.join()==='D16,D17',`the empty corner: the star point and the 3-4 point first (${top.join(', ')})`);
// a tap on a marked point plays it
await p.evaluate(()=>window.__joseki.go([]));
const pt=await p.evaluate(()=>{const svg=document.querySelector('.board-card svg'),R=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,k=R.width/vb.width;return {x:R.left+(38+3*44)*k,y:R.top+(38+3*44)*k};});
await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(300);
check(await p.evaluate(()=>Joseki.path.join()==='dd'),'a tap on the star point plays it');
// random lines: the stones already down stay where they are on the screen as each move is played (captures aside)
const steady=await p.evaluate(()=>{
  const stones=()=>{const g=[];document.querySelectorAll('.board-card svg circle.bt-stone').forEach(c=>g.push(c.getAttribute('cx')+','+c.getAttribute('cy')));return new Set(g);};
  let bad=0,steps=0;
  for(let walk=0;walk<25;walk++){window.__joseki.go([]);
    for(let d=0;d<12;d++){const kids=Joseki.children(Joseki.node());if(!kids.length)break;
      const pick=kids[Math.floor(Math.random()*Math.min(4,kids.length))];const before=stones();
      window.__joseki.go([...Joseki.path,pick.mv]);const after=stones();steps++;
      let gone=0;before.forEach(s=>{if(!after.has(s))gone++;});if(gone>1)bad++;}}   // (a capture takes a stone or two; a turned board, nearly all)
  return {bad,steps};});
check(steady.bad===0,`the board keeps its orientation through ${steady.steps} random moves (${steady.bad} turned)`);
// a position reached by two orders shows the same games from either
const tr=await p.evaluate(()=>{const N=Joseki.data.nodes,par=new Map();
  // the paths to each node, breadth first, the first two distinct
  const q=[[0,[]]],paths=new Map([[0,[[]]]]);
  while(q.length){const [u,path]=q.shift();if(path.length>5)continue;
    for(const [m,e] of Object.entries(N[u].e||{})){if(m==='tt')continue;const pp=[...path,m];const l=paths.get(e[0])||[];if(l.length<2){l.push(pp);paths.set(e[0],l);if(l.length===1)q.push([e[0],pp]);}}}
  for(const [v,l] of paths) if(l.length===2&&N[v].n>=5){const a=Joseki.node(l[0]),b=Joseki.node(l[1]);return {a:l[0].join(' '),b:l[1].join(' '),same:a===b,n:N[v].n};}
  return null;});
check(tr&&tr.same,`two move orders, one position (${tr&&tr.a} / ${tr&&tr.b}: ${tr&&tr.n} games)`);
// one pro's games
await p.evaluate(()=>window.__joseki.go(['dd']));await p.selectOption('.joseki-pick select','0');await p.waitForTimeout(200);
const gs=await p.evaluate(()=>Joseki.children(Joseki.node()).map(x=>[x.n,(x.e[5][0]||[0])[0]]));
check(gs.length>0&&gs.every(([n,g])=>n===g),'Go Seigen\'s games alone: the counts are his');
await p.selectOption('.joseki-pick select','-1');
// a game in Review at the move
await p.evaluate(()=>window.__joseki.go(['dd','fc']));await p.waitForSelector('.joseki-game');
await p.click('.joseki-game');await p.waitForFunction(()=>location.hash==='#/review');
const rv=await p.evaluate(()=>({i:Review.mainNodes.indexOf(Review.node)}));
check(rv.i>0,`a game opens in Review at the move (position ${rv.i})`);
// a whole joseki: the players left the corner (the user: "consider the joseki full depth if it ends in tenuki")
const done=await p.evaluate(()=>{const N=Joseki.data.nodes;const q=[[0,[]]];const seen=new Set([0]);
  while(q.length){const [u,path]=q.shift();const nd=N[u];if(path.length&&nd.n>=20&&nd.e&&nd.e.tt&&nd.e.tt[2]/nd.n>=.6)return path;
    for(const [m,e] of Object.entries(nd.e||{}))if(m!=='tt'&&!seen.has(e[0])&&path.length<8){seen.add(e[0]);q.push([e[0],[...path,m]]);}}return null;});
await p.evaluate(()=>location.hash='#/joseki');await p.waitForSelector('.joseki-row');await p.evaluate(path=>window.__joseki.go(path),done);
check(done&&await p.isVisible('.joseki-done'),`a finished joseki is marked (${await p.textContent('.joseki-done')})`);
await p.evaluate(path=>window.__joseki.go(path.slice(0,-1)),done);
check(await p.$$eval('.joseki-row',rs=>rs.some(r=>/ends the joseki/.test(r.textContent))),'the move before it: marked as ending the joseki');
await b.close();console.log(fails?`${fails} FAILED`:'all passed');process.exit(fails?1:0);})();
