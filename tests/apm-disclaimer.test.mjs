/**
 * Guard: the APM affiliation disclaimer stays visible on the PMQ course
 * overview footer, and its wording stays consistent with the published Terms.
 *
 * Why this test exists: the disclaimer line has been silently deleted from
 * `SiteFooter.tsx` twice by unrelated redesign passes (Linear LIC-48), and the
 * second time the ticket was closed "Done" on commit inspection alone while the
 * live site had no disclaimer at all. "APM" and "PMQ" are the Association for
 * Project Management's trade marks and we charge money for material aimed at
 * their syllabus, so this is a legal exposure, not a copy nit.
 *
 * Placement (2026-07-30): disclaimer is opt-in on `SiteFooter` and enabled only
 * for `/courses/pmq-in-5-days` via `CoursesSiteFooter` — not site-wide.
 *
 * There's no DOM renderer in this repo (tests are plain `node --test`), so these
 * are source-level assertions. That's sufficient for the failure mode we've
 * actually hit — the string being deleted outright.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const read = (relative) => readFile(join(root, relative), "utf8");

test("APM_DISCLAIMER is defined and names APM explicitly", async () => {
  const source = await read("src/lib/legal-copy.ts");

  const disclaimer = source.match(
    /export const APM_DISCLAIMER\s*=\s*\n?\s*"([^"]+)"/,
  )?.[1];

  assert.ok(disclaimer, "APM_DISCLAIMER export missing from src/lib/legal-copy.ts");
  assert.match(
    disclaimer,
    /not affiliated with/i,
    "disclaimer must say it is not affiliated",
  );
  assert.match(
    disclaimer,
    /\bAPM\b/,
    "disclaimer must name APM explicitly, not just 'the awarding body'",
  );
  assert.match(
    disclaimer,
    /endorsed by/i,
    "disclaimer must disclaim endorsement, not only affiliation",
  );
});

test("site footer can render the disclaimer constant", async () => {
  const source = await read("src/components/SiteFooter.tsx");

  assert.match(
    source,
    /import \{[^}]*APM_DISCLAIMER[^}]*\} from "@\/lib\/legal-copy"/,
    "SiteFooter must import APM_DISCLAIMER from @/lib/legal-copy",
  );
  assert.match(
    source,
    /showApmDisclaimer/,
    "SiteFooter must gate the disclaimer with showApmDisclaimer — do not delete the render path",
  );
  assert.match(
    source,
    /\{APM_DISCLAIMER\}/,
    "SiteFooter must render {APM_DISCLAIMER} when enabled — do not remove during a redesign, gate it",
  );
});

test("PMQ course overview footer enables the APM disclaimer", async () => {
  const [footer, layout] = await Promise.all([
    read("src/components/CoursesSiteFooter.tsx"),
    read("src/app/courses/layout.tsx"),
  ]);

  assert.match(
    footer,
    /showApmDisclaimer/,
    "CoursesSiteFooter must pass showApmDisclaimer into SiteFooter",
  );
  assert.match(
    footer,
    /pmq-in-5-days|PMQ_SLUG/,
    "CoursesSiteFooter must key the disclaimer to the PMQ overview path",
  );
  assert.match(
    layout,
    /CoursesSiteFooter/,
    "courses layout must mount CoursesSiteFooter so the overview can show the disclaimer",
  );
});

test("public PMQ marketing overview imports the APM disclaimer", async () => {
  const page = await read("src/app/(site)/pmq/page.tsx");
  assert.match(
    page,
    /APM_DISCLAIMER/,
    "public /pmq overview must import APM_DISCLAIMER",
  );
});

test("footer wording stays consistent with TERMS_OF_SERVICE.md", async () => {
  const [legalCopy, terms] = await Promise.all([
    read("src/lib/legal-copy.ts"),
    read("legal/TERMS_OF_SERVICE.md"),
  ]);

  const disclaimer = legalCopy.match(
    /export const APM_DISCLAIMER\s*=\s*\n?\s*"([^"]+)"/,
  )?.[1];

  assert.ok(disclaimer, "APM_DISCLAIMER export missing");

  // The Terms must carry the same substantive claim. If someone softens or
  // removes it there, the footer would be asserting something the contract
  // doesn't — which is the drift that caused this ticket in the first place.
  assert.match(
    terms,
    /not affiliated with, endorsed by, or acting on behalf of[\s\S]*\bAPM\b/i,
    "TERMS_OF_SERVICE.md §2 must retain the affiliation disclaimer clause",
  );
  assert.match(
    terms,
    /Association for Project Management/,
    "Terms must spell out APM in full at least once",
  );
});
