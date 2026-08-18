import { PFQ_PRO_PRICE_CENTS } from "./constants";

/**
 * PFQ in 2 days plan ladder — display copy for the pricing cards.
 *
 * Two marketed tiers. Pro is the only buyable unlock. AI Pro is a waitlist
 * card (no checkout, no entitlement). Enforcement stays in `tiers.ts`:
 * starter (absence) vs pro. Do not add `ai_pro` there until it is actually
 * granted.
 *
 * Pro's `priceCents` is `PFQ_PRO_PRICE_CENTS` from the course registry — the
 * same value `createPfqCheckout` charges. Do not write a display price here.
 *
 * AI Pro's price is indicative only. Nothing reads it for payment.
 *
 * Feature lines are marketing copy. They must stay inside what Pro actually
 * unlocks (lessons, practice, mock, coverage map, Trap School). Do not copy
 * PMQ/Sly counts onto these cards.
 */

export type PfqPlanId = "pro" | "ai_pro";

export type PfqPlanStatus = "buyable" | "waitlist";

export type PfqPlanFeature = {
  icon: "core" | "practice" | "mock" | "misconceptions" | "report";
  label: string;
  value?: string;
};

export type PfqPlan = {
  id: PfqPlanId;
  name: string;
  status: PfqPlanStatus;
  priceCents: number;
  priceNote: string;
  tagline: string;
  features: PfqPlanFeature[];
  inheritsFrom?: PfqPlanId;
  ctaLabel: string;
};

export const PFQ_PLANS: PfqPlan[] = [
  {
    id: "pro",
    name: "Pro Bundle",
    status: "buyable",
    priceCents: PFQ_PRO_PRICE_CENTS,
    priceNote: "one-off · no subscription",
    tagline:
      "Lessons, practice, a full mock, and a coverage map for every PFQ learning outcome.",
    ctaLabel: "Get Pro Bundle",
    features: [
      {
        icon: "core",
        label: "lessons, one per learning outcome",
        value: "59",
      },
      {
        icon: "practice",
        label: "practice questions, tagged to the outcome they test",
        value: "306",
      },
      { icon: "mock", label: "full 60-question mock exam", value: "1" },
      { icon: "report", label: "Coverage map of the 59 outcomes" },
      {
        icon: "misconceptions",
        label: "Trap School — the formats that cost people marks",
      },
    ],
  },
  {
    id: "ai_pro",
    name: "AI Pro Bundle",
    status: "waitlist",
    // Indicative — not charged anywhere yet. Nothing reads this for payment.
    priceCents: 1200,
    priceNote: "one-off · no subscription",
    tagline:
      "Personalised AI practice that targets the outcomes you cannot answer yet. Launching soon.",
    inheritsFrom: "pro",
    ctaLabel: "Join Waitlist",
    features: [
      {
        icon: "practice",
        label: "AI practice aimed at your remaining gaps",
      },
      {
        icon: "report",
        label: "A personalised path from your coverage map",
      },
    ],
  },
];

export function getPfqPlan(id: PfqPlanId): PfqPlan {
  const plan = PFQ_PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown PFQ plan: ${id}`);
  return plan;
}
