import { expect, test } from "playwright/test";

/**
 * Launch guard: hero animals must never FOUC as a giant distorted frame.
 * Poster shows first; canvas may appear later. Soft-nav remount covered.
 */
async function assertHeroAnimalsHealthy(page: import("playwright").Page) {
  const scene = page.locator("[data-hero-animals]");
  await expect(scene).toBeVisible();
  await expect(scene).toHaveAttribute("data-box-ready", "true", {
    timeout: 8000,
  });
  await expect(scene).toHaveAttribute("data-poster-ready", "true", {
    timeout: 8000,
  });
  await expect(scene).toHaveAttribute("data-revealed", "true", {
    timeout: 8000,
  });

  const box = await scene.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  expect(box.w).toBeGreaterThanOrEqual(64);
  expect(box.w).toBeLessThanOrEqual(420);
  expect(box.h).toBeGreaterThanOrEqual(64);
  expect(box.h).toBeLessThanOrEqual(420);

  await expect
    .poll(
      async () => {
        return scene.evaluate((el) => {
          const poster = el.querySelector("img");
          const canvas = el.querySelector("canvas");
          const posterOp = poster
            ? Number(getComputedStyle(poster).opacity)
            : 0;
          const canvasOp = canvas
            ? Number(getComputedStyle(canvas).opacity)
            : 0;
          return posterOp + canvasOp;
        });
      },
      { timeout: 8000 },
    )
    .toBeGreaterThan(0.5);

  const overflow = await scene.evaluate((el) => {
    const boxW = el.getBoundingClientRect().width;
    return [...el.querySelectorAll("img, canvas")].some((node) => {
      const w = (node as HTMLElement).getBoundingClientRect().width;
      return w > boxW + 1;
    });
  });
  expect(overflow).toBe(false);
}

test("landing hero animals stay inside the reserved box and become visible", async ({
  page,
}) => {
  await page.goto("/");
  await assertHeroAnimalsHealthy(page);
});

test("landing hero animals stay sane after soft navigation remount", async ({
  page,
}) => {
  await page.goto("/");
  await assertHeroAnimalsHealthy(page);

  await page.goto("/about");
  await page.goto("/");
  await assertHeroAnimalsHealthy(page);

  const maxChildWidth = await page.evaluate(async () => {
    const scene = document.querySelector("[data-hero-animals]");
    if (!scene) return Infinity;
    let max = 0;
    const end = performance.now() + 800;
    while (performance.now() < end) {
      const boxW = scene.getBoundingClientRect().width;
      for (const node of scene.querySelectorAll("img, canvas")) {
        const el = node as HTMLElement;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || Number(style.opacity) < 0.05) {
          continue;
        }
        max = Math.max(max, el.getBoundingClientRect().width);
      }
      if (max > boxW + 2) return max;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return max;
  });
  const boxW = await page
    .locator("[data-hero-animals]")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(maxChildWidth).toBeLessThanOrEqual(boxW + 2);
});
