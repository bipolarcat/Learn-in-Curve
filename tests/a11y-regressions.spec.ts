import { expect, test } from "playwright/test";

function luminance([r, g, b]: number[]) {
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: number[], background: number[]) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function rgb(value: string) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an RGB color, received "${value}"`);
  }
  return channels;
}

test("course catalogue exposes skip navigation and ordered headings", async ({
  page,
}) => {
  await page.goto("/courses");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await expect(page.locator("main#main-content")).toHaveCount(1);

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(2);
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(0);
});

test("privacy keeps wide markdown tables inside their own scroll region", async ({
  page,
}) => {
  await page.goto("/privacy");

  const artifact = page.getByRole("region", { name: "Scrollable table" });
  await expect(artifact).toBeVisible();
  const widths = await page.evaluate(() => {
    const region = document.querySelector<HTMLElement>(
      ".markdown-wide-artifact",
    );
    return {
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      artifactScroll: region?.scrollWidth ?? 0,
      artifactClient: region?.clientWidth ?? 0,
    };
  });
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  expect(widths.artifactScroll).toBeGreaterThanOrEqual(widths.artifactClient);
});

test("course preview starts with the course name as its h1", async ({
  page,
}) => {
  await page.goto("/courses/pmq-in-5-days/preview");
  await expect(
    page.getByRole("heading", { level: 1, name: /PMQ in 5 days/i }),
  ).toBeVisible();
});

test("shared stamps and auth controls are touch-sized with AA text", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");

  const controls = page.locator(
    ".auth-saas-input, .auth-saas-btn, header .h-11",
  );
  const boxes = await controls.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  const primaryColors = await page
    .locator(".auth-saas-btn--primary")
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor };
    });
  expect(
    contrast(rgb(primaryColors.color), rgb(primaryColors.background)),
  ).toBeGreaterThanOrEqual(4.5);

  const placeholderColors = await page
    .locator(".auth-saas-input")
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element, "::placeholder");
      return {
        color: style.color,
        background: getComputedStyle(element).backgroundColor,
      };
    });
  expect(
    contrast(
      rgb(placeholderColors.color),
      rgb(placeholderColors.background),
    ),
  ).toBeGreaterThanOrEqual(4.5);
});
