import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  SLY_UNLOCK_CREDIT_GBP_CENTS,
  SLY_UNLOCK_PRICE_CENTS,
  topUpCreditGbpCents,
} from "@/lib/tutor/constants";
import { PFQ_COURSE_ID, PFQ_PRO_PRICE_CENTS } from "@/lib/pfq/constants";
import { sendPfqPurchaseEmail } from "@/lib/pfq/send-purchase-email";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";

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

async function grantFeatureEntitlement(input: {
  userId: string;
  courseId: string;
  feature: string;
  paymentId: string;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("feature_entitlements").upsert(
    {
      user_id: input.userId,
      course_id: input.courseId,
      feature: input.feature,
      source: "purchase",
      granted_at: new Date().toISOString(),
      stripe_payment_id: input.paymentId,
    },
    { onConflict: "user_id,course_id,feature" },
  );

  if (error) {
    console.error("[stripe] feature_entitlements upsert failed:", error);
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
    const feature = session.metadata?.feature;
    const product = session.metadata?.product;
    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id;

    if (!userId || !courseId) {
      console.error(
        "[stripe] checkout.session.completed missing user_id/course_id",
        session.id,
      );
      // 500 so Stripe retries — silent 200 would hide an unrecoverable grant.
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 500 },
      );
    }

    try {
      const isPfq =
        courseId === PFQ_COURSE_ID ||
        product === "pfq" ||
        session.metadata?.product === "pfq";

      if (isPfq) {
        if (feature !== "pro") {
          console.error("[stripe] PFQ session with unexpected feature", {
            sessionId: session.id,
            feature,
          });
          return NextResponse.json(
            { error: "Invalid PFQ feature" },
            { status: 400 },
          );
        }

        await grantFeatureEntitlement({
          userId,
          courseId: PFQ_COURSE_ID,
          feature: "pro",
          paymentId,
        });

        const amount =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : PFQ_PRO_PRICE_CENTS;

        const email =
          session.customer_details?.email ||
          session.customer_email ||
          undefined;
        if (email) {
          const sent = await sendPfqPurchaseEmail({
            email,
            amountCents: amount,
            paymentId,
          });
          if (!sent) {
            console.error(
              "[stripe] PFQ entitlement written but purchase email failed",
              { userId, paymentId, email },
            );
          }
        } else {
          console.error(
            "[stripe] PFQ entitlement written but no customer email on session",
            { userId, paymentId, sessionId: session.id },
          );
        }

        return NextResponse.json({ received: true });
      }

      // ─── PMQ / Sly paths (unchanged behaviour) ───
      if (feature === "pro" || feature === "ai_pro" || feature === "ai_tutor") {
        const grantedTier = feature === "ai_tutor" ? "ai_pro" : feature;

        await grantFeatureEntitlement({
          userId,
          courseId: courseId || PMQ_COURSE_ID,
          feature: grantedTier,
          paymentId,
        });

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
          return NextResponse.json(
            { error: "Invalid top-up amount" },
            { status: 400 },
          );
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
      const message = err instanceof Error ? err.message : "Webhook handler failed";
      console.error("[stripe] checkout.session.completed failed", message, err, {
        sessionId: session.id,
        userId,
        courseId,
        paymentId,
      });
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
