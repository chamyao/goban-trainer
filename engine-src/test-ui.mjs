// UI-level test: off-tree engine reply, judge overlay, ko rule in explore.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/book/seedling-project/47", { waitUntil: "networkidle0" });
await page.waitForFunction(() => window.trainerReady === undefined || document.querySelector("svg circle"));

const report = await page.evaluate(async () => {
  const out = {};
  const t = window.__trainer;
  if (!t) return { error: "no trainer handle" };

  // 1. engine loads
  await window.__engine.ensure();
  out.engineStatus = window.__engine.status;
  out.backend = window.__engine.backend;

  // 2. off-tree move (A19 = far corner, clearly off tree) → engine white reply
  const movesBefore = t.played.length;
  t.click(0, 0);
  await new Promise(res => {
    const iv = setInterval(() => {
      if (!t.engineBusy && t.played.length >= movesBefore + 2) { clearInterval(iv); res(); }
    }, 200);
    setTimeout(() => { clearInterval(iv); res(); }, 30000);
  });
  out.offTreePlayed = t.played.length - movesBefore; // expect 2: user + engine
  out.statusAfter = document.getElementById("status").textContent;

  // 3. judge → ownership overlay
  await t.judge();
  out.ownershipLen = t.ownership ? t.ownership.length : 0;
  out.judgeStatus = document.getElementById("status").textContent;

  // 4. ko rule in explore: build a ko and try immediate recapture
  t.reset();
  t.toggleExplore();
  // construct a ko in a neutral area: black D4 area ko shape
  const E = (c, r) => t.exploreClick(c, r);
  // black: (3,3),(4,2),(4,4); white: (5,2),(5,4),(6,3); then B (5,3), W captures at (4,3)
  const seq = [[3,3,'b'],[5,2,'w'],[4,2,'b'],[5,4,'w'],[4,4,'b'],[6,3,'w'],[5,3,'b'],[4,3,'w']];
  // exploreTurn alternates automatically; seed matches: starts black
  for (const [c, r] of seq) E(c, r);
  // white played (4,3) capturing black (5,3)? actually black(5,3) captured by white(4,3)+(5,2)+(5,4)+(6,3)
  const koRecapturePoint = [5, 3];
  const before = t.posHistory.length;
  E(...koRecapturePoint); // black immediate recapture → should be blocked by superko
  out.koBlocked = t.posHistory.length === before;
  out.koStatus = document.getElementById("status").textContent;

  return out;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
