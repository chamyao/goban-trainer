// The ko rule in the puzzles (apo110: "puzzles let me play illegal ko move"): an immediate retake is refused, not
// played and not counted wrong, in strict boards (the story mode, Stream) and on the answer tree alike.
// A hand-made ko in the corner: Black takes at bb... White retakes at ba... Black may not retake at once.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/feedback');
await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
await p.waitForFunction(()=>typeof Trainer!=='undefined');
const run=strict=>p.evaluate(async strict=>{
  // a ko at ab/bb: Black ac,bc? Laid out so Black at bb takes White ab, and White at ab retakes Black bb.
  // Black: ba, cb, bc  White: aa? — use a textbook shape on the left edge:
  //   col a b c   rows a..d
  //   a: . X O      (ba X, ca O)
  //   b: X O . O    (ab X, bb O, db O)
  //   c: . X O      (bc X, cc O)
  // Black at cb captures White bb (ko); White at bb retakes Black cb; Black at cb again = illegal ko.
  const prob={id:'ko-test',b:['ba','ab','bc'],w:['ca','bb','db','cc'],lv:'10K',qt:'死活题',lines:[[1,'cb','bb','ea']]};
  const book={id:'ko-test',title:'ko',problems:[prob]};
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');document.body.append(svg);
  const els={svg,boardCard:document.createElement('div'),status:document.createElement('div'),turnBadge:document.createElement('span'),
    btnExplore:document.createElement('button'),treePanel:document.createElement('div'),treeBox:document.createElement('div'),note:document.createElement('div'),strict};
  const t=new Trainer(book,0,els);window.__ko=t;
  const at=m=>[m.charCodeAt(0)-97,m.charCodeAt(1)-97];
  t.click(...at('cb'));                       // Black takes the ko (on the tree)
  await new Promise(z=>setTimeout(z,900));    // White's reply from the tree: retakes at bb
  const afterWhite={bb:t.grid[1][1],cb:t.grid[1][2],played:t.played.join(',')};
  const before=t.played.length;
  t.click(...at('cb'));                       // the illegal retake
  return {afterWhite,refused:t.played.length===before&&t.done===null&&!t.flawed,status:els.status.textContent,cb:t.grid[1][2]};
},strict);
for(const strict of [true,false]){const r=await run(strict);
  check(r.afterWhite.bb===2&&r.afterWhite.cb===0,`${strict?'strict':'library'}: White retakes the ko (${r.afterWhite.played})`);
  check(r.refused&&r.cb===0&&/Ko/.test(r.status),`${strict?'strict':'library'}: Black's immediate retake is refused, not played and not wrong ("${r.status}")`);}
console.log(fails?`ko: ${fails} failed`:'ko: all ok');await b.close();process.exit(fails?1:0);
})();
