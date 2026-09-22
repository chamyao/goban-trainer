import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false, args: ["--window-size=1200,900"], defaultViewport: null,
});
const page = (await browser.pages())[0] || await browser.newPage();
const visible = () => page.evaluate(() => {
  const b = document.getElementById("authModalBackdrop");
  return getComputedStyle(b).display !== "none" && b.getBoundingClientRect().width > 0;
});
await page.goto("http://localhost:8321/#/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector("#authModal input");
console.log("modal visible on first load:", await visible());
await page.type("#authModal input", "fable", { delay: 40 });
await page.evaluate(() => [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Save").click());
await new Promise(r => setTimeout(r, 500));
console.log("modal visible after Save:", await visible());
await page.screenshot({ path: "/tmp/login-fixed-saved.png" });
await page.evaluate(() => document.getElementById("authChip").click());
await new Promise(r => setTimeout(r, 300));
console.log("visible after Switch:", await visible(),
  "| box:", await page.evaluate(() => JSON.stringify(document.querySelector("#authModal input").value)),
  "| placeholder:", await page.evaluate(() => document.querySelector("#authModal input").placeholder));
await page.evaluate(() => [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Cancel").click());
await new Promise(r => setTimeout(r, 300));
console.log("visible after Cancel:", await visible());
await new Promise(r => setTimeout(r, 2500));
await browser.close();
