import puppeteer from "puppeteer-core";
const SGF = `(;GM[1]FF[4]SZ[19]KM[6.5]PB[Test Black]PW[Test White]RE[W+R]
;B[pd];W[dp];B[pp];W[dd];B[fq];W[cn];B[jp];W[nc];B[pf];W[jd]
;B[aa];W[qq];B[qp];W[pq];B[op];W[oq];B[nq];W[nr];B[mq];W[rp]
;B[ro];W[rq];B[qn];W[mr];B[lq];W[fc])`;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(sgf => {
  document.querySelector("textarea").value = sgf;
  document.querySelector(".sgf-loader button.primary").click();
}, SGF);
await page.waitForSelector(".review svg circle");
const loaded = await page.evaluate(() => ({
  stones: document.querySelectorAll(".board-card circle").length,
  title: document.querySelector(".meta-title").textContent,
  pos: document.querySelector(".rv-nav .pos").textContent,
}));
console.log("loaded:", JSON.stringify(loaded));

// jump to end, then analyze
await page.evaluate(() => {
  document.querySelectorAll(".rv-nav button")[3].click(); // ▶|
  document.querySelector(".rv-actions button.primary").click(); // analyze
});
await page.waitForFunction(
  () => document.querySelector(".rv-progress").textContent.startsWith("Analyzed"),
  { timeout: 120000 });
const analyzed = await page.evaluate(() => ({
  progress: document.querySelector(".rv-progress").textContent,
  mistakes: [...document.querySelectorAll(".mistake")].map(m => m.textContent.trim()),
  chartPath: !!document.querySelector(".chart-wrap svg path"),
  chartDots: document.querySelectorAll(".chart-wrap svg circle").length,
  pos: document.querySelector(".rv-nav .pos").textContent,
}));
console.log(JSON.stringify(analyzed, null, 2));

// click first mistake → board jumps
await page.evaluate(() => document.querySelector(".mistake")?.click());
const afterJump = await page.evaluate(() => document.querySelector(".rv-nav .pos").textContent);
console.log("after mistake click:", afterJump);
await browser.close();
