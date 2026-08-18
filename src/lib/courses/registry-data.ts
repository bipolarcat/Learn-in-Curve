/**
 * Static course product facts (no DB / no `@/` imports).
 * Wired into CourseProduct with hasUsedPaidFeature in registry.ts.
 *
 * See registry.ts header for the Terms Schedule pairing rule.
 */

import { PMQ_COURSE_ID, PFQ_COURSE_ID } from "./ids.ts";
import type { CourseFeatureId, CourseSlug } from "./types.ts";

export type CourseStaticProduct = {
  id: string;
  slug: CourseSlug;
  displayName: string;
  priceCents: number;
  stripePriceId: string | null;
  freeFeatures: readonly CourseFeatureId[];
  paidFeatures: readonly CourseFeatureId[];
};

export const COURSE_STATIC: { [K in CourseSlug]: CourseStaticProduct } = {
  "pmq-in-5-days": {
    id: PMQ_COURSE_ID,
    slug: "pmq-in-5-days",
    displayName: "PMQ in 5 Days",
    priceCents: 800,
    stripePriceId: null,
    freeFeatures: ["core_content", "standard_quizzes", "first_mock_exam"],
    paidFeatures: [
      "additional_quiz_sets",
      "further_mock_exams",
      "video_audio",
      "ai_tutor",
      "ai_marked_mocks",
    ],
  },
  "pfq-in-2-days": {
    id: PFQ_COURSE_ID,
    slug: "pfq-in-2-days",
    displayName: "PFQ in 2 Days",
    priceCents: 600,
    stripePriceId: null,
    freeFeatures: [],
    paidFeatures: ["lessons", "practice_bank", "mock_exam", "coverage_map"],
  },
};

export const COURSE_STATIC_LIST: readonly CourseStaticProduct[] =
  Object.values(COURSE_STATIC);

export const PMQ_PRO_PRICE_CENTS = COURSE_STATIC["pmq-in-5-days"].priceCents;
export const PFQ_PRO_PRICE_CENTS = COURSE_STATIC["pfq-in-2-days"].priceCents;
export const PMQ_SLUG = COURSE_STATIC["pmq-in-5-days"].slug;
export const PFQ_SLUG = COURSE_STATIC["pfq-in-2-days"].slug;
export { PMQ_COURSE_ID, PFQ_COURSE_ID };
