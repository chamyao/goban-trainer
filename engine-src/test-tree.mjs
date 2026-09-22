import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.goto("http://localhost:8321/#/book/seedling-project/47", { waitUntil: "networkidle0" });
const out = await page.evaluate(async () => {
  const t = window.__trainer;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const play = async (c, r) => { t.click(c, r); await wait(600); };
  await play(17, 0);           // B S19 (correct)
  const afterFirst = { played: t.played.slice(), status: document.getElementById("status").textContent };
  await play(16, 0);           // B R19 (continue main line after W Q18)
  await wait(600);
  const state = { played: t.played.slice(), done: t.done, status: document.getElementById("status").textContent };
  // continue if white threw in (line 2): respond by recapturing R19
  if (!t.done && t.played.length >= 4) { await play(16, 0); }
  return { afterFirst, mid: state,
           final: { played: t.played, done: t.done, status: document.getElementById("status").textContent },
           progress: JSON.parse(localStorage.getItem("gt-progress") || "{}") };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
