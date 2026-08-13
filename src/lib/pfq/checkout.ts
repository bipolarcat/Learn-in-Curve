"use server";

import { createClient } from "@/lib/supabase/server";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_COURSE_ID,
  PFQ_LEARN_HREF,
  PFQ_PRO_PRICE_CENTS,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { getPfqTier } from "@/lib/pfq/entitlement";

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

export async function createPfqCheckout(): Promise<
  { url: string } | { error: string }
> {
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

  const tier = await getPfqTier(supabase, user.id);
  if (tier === "pro") {
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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: PFQ_PRO_PRICE_CENTS,
          product_data: {
            name: "PFQ in 2 Days",
            description: `Full APM PFQ revision course — 59 lessons, ~300 practice questions, timed mock, coverage map, Trap School. One-off ${formatPfqPriceGbp()}. No subscription.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      course_id: PFQ_COURSE_ID,
      feature: "pro",
      product: "pfq",
    },
    ...PFQ_DIGITAL_CONTENT_CONSENT,
    success_url: `${appUrl}${PFQ_LEARN_HREF}?pfq_unlocked=1`,
    cancel_url: `${appUrl}/pfq/pricing`,
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL." };
  }

  return { url: session.url };
}
