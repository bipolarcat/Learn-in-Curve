import {
  PFQ_AI_PRO_PRICE_CENTS,
  PFQ_PRO_PRICE_CENTS,
} from "./constants";
import { PFQ_FREE_INSIGHTS_OBJECTIVE } from "./tiers";

/**
 * PFQ in 2 days plan ladder, display copy for the pricing cards.
 *
 * Three tiers (set 2026-09-15, LIC-157). Starter is free, Pro is the only
 * buyable unlock, AI Pro is a waitlist card until Sly ships.
 *
 * ---------------------------------------------------------------------------
 * Prices are derived, never written here
 *
 * Every `priceCents` comes from `src/lib/courses/registry-data.ts`, which is
 * also what `createPfqCheckout` charges. That makes it structurally impossible
 * for this page to advertise one price while Stripe takes another, which would
 * be a misleading price indication under the Consumer Protection from Unfair
 * Trading Regulations, not merely a bug. To move a price: change the registry,
 * then the Stripe Price object, then the Terms Schedule. All three together.
 *
 * ---------------------------------------------------------------------------
 * These feature lines are MARKETING COPY, not enforcement
 *
 * `tiers.ts` is the enforcement. Every claim here must be backed by a gate
 * there, and no gate may be more generous than the claim. A promise this page
 * makes that no gate honours is a misleading commercial practice.
 *
 * Counts verified against production 2026-09-15:
 *   pfq_questions: 745 total = 565 practice pool + 180 mock (3 papers x 60)
 *   free practice: 5 per objective x 10 objectives = 50
 *   lessons: 10 objectives, 59 learning outcomes
 *
 * ---------------------------------------------------------------------------
 * "Insights" is the lesson body
 *
 * Objective 1's insights are free so a visitor can see what is behind the
 * paywall before paying for it. Objectives 2 to 10 are Pro. The scaffolding
 * (outcomes, key takeaways, definitions, misconceptions, memory aids,
 * checkpoints) is free on every objective. Say that plainly on the cards: a
 * free tier described as having "the learning material" when the teaching text
 * is locked would be the kind of claim the CPRs bite on.
 */

export type PfqPlanId = "starter" | "pro" | "ai_pro";

/** `waitlist` renders a "Launching soon" badge + email capture, no checkout. */
export type PfqPlanStatus = "free" | "buyable" | "waitlist";

export type PfqPlanFeature = {
  /** Matches the icon keys in `PmqPreviewFeatureIcons`. */
  icon: "core" | "practice" | "mock" | "misconceptions" | "report" | "sly";
  label: string;
  /** Quantity shown beside the label. Omit when the line is qualitative. */
  value?: string;
};

export type PfqPlan = {
  id: PfqPlanId;
  name: string;
  status: PfqPlanStatus;
  /** null on the free tier: the card shows "Free", not "£0". */
  priceCents: number | null;
  priceNote: string;
  tagline: string;
  features: PfqPlanFeature[];
  /** Card renders "Everything in {inheritsFrom}, plus ...". */
  inheritsFrom?: PfqPlanId;
  ctaLabel: string;
};

export const PFQ_PLANS: PfqPlan[] = [
  {
    id: "starter",
    name: "Free",
    status: "free",
    priceCents: null,
    priceNote: "no card needed",
    tagline:
      "See how the course works, and sit a full set of practice questions on every objective.",
    ctaLabel: "Start free",
    features: [
      {
        icon: "core",
        label: `full lesson insights on objective ${PFQ_FREE_INSIGHTS_OBJECTIVE}`,
        value: "1 of 10",
      },
      {
        icon: "core",
        label:
          "key takeaways, definitions, misconceptions and memory aids on all 10 objectives",
      },
      {
        icon: "practice",
        label: "practice questions, 5 on every objective",
        value: "50",
      },
      {
        icon: "misconceptions",
        label: "Trap School, the formats that cost people marks",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    status: "buyable",
    priceCents: PFQ_PRO_PRICE_CENTS,
    priceNote: "one-off, no subscription",
    tagline:
      "The whole course. Every objective taught in full, the complete question bank, and three timed mocks.",
    inheritsFrom: "starter",
    ctaLabel: "Get Pro",
    features: [
      {
        icon: "core",
        label: "lesson insights unlocked on the remaining objectives",
        value: "9",
      },
      {
        icon: "practice",
        label: "practice questions in total, tagged to the outcome they test",
        value: "565",
      },
      { icon: "mock", label: "timed 60-question mock papers", value: "3" },
      { icon: "report", label: "coverage map across all 59 learning outcomes" },
    ],
  },
  {
    id: "ai_pro",
    name: "AI Pro",
    status: "waitlist",
    priceCents: PFQ_AI_PRO_PRICE_CENTS,
    priceNote: "one-off, no subscription",
    tagline:
      "Everything in Pro, plus Sly, your AI tutor, and a report on where you stand at the end. Launching soon.",
    inheritsFrom: "pro",
    ctaLabel: "Join Waitlist",
    features: [
      {
        icon: "sly",
        label: "Sly, the AI tutor, on every objective",
      },
      {
        icon: "report",
        label: "end-of-course report on your readiness",
      },
    ],
  },
];

export function getPfqPlan(id: PfqPlanId): PfqPlan {
  const plan = PFQ_PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown PFQ plan: ${id}`);
  return plan;
}
