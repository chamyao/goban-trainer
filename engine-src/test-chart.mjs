import puppeteer from "puppeteer-core";
const SGF = `(;GM[1]FF[4]SZ[19]KM[6.5]PB[Test Black]PW[Test White]RE[W+R]
;B[pd];W[dp];B[pp];W[dd];B[fq];W[cn];B[jp];W[nc];B[pf];W[jd]
;B[aa];W[qq];B[qp];W[pq];B[op];W[oq];B[nq];W[nr];B[mq];W[rp]
;B[ro];W[rq];B[qn];W[mr];B[lq];W[fc])`;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 950 });
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(sgf => {
  document.querySelector("textarea").value = sgf;
  document.querySelector(".sgf-loader button.primary").click();
}, SGF);
await page.waitForSelector(".review svg");
await page.evaluate(() => {
  window.__review.jump(12);
  document.querySelector(".rv-actions button.primary").click();
});
await page.waitForFunction(() => document.querySelector(".rv-progress").textContent.startsWith("Analyzed"),
  { timeout: 120000 });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: "/tmp/review-chart.png" });
console.log("readout:", await page.evaluate(() => document.querySelector(".rv-nav .pos").textContent));
await browser.close();
