// Data, no browser: a beat played inside a room (its quest's place is "town--room") has no story spot on an
// outdoor map, in any kit. Found: the map builder's "spot at the hub" (a table) for 1-ax1, 1-f1, 1-t1, 1-c1
// and 1-i1, out in the street; tapping that table (a log in Jade) started the room's scene outdoors.
// A named landmark for such a beat (the hermit's cave, Cao's home…) is listed too: tapping it plays the scene
// where it stands, not in the room.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..');
let fails=0;
for(const n of [1,2]){const dir=path.join(ROOT,'data/tk_maps/w'+n);if(!fs.existsSync(dir))continue;
  const region=JSON.parse(fs.readFileSync(path.join(dir,'region.json'),'utf8'));
  const inRoom=Object.fromEntries(region.quests.filter(q=>q.place.includes('--')).map(q=>[q.node,q.place]));
  const kits=fs.readdirSync(dir).filter(k=>fs.statSync(path.join(dir,k)).isDirectory());
  for(const kit of kits)for(const f of fs.readdirSync(path.join(dir,kit)).filter(f=>f.endsWith('.tmj')&&!f.includes('--'))){
    const m=JSON.parse(fs.readFileSync(path.join(dir,kit,f),'utf8'));
    for(const L of m.layers||[])if(L.type==='objectgroup')for(const o of L.objects||[]){const pr=Object.fromEntries((o.properties||[]).map(p=>[p.name,p.value]));
      if(pr.node&&inRoom[pr.node]){fails++;console.log(`FAIL w${n} ${kit}/${f.replace('.tmj','')}: spot "${o.name}" (${pr.label||'no label'}) for ${pr.node}, which plays in ${inRoom[pr.node]}`);}}}}
console.log(fails?`room-spots: ${fails} failed`:'room-spots: all ok');process.exit(fails?1:0);
