import { expect, test } from "playwright/test";

test("selected Pro paper survives the sign-in redirect", async ({ page }) => {
  await page.goto("/courses/pmq-in-5-days/mock?tier=full&exam=3");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  const destination = await page.evaluate(
    () => new URL(window.location.href).searchParams.get("next"),
  );
  expect(destination).toBe(
    "/courses/pmq-in-5-days/mock?tier=full&exam=3",
  );
});

test("mismatched tier and paper canonicalize to free Exam 1", async ({
  page,
}) => {
  await page.goto("/courses/pmq-in-5-days/mock?tier=full&exam=1");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  const destination = await page.evaluate(
    () => new URL(window.location.href).searchParams.get("next"),
  );
  expect(destination).toBe(
    "/courses/pmq-in-5-days/mock?tier=lite&exam=1",
  );
});
