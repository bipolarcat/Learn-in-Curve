import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/courses/pmq-in-5-days/pricing", {
    waitUntil: "networkidle",
  });
  const info = await page.evaluate(() => {
    const tagline = document.querySelector("p[class*='tagline']");
    const split = document.querySelector("[class*='split']");
    if (!tagline || !split) {
      return {
        taglineClass: [...document.querySelectorAll("p")].slice(0, 8).map((p) => p.className),
      };
    }
    const ts = getComputedStyle(tagline);
    const ss = getComputedStyle(split);
    const tr = tagline.getBoundingClientRect();
    const sr = split.getBoundingClientRect();
    return {
      taglineText: tagline.textContent,
      tagline: {
        minHeight: ts.minHeight,
        height: ts.height,
        marginTop: ts.marginTop,
        marginBottom: ts.marginBottom,
        paddingBottom: ts.paddingBottom,
        lineHeight: ts.lineHeight,
        fontSize: ts.fontSize,
        rect: { top: tr.top, bottom: tr.bottom, height: tr.height },
      },
      split: {
        marginTop: ss.marginTop,
        paddingTop: ss.paddingTop,
        borderTopWidth: ss.borderTopWidth,
        rect: { top: sr.top, bottom: sr.bottom, height: sr.height },
      },
      gap: sr.top - tr.bottom,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
