import { gunzipSync, inflateSync } from "node:zlib";
import { expect, test, type Request } from "playwright/test";

/**
 * Landing from a Reddit ad must send a pageview through the first-party
 * proxy before the cookie banner is touched, with no analytics cookie or
 * localStorage. Reject stays cookieless. Accept turns persistence on.
 *
 * PostHog drops events when navigator.webdriver is set or the UA looks
 * headless, which is how this runner launches. The overrides below only
 * hide that from the SDK so the test can see a real capture.
 */

const LANDING =
  "/free-mock-exam/apm-pmq?utm_source=reddit&utm_campaign=pmq_test";

const HUMAN_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

test.use({ userAgent: HUMAN_UA });

function requestText(request: Request): string {
  const bytes = request.postDataBuffer();
  if (!bytes) return request.postData() ?? "";
  const raw = Buffer.from(bytes);
  for (const decode of [gunzipSync, inflateSync]) {
    try {
      return decode(raw).toString("utf8");
    } catch {
      /* plain body */
    }
  }
  return raw.toString("utf8");
}

function isPageview(request: Request): boolean {
  if (request.method() !== "POST") return false;
  const path = new URL(request.url()).pathname;
  if (!path.startsWith("/rq/")) return false;
  return requestText(request).includes('"$pageview"') || requestText(request).includes("$pageview");
}

test("reddit landing is cookieless until accept", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "userAgentData", {
      get: () => ({
        brands: [
          { brand: "Chromium", version: "124" },
          { brand: "Google Chrome", version: "124" },
        ],
        mobile: true,
        platform: "iOS",
      }),
    });
  });

  const captures: Request[] = [];
  page.on("request", (request) => {
    if (isPageview(request)) captures.push(request);
  });

  await page.goto(LANDING, { waitUntil: "domcontentloaded" });

  await expect.poll(() => captures.length, { timeout: 15_000 }).toBeGreaterThan(0);

  const landing = requestText(captures[0]);
  expect(landing).toContain("$pageview");
  expect(landing).toContain("utm_source=reddit");
  expect(landing).toContain("utm_campaign=pmq_test");
  expect(new URL(captures[0].url()).pathname.startsWith("/rq/")).toBe(true);
  const landingDistinctId = landing.match(/"distinct_id":"([^"]+)"/)?.[1];
  expect(landingDistinctId).toBeTruthy();

  const storage = await page.evaluate(() => ({
    cookie: document.cookie,
    localKeys: Object.keys(localStorage),
    sessionKeys: Object.keys(sessionStorage),
  }));
  expect(storage.cookie).not.toMatch(/(^|;\s*)ph_/);
  expect(
    storage.localKeys.filter(
      (key) => key.startsWith("ph_") || key.includes("posthog"),
    ),
  ).toEqual([]);
  expect(storage.localKeys).not.toContain("lic_cookie_consent_v2");
  expect(storage.sessionKeys).not.toContain("lic_attr_v1");

  await page.getByRole("button", { name: "Accept" }).click();

  await expect
    .poll(async () => {
      return page.evaluate((distinctId) => {
        const stored = Object.entries(localStorage).some(
          ([key, value]) =>
            (key.startsWith("ph_") || key.includes("posthog")) &&
            value.includes(distinctId),
        );
        return stored || document.cookie.includes(distinctId);
      }, landingDistinctId!);
    })
    .toBe(true);
  expect(
    await page.evaluate(() => localStorage.getItem("lic_cookie_consent_v2")),
  ).toBe("granted");

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  captures.length = 0;
  await page.goto(LANDING, { waitUntil: "domcontentloaded" });
  await expect.poll(() => captures.length, { timeout: 15_000 }).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Reject" }).click();

  const afterReject = await page.evaluate(() => ({
    cookie: document.cookie,
    localKeys: Object.keys(localStorage),
    sessionKeys: Object.keys(sessionStorage),
    consent: localStorage.getItem("lic_cookie_consent_v2"),
  }));
  expect(afterReject.consent).toBe("denied");
  expect(afterReject.cookie).not.toMatch(/(^|;\s*)ph_/);
  expect(
    afterReject.localKeys.filter(
      (key) => key.startsWith("ph_") || key.includes("posthog"),
    ),
  ).toEqual([]);
  expect(afterReject.sessionKeys).not.toContain("lic_attr_v1");

  const beforeNav = captures.length;
  await page.goto("/free-mock-exam/apm-pfq", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => captures.length > beforeNav, { timeout: 15_000 })
    .toBe(true);
  const stillCookieless = await page.evaluate(() =>
    Object.keys(localStorage).filter(
      (key) => key.startsWith("ph_") || key.includes("posthog"),
    ),
  );
  expect(stillCookieless).toEqual([]);
});
