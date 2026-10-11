// Boards that ask for a kind of problem (a decision board's "pool", tools/problem_kind.py) or name one ("problem"):
// in Book 21, at a weak, a middling and a strong rating, every such board deals a problem of its kind near the
// player's rank, the problem is in its book, and a named problem is dealt whatever the rating.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
let fails=0;const check=(ok,w)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+w);};
p.on('pageerror',e=>console.log('ERR',e.message));
const BASE=process.env.PLAYTEST_URL||'http://localhost:8765';
await p.goto(BASE+'/index.html#/');await p.waitForTimeout(500);
for(const r of [400,1100,1900]){
  const res=await p.evaluate(async r=>{for(const k of Object.keys(localStorage))if(/^tk-|gt-progress/.test(k))localStorage.removeItem(k);
    TK.migrate21();await TK.load();const pr=loadProgress();pr.tkElo={r,n:20,used:[],slots:{}};TK.saveProg(pr);
    const w=TK.world(21),out=[];
    for(const n of w.nodes)[].concat(n.dilemma||[]).forEach((d,i)=>{if(!d.pool&&!d.problem)return;
      const ref=TK.problemRef(n,i),x=w.rated.find(y=>y[0]===ref[0]&&y[1]===ref[1]);
      out.push({key:n.key,i,pool:d.pool||null,fixed:d.problem||null,ref,kinds:x?x[3]:null,rank:x?x[2]:null});});
    for(const o of out){const bk=await getBook(o.ref[0]);o.found=!!bk.problems.find(q=>q.id===o.ref[1]);}
    return {out,label:TKElo.label(r-191)};},r);
  console.log(`--- rating ${r} (boards aimed at ${res.label})`);
  for(const o of res.out){
    if(o.fixed) check(o.found&&o.ref[0]===o.fixed[0]&&o.ref[1]===o.fixed[1],`${o.key}: the named problem ${o.fixed.join('/')}`);
    else check(o.found&&o.kinds&&o.pool.split(' ').every(k=>o.kinds.split(' ').includes(k))&&Math.abs((600+o.rank*50)-Math.max(600,r-191))<=200,
      `${o.key}${o.i?' board '+(o.i+1):''}: "${o.pool}" deals ${o.ref.join('/')} (${o.kinds}, rank ${o.rank})`);
  }
}
console.log(fails?`misaeng-pools: ${fails} FAILED`:'misaeng-pools: all ok');await b.close();process.exit(fails?1:0);})();
