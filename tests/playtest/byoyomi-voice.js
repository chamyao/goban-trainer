// The Korean byoyomi voice (app.js ByoVoice): on your turn in byoyomi, "열" at 10 s used, "스물" at 20, the last ten
// counted up 하나 … 아홉, a period gone "네 번 남았습니다", the last "마지막 초읽기입니다"; nothing on the opponent's
// turn; off when unticked. A stand-in game and a recording speechSynthesis.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
let fails=0;const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>{fails++;console.log('ERR',e.message);});
await p.goto('http://localhost:8765/#/feedback');await p.waitForFunction(()=>typeof ByoVoice!=='undefined');
const said=await p.evaluate(()=>{
  const out=[];Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){out.push(u.text);},getVoices(){return [];}}});
  let periods=5,rem=30,myTurn=true;
  const g={phase:'play',myColor:BLACK,get myTurn(){return myTurn;},clock:{black_time:{period_time:30}},timeLeft:()=>({main:0,periods,period:rem,byo:true})};
  const run=(from,to,step=.25)=>{for(rem=from;rem>to;rem-=step)ByoVoice.tick(g);};
  ByoVoice.on=true;
  run(30,0.1);                     // a whole period, on my turn
  const first=out.splice(0);
  periods=4;rem=30;ByoVoice.tick(g); // the period ran out
  const lost=out.splice(0);
  myTurn=false;run(30,0.1);         // the opponent's turn
  const theirs=out.splice(0);
  myTurn=true;periods=1;ByoVoice.tick(g);const last=out.splice(0);
  ByoVoice.on=false;periods=1;run(12,0.1);const off=out.splice(0);ByoVoice.on=true;
  return {first,lost,theirs,last,off};});
check(JSON.stringify(said.first)===JSON.stringify(['초읽기 다섯 번','열','스물','하나','둘','셋','넷','다섯','여섯','일곱','여덟','아홉']),`a period on my turn: ${said.first.join(' ')}`);
check(JSON.stringify(said.lost)===JSON.stringify(['네 번 남았습니다']),`a period gone: ${said.lost.join(' ')}`);
check(said.theirs.length===0,'nothing on the opponent\'s turn');
check(JSON.stringify(said.last)===JSON.stringify(['마지막 초읽기입니다']),`the last period: ${said.last.join(' ')}`);
check(said.off.length===0,'silent when switched off');
console.log(fails?`byoyomi-voice: ${fails} failed`:'byoyomi-voice: all ok');await b.close();process.exit(fails?1:0);
})();
