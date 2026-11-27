// The stone's sound (apo110: "add a stones sound for placement"): one clack per stone placed (yours and the avatar's
// reply), none for a redraw, and the 🔊 button turns it off (kept).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});let fails=0;
const check=(ok,what)=>{if(!ok)fails++;console.log((ok?'ok   ':'FAIL ')+what);};
p.on('pageerror',e=>console.log('ERR',e.message));
const URL=(process.env.PLAYTEST_URL||'http://localhost:8765')+'/index.html';
await p.addInitScript(()=>{ if (!localStorage.getItem('gt-progress')) localStorage.setItem('gt-progress', JSON.stringify({ av: { own: { lisu: 1 } } })); });
await p.goto(URL+'#/play');await p.waitForTimeout(1500);await p.evaluate(()=>{const m=document.getElementById('authModalBackdrop');if(m)m.hidden=true;});
check(await p.locator('.stone-sound-toggle').textContent()==='🔊','the sound button, on by default');
await p.evaluate(()=>{window.__clacks=0;window.__realPlay=StoneSound.play;StoneSound.play=()=>{if(StoneSound.on)window.__clacks++;};});
await p.locator('.ai-foe',{hasText:'Li Su'}).click();await p.locator('.ai-lobby button.primary').click();
const turn=()=>p.evaluate(async()=>{for(let i=0;i<80&&(AIPlay.thinking||!AIPlay.game.myTurn);i++) await new Promise(r=>setTimeout(r,250));return AIPlay.game.myTurn;});
await turn();await p.waitForTimeout(300);
const c0=await p.evaluate(()=>window.__clacks);
await p.evaluate(()=>{for(const [c,r] of [[9,9],[10,10],[8,8],[3,9]]) if(AIPlay.game.legal(c,r)){AIPlay.move(c,r);break;}});await p.waitForTimeout(300);
const c1=await p.evaluate(()=>window.__clacks);
check(c1===c0+1,'your stone: one clack ('+c0+' → '+c1+')');
await turn();await p.waitForTimeout(300);
const c2=await p.evaluate(()=>window.__clacks);
check(c2===c1+1,'the avatar\'s reply: one clack ('+c2+')');
await p.evaluate(()=>{AIPlay.emit();AIPlay.emit();});await p.waitForTimeout(300);
check(await p.evaluate(()=>window.__clacks)===c2,'redraws: no clack');
await p.locator('.stone-sound-toggle').click();
check(await p.locator('.stone-sound-toggle').textContent()==='🔇'&&await p.evaluate(()=>localStorage.getItem('gt-stone-sound'))==='0','the button turns it off, kept');
await p.evaluate(()=>{for(const [c,r] of [[15,3],[3,15],[15,15],[9,3],[3,3]]) if(AIPlay.game.legal(c,r)){AIPlay.move(c,r);break;}});await p.waitForTimeout(300);
check(await p.evaluate(()=>window.__clacks)===c2,'off: no clack');
// the real sound: it builds without an error once the page has been tapped
await p.locator('.stone-sound-toggle').click();
const real=await p.evaluate(()=>{try{StoneSound.play=window.__realPlay;StoneSound.play();return 'ok '+(StoneSound.ac?StoneSound.ac.state:'no ctx');}catch(e){return 'error '+e.message;}});
check(real.startsWith('ok'),'the clack plays: '+real);
await b.close();process.exit(fails?1:0);})();
