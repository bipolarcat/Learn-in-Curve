#!/usr/bin/env node
/**
 * Pre-commit guard: no em dash (U+2014) or en dash (U+2013) in page titles.
 *
 * Scope is deliberately narrow. The repo still has ~300 files with dashes in
 * body copy, and a blanket ban would fail every commit that touches any of
 * them. This checks TITLES only, which is what actually shows in a browser tab
 * and a search result. Widen the SCAN regex once the prose pass is done.
 *
 * Skip once: LIC_SKIP_DASH_CHECK=1 git commit ...
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

if (process.env.LIC_SKIP_DASH_CHECK === "1") process.exit(0);

const DASH = /[–—]/;
// Lines that define a browser/search title.
const TITLE_LINE = /(^|\s)(title|metaTitle|pageTitle|ROOT_TITLE|PAGE_TITLE)\s*[:=]/;

const staged = execSync("git diff --cached --name-only --diff-filter=ACM", {
  encoding: "utf8",
})
  .split("\n")
  .map((f) => f.trim())
  .filter((f) => /^src\/.*\.(ts|tsx)$/.test(f));

const problems = [];
for (const file of staged) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    if (TITLE_LINE.test(line) && DASH.test(line)) {
      problems.push(`${file}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (problems.length) {
  console.error("\nCommit blocked: em/en dash found in a page title.\n");
  problems.forEach((p) => console.error("  " + p));
  console.error(
    "\nBuild titles with buildTitle() from src/lib/seo/title.ts, or use a colon.",
  );
  console.error("Override once with LIC_SKIP_DASH_CHECK=1 git commit ...\n");
  process.exit(1);
}
