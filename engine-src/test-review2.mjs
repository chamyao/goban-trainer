import puppeteer from "puppeteer-core";
const SGF = `(;GM[1]FF[4]SZ[19]KM[6.5]PB[B]PW[W]
;B[pd];W[dp];B[pp];W[dd];B[fq];W[cn];B[jp];W[nc];B[pf];W[jd])`;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(sgf => {
  document.querySelector("textarea").value = sgf;
  document.querySelector(".sgf-loader button.primary").click();
}, SGF);
await page.waitForSelector(".review svg");
const R = () => page.evaluate(() => ({
  pos: document.querySelector(".rv-nav .pos").textContent,
  suggestions: [...document.querySelectorAll(".board-card circle")]
    .filter(c => c.getAttribute("fill") === "#3566b0").length,
}));

await page.evaluate(() => window.__engine.ensure());
await page.waitForFunction(() => window.__engine.status === "ready", { timeout: 60000 });
await page.evaluate(() => window.__review.jump(window.__review.game.n));
await page.waitForFunction(() =>
  document.querySelector(".rv-nav .pos").textContent.includes("%"), { timeout: 30000 });
console.log("hints after jump:", JSON.stringify(await R()));

await page.evaluate(() => window.__review.click(16, 9)); // B Q10 → explore
await new Promise(r => setTimeout(r, 200));
console.log("after click Q10:", JSON.stringify(await R()));

await page.evaluate(() => window.__review.engineMove()); // W reply
await page.waitForFunction(() =>
  document.querySelector(".rv-nav .pos").textContent.startsWith("Explore +2"), { timeout: 30000 });
console.log("after engine move:", JSON.stringify(await R()));

await page.evaluate(() => { window.__review.undoExplore(); window.__review.exitExplore(); });
console.log("after undo+resume:", JSON.stringify(await R()));

// superko: replay the same point after resume→explore, then verify occupied point rejected
const ko = await page.evaluate(() => {
  const rv = window.__review;
  rv.click(16, 9);
  const len1 = rv.explore.moves.length;
  rv.click(16, 9); // occupied now
  return { len1, len2: rv.explore.moves.length };
});
console.log("occupied-click guard:", JSON.stringify(ko));
await browser.close();
