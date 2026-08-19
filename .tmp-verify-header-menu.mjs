import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const closedName = await page.getByRole("button", { name: "Open menu" }).getAttribute("aria-label");
const closedVisible = await page.locator("header, nav").getByRole("button", { name: "Open menu" }).evaluate((el) => el.textContent);
if (!/Menu/i.test(closedVisible?.replace(/\s+/g, "") ?? "")) {
  throw new Error(`expected Menu letters, got ${JSON.stringify(closedVisible)}`);
}

await page.getByRole("button", { name: "Open menu" }).click();
await page.waitForTimeout(450);

const openBtn = page.getByRole("button", { name: "Close menu" });
await openBtn.waitFor();
const openText = (await openBtn.innerText()).trim();
if (/Menu/i.test(openText)) throw new Error(`Menu label still visible when open: ${JSON.stringify(openText)}`);

const menu = page.getByRole("menu", { name: "Site" });
const text = await menu.innerText();
if (/My dashboard|Sign me out|Dark mode/i.test(text)) {
  throw new Error(`guest menu has signed-in chrome: ${text}`);
}

await page.screenshot({ path: ".tmp-header-menu-open.png" });
await browser.close();
console.log("ok guest", { closedName, closedVisible, openText, text });
