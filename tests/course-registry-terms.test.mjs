/**
 * Registry ↔ Terms Schedule consistency.
 * Fails if a course is added to one without the other.
 *
 * Imports registry-data only (no `@/` / Supabase) so node:test can run it.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  COURSE_STATIC,
  COURSE_STATIC_LIST,
  PFQ_PRO_PRICE_CENTS,
  PMQ_PRO_PRICE_CENTS,
} from "../src/lib/courses/registry-data.ts";
import { PFQ_COURSE_ID, PMQ_COURSE_ID } from "../src/lib/courses/ids.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const termsPath = join(root, "legal", "TERMS_OF_SERVICE.md");
const tutorConstantsPath = join(root, "src", "lib", "tutor", "constants.ts");
const pfqConstantsPath = join(root, "src", "lib", "pfq", "constants.ts");

function scheduleHeadings(markdown) {
  const scheduleIdx = markdown.indexOf("# Schedule — Courses");
  assert.ok(scheduleIdx >= 0, "Terms must contain a Schedule heading");
  const schedule = markdown.slice(scheduleIdx);
  return [...schedule.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
}

test("every registry course appears in the Terms Schedule by display name", () => {
  const terms = readFileSync(termsPath, "utf8");
  const headings = new Set(scheduleHeadings(terms));
  for (const course of COURSE_STATIC_LIST) {
    assert.ok(
      headings.has(course.displayName),
      `Registry course "${course.displayName}" (${course.slug}) missing from Terms Schedule`,
    );
  }
});

test("every Terms Schedule course appears in the registry by display name", () => {
  const terms = readFileSync(termsPath, "utf8");
  const headings = scheduleHeadings(terms);
  const names = new Set(COURSE_STATIC_LIST.map((c) => c.displayName));
  for (const heading of headings) {
    assert.ok(
      names.has(heading),
      `Terms Schedule course "${heading}" missing from COURSE_REGISTRY`,
    );
  }
});

test("price constants re-export the registry (no second literal)", () => {
  const tutorSrc = readFileSync(tutorConstantsPath, "utf8");
  assert.match(
    tutorSrc,
    /PMQ_PRO_PRICE_CENTS as SLY_UNLOCK_PRICE_CENTS/,
    "tutor/constants must re-export registry PMQ price, not declare 800",
  );
  assert.doesNotMatch(
    tutorSrc,
    /SLY_UNLOCK_PRICE_CENTS\s*=\s*800/,
    "SLY_UNLOCK_PRICE_CENTS must not restate 800",
  );

  const pfqSrc = readFileSync(pfqConstantsPath, "utf8");
  assert.match(
    pfqSrc,
    /PFQ_PRO_PRICE_CENTS as REGISTRY_PFQ_PRO_PRICE_CENTS|from \"@\/lib\/courses\/registry\"/,
  );
  assert.doesNotMatch(
    pfqSrc,
    /PFQ_PRO_PRICE_CENTS\s*=\s*500/,
    "pfq/constants must not restate 500",
  );

  assert.equal(PMQ_PRO_PRICE_CENTS, 800);
  assert.equal(PFQ_PRO_PRICE_CENTS, 600);
  assert.equal(COURSE_STATIC["pmq-in-5-days"].priceCents, PMQ_PRO_PRICE_CENTS);
  assert.equal(COURSE_STATIC["pfq-in-2-days"].priceCents, PFQ_PRO_PRICE_CENTS);
});

test("registry entries have required fields", () => {
  for (const course of COURSE_STATIC_LIST) {
    assert.ok(course.id);
    assert.ok(course.slug);
    assert.ok(course.displayName);
    assert.equal(typeof course.priceCents, "number");
    assert.ok(course.priceCents > 0);
    assert.ok(
      course.stripePriceId === null || typeof course.stripePriceId === "string",
    );
    assert.ok(Array.isArray(course.freeFeatures));
    assert.ok(Array.isArray(course.paidFeatures));
    assert.ok(course.paidFeatures.length > 0);
  }
  assert.equal(COURSE_STATIC["pmq-in-5-days"].id, PMQ_COURSE_ID);
  assert.equal(COURSE_STATIC["pfq-in-2-days"].id, PFQ_COURSE_ID);
});

test("PFQ has no free features; PMQ has free features", () => {
  assert.equal(COURSE_STATIC["pfq-in-2-days"].freeFeatures.length, 0);
  assert.ok(COURSE_STATIC["pmq-in-5-days"].freeFeatures.length > 0);
});
