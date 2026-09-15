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
    /PFQ_PRO_PRICE_CENTS\s*=\s*\d+/,
    "pfq/constants must not restate a price literal",
  );

  assert.equal(PMQ_PRO_PRICE_CENTS, 800);
  // PFQ Pro raised 600 -> 1000 on 2026-09-15 (LIC-157). This assertion is the
  // tripwire: moving a price must be deliberate enough to update the Stripe
  // Price object and the Terms Schedule in the same change.
  assert.equal(PFQ_PRO_PRICE_CENTS, 1000);
  // PFQ AI Pro raised 1500 -> 2000 on 2026-09-15 by Sim, upgrade 500 -> 1000.
  // Pinned so a stale AI Pro price cannot reappear anywhere reading the registry.
  assert.equal(COURSE_STATIC["pfq-in-2-days"].aiProPriceCents, 2000);
  assert.equal(COURSE_STATIC["pfq-in-2-days"].aiProUpgradePriceCents, 1000);
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

test("every course has free features", () => {
  // PFQ used to have none: the whole course sat behind one unlock. The 3-tier
  // ladder set on 2026-09-15 gave it a real free rung (lesson scaffolding on
  // all 10 objectives, insights on objective 1, practice set 1), so the old
  // "PFQ has no free features" assertion was inverted rather than deleted.
  for (const course of COURSE_STATIC_LIST) {
    assert.ok(
      course.freeFeatures.length > 0,
      `${course.displayName} must declare its free features`,
    );
  }
});

test("AI Pro pricing is coherent where a course has that rung", () => {
  for (const course of COURSE_STATIC_LIST) {
    if (course.aiProPriceCents === null) {
      assert.equal(course.aiProStripePriceId, null);
      assert.equal(course.aiProUpgradePriceCents, null);
      assert.equal(course.aiProFeatures.length, 0);
      continue;
    }
    assert.ok(
      course.aiProPriceCents > course.priceCents,
      `${course.displayName}: AI Pro must cost more than Pro`,
    );
    assert.ok(
      course.aiProUpgradePriceCents !== null &&
        course.aiProUpgradePriceCents > 0 &&
        course.aiProUpgradePriceCents < course.aiProPriceCents,
      `${course.displayName}: the Pro-to-AI-Pro upgrade must be cheaper than buying AI Pro outright`,
    );
    // No two-step arbitrage. If Pro + upgrade came to less than AI Pro, every
    // rational buyer would take Pro first and the AI Pro headline price would
    // be decorative. Caught here rather than in review because it is the exact
    // thing that broke when AI Pro moved 1500 -> 2000 on 2026-09-15 and the
    // upgrade was still 500.
    assert.equal(
      course.priceCents + course.aiProUpgradePriceCents,
      course.aiProPriceCents,
      `${course.displayName}: Pro + upgrade must equal AI Pro exactly`,
    );
    assert.ok(
      course.aiProFeatures.length > 0,
      `${course.displayName}: AI Pro must add at least one feature over Pro`,
    );
  }
});
