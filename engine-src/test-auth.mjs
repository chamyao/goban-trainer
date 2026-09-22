import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
page.on("console", m => console.log("[console]", m.type(), m.text().slice(0, 150)));
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:8322/#/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#authModal input", { timeout: 10000 });
await page.type("#authModal input", "testuser");
await page.evaluate(() => [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Save").click());
await new Promise(r => setTimeout(r, 4000));
const state = await page.evaluate(() => ({
  modalHidden: document.getElementById("authModalBackdrop").hidden,
  inputValue: document.querySelector("#authModal input")?.value,
  saveDisabled: [...document.querySelectorAll("#authModal button")].find(b => b.textContent === "Save")?.disabled,
  chip: document.getElementById("authChip").textContent,
  stored: localStorage.getItem("gt-username"),
}));
console.log(JSON.stringify(state, null, 2));
// reopen via Switch to see what the box shows
await page.evaluate(() => document.getElementById("authChip").click());
await new Promise(r => setTimeout(r, 300));
const reopened = await page.evaluate(() => ({
  modalHidden: document.getElementById("authModalBackdrop").hidden,
  inputValue: document.querySelector("#authModal input")?.value,
}));
console.log("reopened:", JSON.stringify(reopened));
await browser.close();
