import { expect, test } from "playwright/test";

const protectedDestination =
  "/courses/pmq-in-5-days/lo/4?stage=quiz&set=2";

test("sign-up preserves next and explains required Terms acceptance", async ({
  page,
}) => {
  await page.goto(
    `/auth/sign-up?next=${encodeURIComponent(protectedDestination)}`,
  );

  const terms = page.getByRole("checkbox");
  const google = page.getByRole("button", {
    name: "Continue with Google",
  });

  await expect(terms).toBeVisible();
  await expect(google).toBeEnabled();
  const [termsBox, googleBox] = await Promise.all([
    terms.boundingBox(),
    google.boundingBox(),
  ]);
  expect(termsBox).not.toBeNull();
  expect(googleBox).not.toBeNull();
  expect(termsBox!.y).toBeLessThan(googleBox!.y);

  await google.click();
  await expect(terms).toBeFocused();
  await expect(terms).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("alert").filter({ hasText: "Please agree" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    `/auth/sign-in?next=${encodeURIComponent(protectedDestination)}`,
  );
});

test("malformed or looping next values fall back safely", async ({ page }) => {
  await page.goto("/auth/sign-up?next=%2Fauth%2Fsign-in");
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/auth/sign-in?next=%2Fdashboard",
  );
});

test("OAuth callback errors retain the validated destination", async ({
  page,
}) => {
  await page.goto(
    `/auth/callback?next=${encodeURIComponent(protectedDestination)}`,
  );

  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === "/auth/sign-in" &&
      url.searchParams.get("next") === protectedDestination &&
      url.searchParams.get("error") === "oauth"
    );
  });
});

test("middleware keeps the full protected dashboard query string", async ({
  page,
}) => {
  await page.goto("/dashboard?panel=sly&topup=success");

  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === "/auth/sign-in" &&
      url.searchParams.get("next") ===
        "/dashboard?panel=sly&topup=success"
    );
  });
});
