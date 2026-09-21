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
  /**
   * Second paid rung (AI Pro). null on a course that has no such tier.
   *
   * PFQ AI Pro is priced but NOT buyable: the pricing card is a waitlist until
   * Sly ships. The number lives here anyway so the card, the Terms Schedule and
   * any future checkout all read one value. See src/lib/pfq/plans.ts.
   */
  aiProPriceCents: number | null;
  aiProStripePriceId: string | null;
  /**
   * Price for an existing Pro holder stepping up to AI Pro, in GBP pence.
   *
   * Deliberately a stored number rather than `aiProPriceCents - priceCents` in
   * code: it is a commercial decision that must survive either price moving,
   * and a silent recalculation would hide a pricing change. It is still tested
   * for coherence, so the two cannot drift apart unnoticed.
   */
  aiProUpgradePriceCents: number | null;
  aiProUpgradeStripePriceId: string | null;
  freeFeatures: readonly CourseFeatureId[];
  paidFeatures: readonly CourseFeatureId[];
  /** Features the AI Pro rung adds on top of `paidFeatures`. */
  aiProFeatures: readonly CourseFeatureId[];
};

export const COURSE_STATIC: { [K in CourseSlug]: CourseStaticProduct } = {
  "pmq-in-5-days": {
    id: PMQ_COURSE_ID,
    slug: "pmq-in-5-days",
    displayName: "PMQ in 5 Days",
    priceCents: 2000,
    stripePriceId: null,
    aiProPriceCents: null,
    aiProStripePriceId: null,
    aiProUpgradePriceCents: null,
    aiProUpgradeStripePriceId: null,
    freeFeatures: ["core_content", "standard_quizzes", "first_mock_exam"],
    paidFeatures: [
      "additional_quiz_sets",
      "further_mock_exams",
      "video_audio",
      "ai_tutor",
      "ai_marked_mocks",
    ],
    aiProFeatures: [],
  },
  "pfq-in-2-days": {
    id: PFQ_COURSE_ID,
    slug: "pfq-in-2-days",
    displayName: "PFQ in 2 Days",
    /** Pro. Raised from 600 to 1000 on 2026-09-15 (LIC-157). */
    priceCents: 1000,
    /**
     * Live-mode Stripe Price (GBP one-off, 1000). Product `prod_VGRDpbPxGRcD29`.
     * Test-mode twin: `price_1UFuLYE8FYJzMC1bhYc3kWZk` on `prod_VGREr8xyP2ybWx`
     * — wired via `STRIPE_PFQ_PRO_PRICE_ID_TEST` when the secret key is `sk_test_`.
     * Do not create AI Pro Prices until the £10 upgrade path exists.
     */
    stripePriceId: "price_1UFuLmEClgppvApr09UCGO8N",
    /** AI Pro. Raised from 1500 to 2000 on 2026-09-15 by Sim. */
    aiProPriceCents: 2000,
    aiProStripePriceId: null,
    /**
     * Pro (1000) + this must equal aiProPriceCents (2000), or buying in two
     * steps becomes cheaper than buying AI Pro outright and nobody ever takes
     * the direct route. Raised 500 -> 1000 with the AI Pro price on
     * 2026-09-15. Enforced by tests/course-registry-terms.test.mjs.
     */
    aiProUpgradePriceCents: 1000,
    aiProUpgradeStripePriceId: null,
    /**
     * Free rung. `lessons` here means the lesson SCAFFOLDING (outcomes, key
     * takeaways, definitions, misconceptions, memory aids, checkpoints), not
     * the lesson body: the body is `insights` and is a Paid Feature from
     * objective 2 onward. Objective 1's body is free as the taster.
     * `standard_quizzes` is practice set 1 only, 5 per objective, 50 total.
     */
    freeFeatures: ["lessons", "standard_quizzes"],
    paidFeatures: [
      "insights",
      "additional_quiz_sets",
      "mock_exam",
      "coverage_map",
    ],
    aiProFeatures: ["ai_tutor", "completion_report"],
  },
};

export const COURSE_STATIC_LIST: readonly CourseStaticProduct[] =
  Object.values(COURSE_STATIC);

export const PMQ_PRO_PRICE_CENTS = COURSE_STATIC["pmq-in-5-days"].priceCents;
export const PFQ_PRO_PRICE_CENTS = COURSE_STATIC["pfq-in-2-days"].priceCents;
export const PFQ_AI_PRO_PRICE_CENTS = COURSE_STATIC["pfq-in-2-days"]
  .aiProPriceCents as number;
export const PFQ_AI_PRO_UPGRADE_PRICE_CENTS = COURSE_STATIC["pfq-in-2-days"]
  .aiProUpgradePriceCents as number;
export const PMQ_SLUG = COURSE_STATIC["pmq-in-5-days"].slug;
export const PFQ_SLUG = COURSE_STATIC["pfq-in-2-days"].slug;
export { PMQ_COURSE_ID, PFQ_COURSE_ID };
