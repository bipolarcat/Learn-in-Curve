import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  SLY_UNLOCK_CREDIT_GBP_CENTS,
  SLY_UNLOCK_PRICE_CENTS,
  topUpCreditGbpCents,
} from "@/lib/tutor/constants";

export const runtime = "nodejs";

async function insertCredit(input: {
  userId: string;
  courseId: string;
  creditGbpCents: number;
  grossGbpCents: number;
  source: "unlock" | "topup";
  stripePaymentId: string;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("tutor_usage_credits").insert({
    user_id: input.userId,
    course_id: input.courseId,
    credit_gbp_cents: input.creditGbpCents,
    gross_gbp_cents: input.grossGbpCents,
    source: input.source,
    stripe_payment_id: input.stripePaymentId,
  });

  // Idempotent on Stripe retries
  if (error && error.code !== "23505") {
    throw error;
  }
}

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;
    // `feature` is now the purchased tier ('pro' | 'ai_pro'); 'ai_tutor' is the
    // pre-2026-07-30 name. Both are accepted here so a checkout session created
    // before the deploy still grants correctly when its webhook lands after it.
    const feature = session.metadata?.feature;
    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id;

    if (!userId || !courseId) {
      return NextResponse.json({ received: true });
    }

    try {
      if (feature === "pro" || feature === "ai_pro" || feature === "ai_tutor") {
        const supabase = createServiceClient();
        // Legacy sessions bought the whole bundle, so they map to ai_pro.
        const grantedTier = feature === "ai_tutor" ? "ai_pro" : feature;

        const { error } = await supabase.from("feature_entitlements").upsert(
          {
            user_id: userId,
            course_id: courseId,
            feature: grantedTier,
            source: "purchase",
            granted_at: new Date().toISOString(),
            stripe_payment_id: paymentId,
          },
          { onConflict: "user_id,course_id,feature" },
        );

        if (error) {
          console.error("feature_entitlements insert failed:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Fallback only fires if Stripe omits amount_total. Was hardcoded 999
        // and silently kept charging the ledger the old £9.99 after the price
        // moved to £8 — derive it so the two can't diverge again.
        const gross =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : SLY_UNLOCK_PRICE_CENTS;

        await insertCredit({
          userId,
          courseId,
          creditGbpCents: SLY_UNLOCK_CREDIT_GBP_CENTS,
          grossGbpCents: gross,
          source: "unlock",
          stripePaymentId: paymentId,
        });
      }

      if (feature === "ai_tutor_topup") {
        const amountCents = Number(session.metadata?.amount_cents ?? 0);
        const gross =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : amountCents;

        if (gross < 100) {
          console.error("ai_tutor_topup missing/invalid amount", session.id);
          return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
        }

        await insertCredit({
          userId,
          courseId,
          creditGbpCents: topUpCreditGbpCents(gross),
          grossGbpCents: gross,
          source: "topup",
          stripePaymentId: paymentId,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Credit insert failed";
      console.error(message, err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
