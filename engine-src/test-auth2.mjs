import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new", args: ["--enable-unsafe-webgpu"],
});
const page = await browser.newPage();
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8321/#/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#authModal input", { timeout: 10000 });
await page.type("#authModal input", "cham");
await page.evaluate(() => [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Save").click());
await new Promise(r => setTimeout(r, 500));
const s1 = await page.evaluate(() => ({
  modalHidden: document.getElementById("authModalBackdrop").hidden,
  chip: document.getElementById("authChip").textContent,
}));
console.log("after save:", JSON.stringify(s1));
// reopen via Switch — box must be EMPTY with current name as placeholder
await page.evaluate(() => document.getElementById("authChip").click());
await new Promise(r => setTimeout(r, 200));
const s2 = await page.evaluate(() => {
  const inp = document.querySelector("#authModal input");
  return { value: inp.value, placeholder: inp.placeholder,
           modalHidden: document.getElementById("authModalBackdrop").hidden };
});
console.log("reopened:", JSON.stringify(s2));
// no leaked secrets anywhere in served JS
const leaked = await page.evaluate(async () => {
  const src = await (await fetch("app.js")).text();
  return /ghp_[A-Za-z0-9]{20,}/.test(src) || /7f7f5c3a7dd5d77284e36f75bd515a8b/.test(src);
});
console.log("secrets in app.js:", leaked);
// engine still boots with rebuilt bundle
await page.evaluate(() => { document.getElementById("authModalBackdrop").hidden = true; window.__engine.ensure(); });
await page.waitForFunction(() => ["ready","error"].includes(window.__engine.status), { timeout: 60000 });
console.log("engine:", await page.evaluate(() => window.__engine.status + " " + window.__engine.backend));
await browser.close();
