// Score candidate moves for a Misaeng record board (the multiple-choice "which move did Cho play?" boards).
// Replays docs/book2/misaeng-ing-cup-g5.sgf to move n-1, plays each candidate as Black, and asks the repo's own
// KataGo (engine/katago-small.bin.gz) for the score lead with White to move. A candidate's loss = Cho's real
// move's lead minus the candidate's. Keep only candidates that score below Cho's move.
//
// Usage: serve the repo root first (python3 -m http.server 8321 from the repo root), then
//   node tools/ms_score_choices.mjs 11:cp,dl,dr 15:cf,gc        (include Cho's move to get the baseline)
// Assumes Black's moves (Cho is Black). Paths below are the cloud container's; adjust as needed.
import pw from '/opt/node-tools/node_modules/playwright/index.js'; const { chromium } = pw;
import fs from "fs";
const sgf = fs.readFileSync("/home/user/goban-trainer/docs/book2/misaeng-ing-cup-g5.sgf","utf8");
const moves = [...sgf.matchAll(/;([BW])\[([a-s]{2})\]/g)].map(m=>({c:m[1],x:m[2].charCodeAt(0)-97,y:m[2].charCodeAt(1)-97}));
const jobs = process.argv.slice(2).map(a=>{const [n,c]=a.split(":");return {n:Number(n),cands:c.split(",")}});
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" , headless:true}).catch(async()=>chromium.launch({headless:true}));
const page = await browser.newPage();
page.on("console", m => console.error("[page]", m.text()));
await page.goto("http://localhost:8321/README.md");
for (const {n,cands} of jobs) for (const cand of cands) {
  const hist = moves.slice(0, n-1).concat([{c:"B",x:cand.charCodeAt(0)-97,y:cand.charCodeAt(1)-97}]);
  const res = await page.evaluate(async ({hist}) => {
    // replay with captures
    const B = Array.from({length:19},()=>Array(19).fill(null));
    const nb=(x,y)=>[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>a>=0&&a<19&&b>=0&&b<19);
    const grp=(x,y)=>{const c=B[y][x];const st=[[x,y]],seen=new Set([x+','+y]);let lib=0;const libs=new Set();
      while(st.length){const [a,b]=st.pop();for(const [p,q] of nb(a,b)){if(!B[q][p]){libs.add(p+','+q)}else if(B[q][p]===c&&!seen.has(p+','+q)){seen.add(p+','+q);st.push([p,q])}}}
      return {seen,libs}};
    for(const m of hist){const c=m.c==='B'?'black':'white';B[m.y][m.x]=c;
      for(const [p,q] of nb(m.x,m.y)){if(B[q][p]&&B[q][p]!==c){const g=grp(p,q);if(!g.libs.size)for(const s of g.seen){const [a,b]=s.split(',').map(Number);B[b][a]=null}}}}
    const worker = new Worker("/engine/katago-worker.js");
    const modelUrl = new URL("/engine/katago-small.bin.gz", location.href).href;
    await new Promise((res,rej)=>{worker.onmessage=e=>{if(e.data.type==="katago:init_result")res(e.data)};worker.onerror=e=>rej(new Error(e.message));
      worker.postMessage({type:"katago:init",modelUrl,backend:"auto"})});
    const a = await new Promise((res,rej)=>{worker.onmessage=e=>{if(e.data.type==="katago:analyze_result")e.data.ok?res(e.data.analysis):rej(new Error(e.data.error))};
      worker.postMessage({type:"katago:analyze",id:1,modelUrl,backend:"auto",board:B,currentPlayer:"white",
        moveHistory:hist.map(m=>({x:m.x,y:m.y,player:m.c==='B'?'black':'white'})),komi:8,rules:"chinese",
        visits:300,maxTimeMs:60000,topK:1,analysisPvLen:2,ownershipMode:"none"})});
    worker.terminate();
    return a;
  }, {hist});
  const actual = moves[n-1];
  const mv = (res.moves||res.candidates||[]);
  console.log(JSON.stringify({n, cand, root: res.rootScoreLead ?? res.scoreLead ?? null, rootWin: res.rootWinRate ?? res.winRate ?? null, best: mv[0] && {x:mv[0].x,y:mv[0].y,scoreLead:mv[0].scoreLead,winRate:mv[0].winRate}, keys:Object.keys(res)}));
}
await browser.close();
