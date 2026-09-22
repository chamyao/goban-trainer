import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  args: ["--window-size=1200,900"],
  defaultViewport: null,
});
const page = (await browser.pages())[0] || await browser.newPage();
await page.goto("http://localhost:8321/#/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector("#authModal input", { timeout: 10000 });
await page.screenshot({ path: "/tmp/login-1-modal.png" });
await page.type("#authModal input", "fable", { delay: 60 });
await page.screenshot({ path: "/tmp/login-2-typed.png" });
await page.evaluate(() => [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Save").click());
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: "/tmp/login-3-saved.png" });
const s1 = await page.evaluate(() => ({
  modalHidden: document.getElementById("authModalBackdrop").hidden,
  chip: document.getElementById("authChip").textContent,
  stored: localStorage.getItem("gt-username"),
}));
console.log("after save:", JSON.stringify(s1));
await page.evaluate(() => document.getElementById("authChip").click());
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: "/tmp/login-4-reopened.png" });
const s2 = await page.evaluate(() => {
  const i = document.querySelector("#authModal input");
  return { boxValue: JSON.stringify(i.value), placeholder: i.placeholder };
});
console.log("reopened:", JSON.stringify(s2));
await new Promise(r => setTimeout(r, 4000));
await browser.close();
