import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("semantic UI families stay explicit and narrow", async () => {
  const source = await readFile(
    new URL("src/components/ui/semantic.ts", root),
    "utf8",
  );

  for (const name of [
    "marketingStampSurface",
    "productSurface",
    "quietFormSurface",
    "conversationSurface",
    "marketingActionPrimary",
    "productActionPrimary",
    "formActionPrimary",
    "iconAction",
  ]) {
    assert.match(source, new RegExp(`export const ${name}\\b`));
  }
  assert.doesNotMatch(source, /universalCard|cardVariant/);
});

test("component-owned styles are no longer global contracts", async () => {
  const globals = await readFile(new URL("src/app/globals.css", root), "utf8");

  for (const selector of [
    ".auth-saas-input",
    ".sly-panel-shell",
    ".sly-composer",
    ".pmq-overview-settle",
    ".lo-orient-panel",
    ".notify-input--error",
    ".sly-mac-bubble-in",
  ]) {
    assert.ok(!globals.includes(selector), `${selector} remained global`);
  }
});

test("retired visual clusters stay deleted", async () => {
  for (const path of [
    "src/components/AboutCards.tsx",
    "src/components/HeroBoardingPass.tsx",
    "src/components/JourneyPath.tsx",
    "src/components/CourseProgressCard.tsx",
    "src/components/HeroIllustration.tsx",
    "src/components/HeroFlightScene.tsx",
    "src/components/DashboardBackdrop.tsx",
    "src/components/DashboardHomeScene.tsx",
  ]) {
    await assert.rejects(access(new URL(path, root)));
  }
});
