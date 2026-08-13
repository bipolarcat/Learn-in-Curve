/**
 * Course product registry — single source of truth for catalogue facts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Why this file exists
 *
 * Course facts used to live in several places at once: price constants in
 * `tutor/constants.ts` / `pfq/constants.ts`, catalogue rows in
 * `courses-catalog.ts`, entitlement gates elsewhere, and the customer-facing
 * statement in `legal/TERMS_OF_SERVICE.md` Schedule. Three courses in, those
 * copies disagree — and one of the things they can disagree about is a legal
 * commitment (what counts as a Paid Feature for the 14-Day Unused Guarantee).
 *
 * This registry is the code half of that truth. The Schedule at the end of the
 * Terms of Service is the customer-facing half of the *same* facts. Change them
 * together. If you edit this file (or registry-data.ts), open the Schedule. If
 * you edit the Schedule, open this file. `tests/course-registry-terms.test.mjs`
 * fails the build when they drift by display name.
 *
 * Prices are deliberately NOT in the Terms (see Terms § prices). They live
 * here, on the course page, and at checkout — one definition, re-exported.
 *
 * Pattern cousins: `src/lib/notify/lists.ts` (one registry per list) and
 * `src/lib/pmq/tiers.ts` (one function per gate).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  hasUsedPmqPaidFeature,
  hasUsedPfqPaidFeature,
} from "@/lib/courses/used";
import {
  COURSE_STATIC,
  COURSE_STATIC_LIST,
  PFQ_PRO_PRICE_CENTS,
  PMQ_PRO_PRICE_CENTS,
} from "@/lib/courses/registry-data";
import type { CourseFeatureId, CourseSlug } from "@/lib/courses/types";
import { PMQ_COURSE_ID, PFQ_COURSE_ID } from "@/lib/courses/ids";

export type { CourseFeatureId, CourseSlug };

export type CourseProduct = {
  /** UUID in `courses.id`. Never rename — entitlement rows key off it. */
  id: string;
  slug: CourseSlug;
  /** Must match the Terms Schedule heading ("### {displayName}"). */
  displayName: string;
  /**
   * Primary Paid Unlock price in GBP pence.
   * PMQ: Pro Bundle. PFQ: the single whole-course unlock.
   * Exactly one definition — consumers re-export this, they do not restate it.
   */
  priceCents: number;
  /**
   * Stripe Price object id when using a fixed Price.
   * null = Checkout builds `price_data.unit_amount` from `priceCents` (current).
   */
  stripePriceId: string | null;
  /** Empty array = no Free Features (PFQ). */
  freeFeatures: readonly CourseFeatureId[];
  /** Features that count toward Paid Unlock product scope. */
  paidFeatures: readonly CourseFeatureId[];
  /**
   * True if the user has touched any Paid Feature of this course.
   * Errs toward reporting use (false "unused" costs an undeserved refund).
   */
  hasUsedPaidFeature: (userId: string) => Promise<boolean>;
};

function defineCourse(
  slug: CourseSlug,
  hasUsedPaidFeature: (userId: string) => Promise<boolean>,
): CourseProduct {
  return { ...COURSE_STATIC[slug], hasUsedPaidFeature };
}

/**
 * Exhaustive map — TypeScript fails if a CourseSlug is missing.
 * Adding a course: append in registry-data.ts AND add a Schedule entry in
 * TERMS_OF_SERVICE.md AND wire hasUsedPaidFeature here.
 */
export const COURSE_REGISTRY: { [K in CourseSlug]: CourseProduct } = {
  "pmq-in-5-days": defineCourse("pmq-in-5-days", hasUsedPmqPaidFeature),
  "pfq-in-2-days": defineCourse("pfq-in-2-days", hasUsedPfqPaidFeature),
};

export const COURSE_PRODUCTS: readonly CourseProduct[] = Object.values(
  COURSE_REGISTRY,
);

export function getCourse(slug: CourseSlug): CourseProduct {
  return COURSE_REGISTRY[slug];
}

export function getCourseById(id: string): CourseProduct | null {
  return COURSE_PRODUCTS.find((c) => c.id === id) ?? null;
}

export function hasUsedPaidFeature(
  slug: CourseSlug,
  userId: string,
): Promise<boolean> {
  return COURSE_REGISTRY[slug].hasUsedPaidFeature(userId);
}

export {
  COURSE_STATIC,
  COURSE_STATIC_LIST,
  PFQ_PRO_PRICE_CENTS,
  PMQ_PRO_PRICE_CENTS,
  PMQ_COURSE_ID,
  PFQ_COURSE_ID,
};

export const PMQ_SLUG: CourseSlug = "pmq-in-5-days";
export const PFQ_SLUG: CourseSlug = "pfq-in-2-days";
