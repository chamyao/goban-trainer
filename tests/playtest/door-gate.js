// Doors that open through a wall's gate (Places' door_to_gate rule): walk straight in at the gap's centre and a few px
// either side, and each must take her through the door. Pang Shu's door (Book 14's burning ward, through the lane wall)
// and the East Road jail (Book 13, through its yard wall). Run with the site served on :8765 (tests/playtest/run.sh).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
const CASES = [
  { world: 14, place: 'changan--burning-ward', upto: '14-x0b', to: 'changan--pangshu-house', xs: [520, 528, 536], y: 420, key: 'ArrowDown' },
  { world: 13, place: 'the-east-road', upto: null, to: 'the-east-road--jail-court', xs: [1940, 1952, 1964], y: 300, key: 'ArrowUp' },
];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  let fails = 0;
  for (const c of CASES) for (const x of c.xs) {
    const p = await (await b.newContext({ viewport: { width: 900, height: 700 } })).newPage();
    await p.route('**/phaser.min.js', r => r.fulfill({ path: require('path').join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
    await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
    await p.goto(`${URL}/index.html?test=1#/tk/${c.world}`); await p.waitForTimeout(800);
    await p.evaluate(async ([world, place, upto]) => {   // the story up to the beat (its watchers gone), standing in the place
      localStorage.setItem('tk-guide', 'off'); await TK.load();
      for (const n of TK.world(world).nodes) { TK.markCleared(n.key); if (n.key === upto) break; }
      localStorage.setItem('tk-world-' + world, JSON.stringify({ place, party: [] }));
    }, [c.world, c.place, c.upto]);
    await p.reload();
    for (let i = 0; i < 60; i++) {
      const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
      if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break;
      await p.waitForTimeout(200);
    }
    for (let i = 0; i < 12; i++) { if (await p.locator('.town-dlg:not([hidden])').count()) await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
    await p.evaluate(([x, y]) => window.__w.player.body.reset(x, y), [x, c.y]);
    await p.waitForTimeout(300); await p.keyboard.down(c.key); await p.waitForTimeout(4000); await p.keyboard.up(c.key);
    await p.waitForTimeout(1500);
    const at = await p.evaluate(() => window.__w && window.__w.placeId);
    const ok = at === c.to; fails += !ok;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${c.place} walking in at x=${x}: ${at}`);
    await p.close();
  }
  await b.close();
  console.log(fails ? `${fails} failed` : 'all doors through gates walk in');
  process.exit(fails ? 1 : 0);
})();
