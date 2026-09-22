import puppeteer from "puppeteer-core";
const SGF = `(;GM[1]FF[4]SZ[19]KM[6.5];B[pd];W[dp];B[pp];W[dd])`;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
page.on("console", m => console.log("[console]", m.type(), m.text()));
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(sgf => {
  document.querySelector("textarea").value = sgf;
  document.querySelector(".sgf-loader button.primary").click();
}, SGF);
await page.waitForSelector(".review svg");
await page.evaluate(() => window.__engine.ensure());
await page.waitForFunction(() => window.__engine.status === "ready", { timeout: 60000 });
const out = await page.evaluate(async () => {
  const rv = window.__review;
  rv.jump(rv.game.n);
  rv.click(16, 9);
  try {
    await rv.engineMove();
    return { moves: rv.explore ? rv.explore.moves.length : -1,
             pos: document.querySelector(".rv-nav .pos").textContent };
  } catch (e) { return { err: e.message }; }
});
console.log(JSON.stringify(out));
await browser.close();
