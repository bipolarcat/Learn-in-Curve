import { chromium } from "playwright";

const url = "http://localhost:3000/pmq";

async function check(page, label, ok) {
  if (!ok) throw new Error(`fail: ${label}`);
  console.log("ok:", label);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });

await check(
  page,
  "h1",
  (await page.getByRole("heading", { level: 1 }).textContent())?.includes(
    "PMQ in",
  ),
);
await check(
  page,
  "secondary CTA",
  (await page.getByRole("link", { name: /See What's Included/i }).count()) >= 1,
);
await check(
  page,
  "nine feature h3s",
  (await page.locator("h3").count()) === 9,
);
await check(
  page,
  "Pro chips",
  (await page.getByText("Pro", { exact: true }).count()) >= 2,
);
await check(
  page,
  "Launching soon",
  (await page.getByText("Launching soon").count()) === 1,
);
await check(
  page,
  "pathway stages",
  (await page.getByText("Orient", { exact: true }).count()) >= 1 &&
    (await page.getByText("Checkpoint", { exact: true }).count()) >= 1,
);
await check(
  page,
  "no plan cards heading leftover",
  (await page.getByRole("link", { name: "View Plans" }).count()) === 0,
);
await check(
  page,
  "Sly homepage link",
  (await page.getByRole("link", { name: "try it on the homepage" }).count()) ===
    1,
);
await check(
  page,
  "FAQ product question",
  (await page.getByText("Is it actually free?").count()) >= 1,
);

await page.screenshot({
  path: ".tmp-pmq-overview-desktop.png",
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url, { waitUntil: "networkidle" });
await page.locator("#pmq-pathway-heading").scrollIntoViewIfNeeded();
await page.screenshot({
  path: ".tmp-pmq-overview-mobile-pathway.png",
  fullPage: false,
});

await browser.close();
console.log("screenshots written");
