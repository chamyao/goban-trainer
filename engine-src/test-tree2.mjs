import puppeteer from "puppeteer-core";
const SGF = `(;GM[1]FF[4]SZ[19]KM[6.5]PB[B]PW[W]
;B[pd];W[dp];B[pp];W[dd];B[fq];W[cn];B[jp];W[nc];B[pf];W[jd];B[cf];W[ch])`;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(sgf => {
  document.querySelector("textarea").value = sgf;
  document.querySelector(".sgf-loader button.primary").click();
}, SGF);
await page.waitForSelector(".review svg");
const out = await page.evaluate(() => {
  const rv = window.__review;
  const R = () => document.querySelector(".rv-nav .pos").textContent;
  const res = {};
  res.rows = document.querySelectorAll(".mt-row").length;           // 6 rows for 12 moves
  rv.jump(4);                                                        // after W D16
  rv.click(16, 5);  // B R14 — variation to move 5
  rv.click(2, 13);  // W C6-ish reply inside variation
  res.inVar = R();
  res.varBlocks = document.querySelectorAll(".mt-var").length;       // 1 interrupt block
  rv.back(); rv.back();
  res.backOnMain = R();
  rv.forward();                                                      // main child first
  res.forwardMain = R();
  rv.jump(4);
  rv.click(16, 5);                                                   // re-enter existing variation
  res.reenter = R();
  res.varStillOne = document.querySelectorAll(".mt-var").length;
  // sibling switch: at var node, ArrowUp equivalent
  rv.sibling(-1);
  res.siblingMain = R();
  // delete branch
  rv.jump(4); rv.click(16, 5);
  rv.deleteBranch();
  res.afterDeleteVarBlocks = document.querySelectorAll(".mt-var").length;
  res.afterDelete = R();
  // collapse
  document.querySelector(".mt-toggle").click();
  res.collapsedHidden = document.querySelector(".movetree").style.display === "none";
  document.querySelector(".mt-toggle").click();
  res.rowsAfterReopen = document.querySelectorAll(".mt-row").length;
  return res;
});
console.log(JSON.stringify(out, null, 2));
await page.screenshot({ path: "/tmp/review-tree.png" });
await browser.close();
