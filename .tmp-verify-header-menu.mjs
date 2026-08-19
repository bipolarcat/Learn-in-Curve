import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const dashBtns = await page.getByRole("button", { name: "Dashboard" }).count();
const signOutBtns = await page.getByRole("button", { name: "Sign out" }).count();
await page.getByRole("button", { name: "Open menu" }).click();
await page.waitForTimeout(400);
const menuText = await page.getByRole("menu", { name: "Site" }).innerText();
const myDash = await page.getByRole("menuitem", { name: "My dashboard" }).count();
const signMeOut = await page.getByRole("menuitem", { name: "Sign me out" }).count();
await page.screenshot({ path: ".tmp-header-guest-menu.png" });
await browser.close();

console.log({ dashBtns, signOutBtns, myDash, signMeOut, menuText });
if (dashBtns !== 0 || signOutBtns !== 0) throw new Error("header still has account buttons as guest");
if (myDash !== 0 || signMeOut !== 0) throw new Error("guest menu shows signed-in items");
