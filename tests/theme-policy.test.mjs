import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { allowsDarkMode, parseThemeChoice } from "../src/lib/theme-routes.ts";

/**
 * Guards the dark-mode policy (LIC-107 / LIC-114).
 *
 * Dark mode has to be resolved in a blocking inline script in <head>, because
 * anything that resolves after hydration shows a flash of the wrong theme on
 * every load. That means the rules exist twice: once in theme-routes.ts for
 * client navigation, and once as a hand-written string in layout.tsx for first
 * paint. Two copies drift, so this test runs the string that actually ships and
 * asserts both agree.
 *
 * The rule that broke and must never come back: the resolver used to fall back
 * to `prefers-color-scheme` when nothing was stored, so a first sign-in on a
 * machine with OS dark mode opened the dashboard dark having never been asked.
 */

const layout = readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const themeRoutes = readFileSync(
  new URL("../src/lib/theme-routes.ts", import.meta.url),
  "utf8",
);

function shippedResolver() {
  const match = layout.match(/__html: `(\(function\(\)\{var d=document[\s\S]*?)`,/);
  assert.ok(match, "could not find the inline theme resolver in layout.tsx");
  return match[1].replace(/\\\\/g, "\\");
}

/** Runs the shipped resolver against a fake document and returns what it did. */
function resolve(pathname, cookie) {
  const documentElement = {
    style: {},
    classList: {
      set: new Set(),
      add(c) {
        this.set.add(c);
      },
      remove(c) {
        this.set.delete(c);
      },
      contains(c) {
        return this.set.has(c);
      },
    },
  };
  new Function("document", "location", shippedResolver())(
    { documentElement, cookie },
    { pathname },
  );
  return {
    dark: documentElement.classList.contains("dark"),
    colorScheme: documentElement.style.colorScheme,
  };
}

/** Comments are allowed to name the bug; code is not allowed to reintroduce it. */
function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

test("the OS colour-scheme setting is never consulted", () => {
  assert.ok(
    !/prefers-color-scheme|matchMedia/.test(shippedResolver()),
    "the first-paint resolver must not read the OS colour scheme — that is LIC-107",
  );
  assert.ok(
    !/prefers-color-scheme|matchMedia/.test(withoutComments(layout)),
    "layout.tsx must not read the OS colour scheme",
  );
  assert.ok(
    !/prefers-color-scheme|matchMedia/.test(withoutComments(themeRoutes)),
    "theme-routes.ts must not read the OS colour scheme",
  );
});

test("dark mode is limited to the dashboard and LO pages", () => {
  for (const path of ["/dashboard", "/dashboard/", "/courses/pmq-in-5-days/lo/1", "/courses/pmq-in-5-days/lo/24"]) {
    assert.equal(allowsDarkMode(path), true, path);
    assert.equal(resolve(path, "lic_theme=dark").dark, true, path);
  }
});

test("every public page is light, whatever is stored", () => {
  const publicPaths = [
    "/",
    "/about",
    "/careers",
    "/privacy",
    "/terms",
    "/courses",
    "/courses/pmq-in-5-days",
    "/courses/pmq-in-5-days/pricing",
    "/courses/pmq-in-5-days/preview",
    "/courses/pmq-in-5-days/mock",
    "/auth/sign-in",
  ];

  for (const path of publicPaths) {
    assert.equal(allowsDarkMode(path), false, path);
    const applied = resolve(path, "lic_theme=dark");
    assert.equal(applied.dark, false, `${path} must stay light`);
    assert.equal(applied.colorScheme, "only light", path);
  }
});

test("a brand-new user is light, and only an explicit dark opts in", () => {
  // No cookie at all — the state a first-time user is in.
  assert.equal(resolve("/dashboard", "").dark, false);
  assert.equal(resolve("/dashboard", "lic_theme=light").dark, false);
  assert.equal(resolve("/dashboard", "other=1").dark, false);
  assert.equal(resolve("/dashboard", "lic_theme=dark").dark, true);

  assert.equal(parseThemeChoice(undefined), "light");
  assert.equal(parseThemeChoice(null), "light");
  assert.equal(parseThemeChoice("DARK"), "light");
  assert.equal(parseThemeChoice("dark"), "dark");
});

test("colorScheme uses `only`, so Chrome cannot auto-darken past the policy", () => {
  // Plain `color-scheme: light` still lets Chrome/Edge remap form controls and
  // scrollbars when the OS prefers dark — `only` is what actually pins it.
  assert.equal(resolve("/", "lic_theme=dark").colorScheme, "only light");
  assert.equal(resolve("/dashboard", "lic_theme=dark").colorScheme, "only dark");
});
