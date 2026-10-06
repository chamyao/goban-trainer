// Data, no browser: in every book and kit, no arrival point (an "entry" in a .tmj) lies on an exit, or beyond
// the doorway it is the way in by. The
// engine checks the exits each frame at (x, y-3); arrive on one and you're sent straight back out (Book 12:
// into Wang Yun's residence and back to Chang'an before a2 could start).
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..');let fails=0,checked=0;
for(const w of fs.readdirSync(path.join(ROOT,'data/tk_maps')).filter(d=>/^w\d+$/.test(d)))
  for(const kit of fs.readdirSync(path.join(ROOT,'data/tk_maps',w))){const dir=path.join(ROOT,'data/tk_maps',w,kit);
    if(!fs.statSync(dir).isDirectory())continue;
    for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.tmj'))){
      const m=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
      const objs=m.layers.filter(l=>l.type==='objectgroup').flatMap(l=>l.objects),P=o=>Object.fromEntries((o.properties||[]).map(p=>[p.name,p.value]));
      const exits=objs.filter(o=>o.type==='exit');
      for(const o of objs.filter(o=>o.type==='entry')){checked++;const x=o.x,y=o.y-3;
        const e=exits.find(e=>x>=e.x&&x<=e.x+e.width&&y>=e.y&&y<=e.y+e.height);
        if(e){fails++;console.log(`FAIL ${w}/${kit}/${f}: ${o.name} at ${o.x},${o.y} is on the exit to ${P(e).to}`);continue;}
        // and inside it: not beyond a doorway in the wall (an edge exit, whole tiles), or the first step in crosses it
        const from=P(o).from,back=from&&exits.find(e=>P(e).to===from&&e.width%16===0&&e.height%16===0);if(!back)continue;
        const out={N:y<back.y,S:y>back.y+back.height,W:x<back.x,E:x>back.x+back.width}[P(back).side];
        if(out){fails++;console.log(`FAIL ${w}/${kit}/${f}: ${o.name} at ${o.x},${o.y} is outside the way in from ${from} (its ${P(back).side} side)`);}}}}
console.log(fails?`map-entries: ${fails} failed of ${checked}`:`map-entries: all ok (${checked} arrival points)`);process.exit(fails?1:0);
