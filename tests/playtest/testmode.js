// Loaded before every test by run.sh (node --require): each browser page starts in the game's test mode
// (localStorage tk-test = 1, as ?test=1 sets it), so the books taken down for players (Books 1-3, hidden since
// the Diaochan book went live) stay open to the tests. A test that sets tk-test itself keeps its own value;
// PLAYTEST_LIVE=1 leaves it off, for the checks of what a player sees (live-books).
// not passed on to child processes (npm is node too: it would load this again, which runs npm...)
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '').replace(/--require\s+\S*testmode\.js/, '').trim();
if (!process.env.PLAYTEST_LIVE) {
  const root = require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim();
  const pw = require(root + '/playwright');
  // tk-harness: the game honours a saved tk-test only under the harness (a player's is cleared; theirs lasts a tab)
  const on = () => { try { localStorage.setItem('tk-harness', '1'); if (localStorage.getItem('tk-test') == null) localStorage.setItem('tk-test', '1'); } catch (e) {} };
  const launch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...a) => {
    const b = await launch(...a);
    const newContext = b.newContext.bind(b), newPage = b.newPage.bind(b);
    b.newContext = async (...o) => { const c = await newContext(...o); await c.addInitScript(on); return c; };
    b.newPage = async (...o) => { const p = await newPage(...o); await p.addInitScript(on); return p; };
    return b;
  };
}
