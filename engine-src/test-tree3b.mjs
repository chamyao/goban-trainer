import puppeteer from "puppeteer-core";
const seq = ["pd","dp","pp","dd","fq","cn","jp","nc","pf","jd"];
const sgf = "(;GM[1]FF[4]SZ[19]KM[6.5];" + seq.map((m,i) => `${i%2?"W":"B"}[${m}]`).join(";") + ")";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
page.on("pageerror", e => console.log("[pageerror]", e.message));
page.on("console", m => console.log("[console]", m.type(), m.text().slice(0, 200)));
console.log("goto...");
await page.goto("http://localhost:8321/#/review", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("loaded, injecting sgf");
await page.evaluate(s => {
  document.querySelector("textarea").value = s;
  document.querySelector(".sgf-loader button.primary").click();
}, sgf);
console.log("clicked load");
await page.waitForSelector(".review svg", { timeout: 10000 });
console.log("review rendered");
const out = await page.evaluate(() => {
  const rv = window.__review;
  rv.jump(4);
  rv.click(0, 0);
  return {
    nodes: document.querySelectorAll(".movetree circle").length,
    readout: document.querySelector(".rv-nav .pos").textContent,
  };
});
console.log(JSON.stringify(out));
await browser.close();
