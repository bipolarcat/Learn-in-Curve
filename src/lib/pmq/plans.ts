import { SLY_UNLOCK_PRICE_CENTS } from "@/lib/tutor/constants";

/**
 * PMQ in 5 days plan ladder — single source of truth for the pricing page.
 *
 * Three tiers. AI Pro is a waitlist card (no checkout yet).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT — why Pro's price is derived, not written here
 *
 * `priceCents` for Pro is taken from `SLY_UNLOCK_PRICE_CENTS`, the same constant
 * `createAiTutorCheckout` charges. That makes it structurally impossible for the
 * pricing page to advertise one price while Stripe charges another — which would
 * be a misleading price indication under the Consumer Protection from Unfair
 * Trading Regulations, not just a bug.
 *
 * So this page shows whatever Stripe will actually take. To move Pro's price:
 *   1. set `SLY_UNLOCK_PRICE_CENTS`,
 *   2. add a migration so Supabase `exam_config` agrees,
 *   3. update the Stripe product/price if a fixed Price object is ever used.
 * Do all three together. Don't edit the display price here in isolation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT — the feature matrix below is MARKETING COPY, not enforcement
 *
 * Entitlement today is a single boolean (`feature_entitlements.feature =
 * 'ai_tutor'`) which unlocks video, audio, mocks 2–4, Sly AND the end-of-course
 * report together. Nothing here gates anything. Until that's split into real
 * tiers, a Pro purchase grants everything listed under AI Pro as well. See
 * Linear LIC-98 — that ticket must land before Pro goes on sale at a Pro price,
 * or the tier split is fiction.
 */

export type PmqPlanId = "starter" | "pro" | "ai_pro";

/** `waitlist` renders a "Launching soon" badge + email capture, no checkout. */
export type PmqPlanStatus = "free" | "buyable" | "waitlist";

export type PmqPlanFeature = {
  /** Matches the icon keys in `PmqPreviewFeatureIcons`. */
  icon:
    | "core"
    | "practice"
    | "mock"
    | "misconceptions"
    | "memory"
    | "sly"
    | "video"
    | "audio"
    | "report";
  label: string;
  /**
   * Quantity shown next to the label.
   *
   * On a plan with `inheritsFrom`, this is the count ADDED to THAT plan — the
   * card renders "Everything in {inheritsFrom}, plus …". Both paid tiers set
   * `inheritsFrom: "starter"` on purpose: the comparison that matters
   * commercially is against the free tier, since that's the jump a visitor is
   * actually deciding on. Change `inheritsFrom` and these figures must change
   * with it, or the card claims an increment on the wrong baseline.
   *
   * Verified against the live question bank 2026-07-30:
   *   practice_quiz 240 · sets 2-5 240 each · set 6 240 · set 7 239 · set 8 183
   *   → Starter 240 · Pro 1,200 · AI Pro 1,862 · mock_exam 160 (4 x 40)
   *
   * Typed, not derived — `tests/plan-counts.test.mjs` is the only thing keeping
   * them honest. Advertised figures may sit BELOW the real total (delivering
   * more than promised is fine); they must never sit above it.
   */
  value?: string;
};

export type PmqPlan = {
  id: PmqPlanId;
  name: string;
  status: PmqPlanStatus;
  /** null = free. Pence. */
  priceCents: number | null;
  /** Beside the price, e.g. "forever" / "one-off · no subscription". */
  priceNote: string;
  tagline: string;
  /** Highlighted card — the intended pick. */
  featured: boolean;
  features: PmqPlanFeature[];
  /** What this tier adds over the one to its left, for the "everything in X, plus" line. */
  inheritsFrom?: PmqPlanId;
  ctaLabel: string;
};

/**
 * Quiz counts are specific numeric claims and must stay provable. If the bank
 * is pruned or LIC-98 lands different splits, change these to match reality
 * *first*. An unprovable count is a misleading commercial practice.
 */
export const PMQ_PLANS: PmqPlan[] = [
  {
    id: "starter",
    name: "Starter",
    status: "free",
    priceCents: null,
    priceNote: "forever",
    tagline: "Everything you need to start your PMQ revision today.",
    featured: false,
    ctaLabel: "Start free",
    features: [
      {
        icon: "core",
        label: "Core study content for all 24 learning objectives",
      },
      { icon: "practice", label: "Practice questions", value: "240" },
      { icon: "mock", label: "Mock exam", value: "1" },
      { icon: "misconceptions", label: "Common misconceptions" },
      { icon: "memory", label: "Memory aids" },
    ],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    status: "buyable",
    priceCents: SLY_UNLOCK_PRICE_CENTS,
    priceNote: "one-off · no subscription",
    tagline:
      "More questions, mock exams, and video/audio overviews for every learning objective.",
    featured: true,
    inheritsFrom: "starter",
    ctaLabel: "Get Pro Bundle",
    features: [
      {
        icon: "practice",
        label: "additional practice questions",
        value: "960",
      },
      { icon: "mock", label: "additional mock exams", value: "2" },
      {
        icon: "video",
        label: "Video overview for every learning objective",
      },
      {
        icon: "audio",
        label: "Audio overview for every learning objective",
      },
    ],
  },
  {
    id: "ai_pro",
    name: "AI Pro Bundle",
    status: "waitlist",
    // Indicative — not charged anywhere yet. Nothing reads this for payment.
    priceCents: 1500,
    priceNote: "one-off · no subscription",
    tagline:
      "Sly tracks your progress, targets weak areas, and creates a personalised path to exam success.",
    featured: false,
    inheritsFrom: "starter",
    ctaLabel: "Join Waitlist",
    features: [
      // Anchored to STARTER, not Pro — deliberate. `inheritsFrom: "starter"`
      // above makes the card read "Everything in Starter, plus", so these
      // figures are measured from the free tier. That's the marketing frame:
      // the jump a free user is being asked to make.
      //
      // Real totals are 1,862 questions and 4 papers, so "1,620 additional"
      // UNDER-states by 2. Left alone on purpose — delivering more than
      // advertised is safe; the reverse is a misleading action under the CPRs.
      // If this ever needs changing, only ever move it DOWN or to the true
      // figure, never above 1,622.
      {
        icon: "practice",
        label: "additional practice questions",
        value: "1,620",
      },
      { icon: "mock", label: "additional mock exams", value: "3" },
      { icon: "sly", label: "Sly, your personal AI tutor" },
      {
        icon: "report",
        label:
          "Personalised end-of-course report with your weak spots mapped out",
      },
    ],
  },
];

/**
 * Waitlist key sent to `/api/notify` for the AI Pro launch list.
 * Re-exported from the notify registry so there is exactly one definition —
 * a typo'd literal here would create a list nothing can email or export.
 */
export { AI_PRO_LIST_KEY as PMQ_AI_PRO_NOTIFY_KEY } from "@/lib/notify/lists";

/**
 * Pricing route + the guest buy-intent handoff. Defined in `./pro-intent` (which
 * imports nothing, so `node --test` can load it without the `@/` alias) and
 * re-exported here so callers still have one import site for plan concerns.
 */
export {
  hasProIntent,
  PMQ_PRICING_HREF,
  PMQ_PRICING_PRO_INTENT_HREF,
  PMQ_PRO_INTENT_PARAM,
  PMQ_PRO_INTENT_VALUE,
} from "./pro-intent";

export function getPmqPlan(id: PmqPlanId): PmqPlan {
  const plan = PMQ_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown PMQ plan: ${id}`);
  return plan;
}
