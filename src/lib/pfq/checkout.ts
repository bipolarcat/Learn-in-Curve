"use server";

import { createClient } from "@/lib/supabase/server";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_COURSE_ID,
  PFQ_PRICING_HREF,
  PFQ_PRO_PRICE_CENTS,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { COURSE_STATIC } from "@/lib/courses/registry-data";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { pfqTierAtLeast } from "@/lib/pfq/tiers";
import { getSafeNextPath } from "@/lib/auth-next";

/**
 * Consumer Contracts Regulations waiver for digital content.
 * Required, unticked until the buyer accepts on Stripe Checkout.
 * Exact wording from the commerce prompt — do not soften.
 *
 * Educational note, not legal advice: solicitor review before flipping
 * PFQ_CHECKOUT_ENABLED to true in production.
 */
const PFQ_DIGITAL_CONTENT_CONSENT: Pick<
  import("stripe").Stripe.Checkout.SessionCreateParams,
  "consent_collection" | "custom_text"
> = {
  consent_collection: {
    terms_of_service: "required",
  },
  custom_text: {
    terms_of_service_acceptance: {
      message:
        "I agree to the Terms of Service and Privacy Policy. I want access straight away, and I understand that by starting the course I lose my right to cancel for a refund within 14 days.",
    },
  },
};

function withUnlockedFlag(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}pfq_unlocked=1`;
}

export async function createPfqCheckout(input: {
  /** Where Stripe Back / cancel and success return. Defaults to pricing. */
  returnPath?: string;
} = {}): Promise<{ url: string } | { error: string }> {
  if (!PFQ_CHECKOUT_ENABLED) {
    return {
      error:
        "PFQ checkout is not live yet. Stripe test checkout is built but gated until the cancellation-waiver wording is reviewed.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in" };
  }

  // pfqTierAtLeast, not `=== "pro"`: an ai_pro holder is above Pro and must not
  // be sold it again. The old equality check would have taken their money.
  const tier = await getPfqTier(supabase, user.id);
  if (pfqTierAtLeast(tier, "pro")) {
    return { error: "You already have PFQ Pro access." };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripeKey) {
    return { error: "Stripe is not configured" };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", PFQ_COURSE_ID)
    .maybeSingle();

  if (!course) {
    return {
      error:
        "PFQ course is not in the database yet. Apply migration 20260813200000_pfq_course.sql.",
    };
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  /*
   * Prefer a fixed Stripe Price object over inline price_data.
   *
   * price_data mints an ad-hoc product on every session, which makes Stripe
   * reporting useless (no single product to group by) and means the charged
   * amount is whatever the deploy happened to have compiled in. A Price id is
   * an object both sides agree on, and changing the price becomes a deliberate
   * act in Stripe rather than a side effect of a merge.
   *
   * The fallback stays so a missing id degrades to a correct charge rather than
   * taking checkout down. Amount still comes from the registry either way, so
   * the page and the charge cannot disagree: advertising one price and taking
   * another is a misleading price indication under the CPRs, not just a bug.
   */
  /*
   * Registry holds the live Price id. Local/dev uses sk_test_, which cannot
   * charge a live Price — prefer STRIPE_PFQ_PRO_PRICE_ID_TEST, else price_data.
   */
  const configuredPriceId = COURSE_STATIC["pfq-in-2-days"].stripePriceId;
  const stripePriceId = stripeKey.startsWith("sk_test_")
    ? process.env.STRIPE_PFQ_PRO_PRICE_ID_TEST || null
    : configuredPriceId;
  const priceLineItem: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem =
    stripePriceId
      ? { price: stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: "gbp",
            unit_amount: PFQ_PRO_PRICE_CENTS,
            product_data: {
              name: "PFQ in 2 Days, Pro",
              description: `APM PFQ revision, Pro unlock: insights on all 10 objectives, the full practice bank, all 3 timed mock papers and the coverage map. One-off ${formatPfqPriceGbp()}. No subscription.`,
            },
          },
          quantity: 1,
        };

  const returnPath = getSafeNextPath(input.returnPath, PFQ_PRICING_HREF);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: [priceLineItem],
    metadata: {
      user_id: user.id,
      course_id: PFQ_COURSE_ID,
      feature: "pro",
      product: "pfq",
    },
    ...PFQ_DIGITAL_CONTENT_CONSENT,
    success_url: `${appUrl}${withUnlockedFlag(returnPath)}`,
    cancel_url: `${appUrl}${returnPath}`,
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL." };
  }

  return { url: session.url };
}
