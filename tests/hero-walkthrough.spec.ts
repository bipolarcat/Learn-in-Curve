import { expect, test } from "playwright/test";

test("Macintosh walkthrough advances, pauses and preserves the mobile CTA", async ({
  page,
}) => {
  await page.goto("/");

  const walkthrough = page.locator("figure[data-scene]");
  const pause = page.getByRole("button", { name: "Pause PMQ walkthrough" });
  await expect(walkthrough).toHaveAttribute("data-scene", "overview");
  await expect(pause).toBeVisible();

  const layout = await page.evaluate(() => {
    const cta = document.querySelector(".hero-stamp-cta")?.getBoundingClientRect();
    return {
      ctaBottom: cta?.bottom ?? Number.POSITIVE_INFINITY,
      viewportHeight: window.innerHeight,
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });
  expect(layout.ctaBottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.overflow).toBe(0);

  await walkthrough.scrollIntoViewIfNeeded();
  await expect(walkthrough).toHaveAttribute("data-paused", "false");
  await expect
    .poll(() => walkthrough.getAttribute("data-scene"))
    .not.toBe("overview");

  await pause.click();
  const pausedScene = await walkthrough.getAttribute("data-scene");
  await page.waitForTimeout(1_800);
  await expect(walkthrough).toHaveAttribute("data-scene", pausedScene ?? "");
  await expect(
    page.getByRole("button", { name: "Play PMQ walkthrough" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion renders a static walkthrough without controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const walkthrough = page.locator("figure[data-scene]");
  await expect(walkthrough).toHaveAttribute("data-scene", "overview");
  await expect(
    page.getByRole("button", { name: /PMQ walkthrough/ }),
  ).toHaveCount(0);

  await page.waitForTimeout(1_800);
  await expect(walkthrough).toHaveAttribute("data-scene", "overview");

  const animationCount = await walkthrough.evaluate(
    (element) => element.getAnimations({ subtree: true }).length,
  );
  expect(animationCount).toBe(0);
});
