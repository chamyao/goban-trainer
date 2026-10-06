// Data, no browser: in every book, a scene's ["problem"] steps (data/tk.json) and the problem beats of its
// staged cutscene (data/tk_maps/wN/cutscenes.json) agree in number. A scene can pose several problems
// (NODE~1, NODE~2…); if the cutscene had fewer, the beat would clear before the later boards came.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..');
const D=JSON.parse(fs.readFileSync(path.join(ROOT,'data/tk.json'),'utf8'));let fails=0,checked=0;
for(const w of D.worlds){const f=path.join(ROOT,`data/tk_maps/w${w.n}/cutscenes.json`);if(!fs.existsSync(f))continue;
  const cs=JSON.parse(fs.readFileSync(f,'utf8')).scenes||{};
  for(const [id,sc] of Object.entries(w.scenes||{})){const c=cs[id];if(!c)continue;checked++;
    const a=(sc.steps||[]).filter(s=>s[0]==='problem').length,b=(c.beats||[]).filter(x=>x.do==='problem').length;
    if(a!==b){fails++;console.log(`FAIL Book ${w.n} scene "${id}": ${a} problem step(s), ${b} problem beat(s) in its cutscene`);}}}
console.log(fails?`problem-counts: ${fails} failed of ${checked}`:`problem-counts: all ok (${checked} staged scenes)`);process.exit(fails?1:0);
