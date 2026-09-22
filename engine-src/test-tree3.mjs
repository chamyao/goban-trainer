import puppeteer from "puppeteer-core";
// long game (120 moves) + variations to exercise the tree graph + scrolling
const moves = [];
const pool = "abcdefghijklmnopqrs";
let occ = new Set();
// deterministic legal-ish scatter (no captures likely): spiral fill
const seq = ["pd","dp","pp","dd","fq","cn","jp","nc","pf","jd","cf","ch","ef","fd","bd","cc","dj","dl","fj","fl",
"hq","nq","lq","no","pn","pr","qq","kp","kq","jq","lp","ko","jr","lr","mr","lo","qr","rr","qc","qd",
"pc","od","oc","nd","mc","rd","rc","md","ld","le","ke","kd","lc","kc","lb","kf","je","mf","lf","qh",
"qj","oh","ph","pg","pi","oi","qg","oj","ql","om","pl","pm","ol","qm","qi","rl","ri","rj","mb","la",
"nb","re","rh","si","gc","gd","hc","hd","ic","fc","fb","eb","ib","fa","db","dc","cb","ec","ca","bb",
"gf","gg","hf","hg","if","fg","ff","eg","fe","jg","ig","jh","ih","ii","hi","ij","hj","hk","gj","gi"];
const sgf = "(;GM[1]FF[4]SZ[19]KM[6.5]PB[B]PW[W];" +
  seq.map((m, i) => `${i % 2 ? "W" : "B"}[${m}]`).join(";") + ")";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/review", { waitUntil: "networkidle0" });
await page.evaluate(s => {
  document.querySelector("textarea").value = s;
  document.querySelector(".sgf-loader button.primary").click();
}, sgf);
await page.waitForSelector(".review svg");
const out = await page.evaluate(() => {
  const rv = window.__review;
  rv.jump(40);
  rv.click(0, 0); rv.click(1, 0); rv.click(0, 1);   // variation at 40
  rv.jump(80);
  rv.click(18, 18); rv.click(17, 18);                // variation at 80
  rv.jump(60);
  const box = document.querySelector(".movetree");
  const svg = box.querySelector("svg");
  return {
    nodes: svg.querySelectorAll("circle").length,     // ~121 + 5 var + cur ring
    svgWidth: +svg.getAttribute("width"),
    svgHeight: +svg.getAttribute("height"),
    boxWidth: box.clientWidth,
    scrollLeft: Math.round(box.scrollLeft),
    readout: document.querySelector(".rv-nav .pos").textContent,
  };
});
console.log(JSON.stringify(out, null, 2));
await page.screenshot({ path: "/tmp/review-tree3.png" });
await browser.close();
