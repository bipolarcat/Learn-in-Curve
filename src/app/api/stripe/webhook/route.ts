import { NextResponse } from "next/server";
import Stripe from "stripe";
import { notifyAdminOfPurchase } from "@/lib/admin/notify-admin-purchase";
import { trackPurchaseGrantFailed } from "@/lib/analytics/checkout-track";
import { trackPurchaseCompleted } from "@/lib/analytics/purchase";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  SLY_UNLOCK_CREDIT_GBP_CENTS,
  SLY_UNLOCK_PRICE_CENTS,
  topUpCreditGbpCents,
} from "@/lib/tutor/constants";
import { PFQ_COURSE_ID, PFQ_PRO_PRICE_CENTS } from "@/lib/pfq/constants";
import { isPfqPaidTier } from "@/lib/pfq/tiers";
import { sendPfqPurchaseEmail } from "@/lib/pfq/send-purchase-email";
import { PMQ_COURSE_ID, PMQ_SLUG } from "@/lib/pmq/constants";
import { sendPurchaseReceipt } from "@/lib/notify/send-purchase-receipt";

const PMQ_RECEIPT_PRODUCT: Record<string, string> = {
  pro: "PMQ in 5 Days: Pro Bundle",
  ai_pro: "PMQ in 5 Days: AI Pro Bundle",
  ai_tutor: "PMQ in 5 Days: AI Pro Bundle",
  ai_tutor_topup: "Sly fair-usage top-up",
};

const PFQ_RECEIPT_PRODUCT: Record<string, string> = {
  pro: "PFQ in 2 Days: Pro Bundle",
  ai_pro: "PFQ in 2 Days: AI Pro Bundle",
};

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

async function recordPurchase(
  session: Stripe.Checkout.Session,
  eventCreated: number,
  grant: { entitlementGranted: boolean; creditGranted: boolean },
) {
  try {
    await trackPurchaseCompleted(session, eventCreated, grant);
  } catch (err) {
    console.error("PostHog purchase_completed failed", err);
  }
}

async function recordGrantFailed(
  session: Stripe.Checkout.Session,
  eventCreated: number,
  reason: Parameters<typeof trackPurchaseGrantFailed>[2],
) {
  try {
    await trackPurchaseGrantFailed(session, eventCreated, reason);
  } catch (err) {
    console.error("PostHog purchase_grant_failed failed", err);
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
      await recordGrantFailed(session, event.created, "missing_metadata");
      // 500 so Stripe retries — silent 200 would hide an unrecoverable grant.
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 500 },
      );
    }

    let entitlementGranted = false;
    let creditGranted = false;

    try {
      const isPfq =
        courseId === PFQ_COURSE_ID ||
        product === "pfq" ||
        session.metadata?.product === "pfq";

      if (isPfq) {
        // Accepts both rungs. ai_pro has no checkout today (Sly has not
        // shipped), but hard-rejecting it here would 400 the first real AI Pro
        // session the day one is created, after the customer has already paid.
        // isPfqPaidTier is the same allow-list the gates read, so the webhook
        // can never write a feature value the tier ladder would ignore.
        if (!isPfqPaidTier(feature)) {
          console.error("[stripe] PFQ session with unexpected feature", {
            sessionId: session.id,
            feature,
          });
          await recordGrantFailed(session, event.created, "invalid_feature");
          return NextResponse.json(
            { error: "Invalid PFQ feature" },
            { status: 400 },
          );
        }

        await grantFeatureEntitlement({
          userId,
          courseId: PFQ_COURSE_ID,
          feature,
          paymentId,
        });
        entitlementGranted = true;
        await recordPurchase(session, event.created, {
          entitlementGranted,
          creditGranted,
        });

        const amount =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : PFQ_PRO_PRICE_CENTS;

        const email =
          session.customer_details?.email ||
          session.customer_email ||
          undefined;
        if (!email) {
          console.error(
            "[stripe] PFQ entitlement written but no customer email on session — CCR durable-medium acknowledgement cannot be sent",
            { userId, paymentId, sessionId: session.id },
          );
          // 500 so Stripe retries; entitlement grant is idempotent.
          return NextResponse.json(
            { error: "Missing customer email for purchase confirmation" },
            { status: 500 },
          );
        }

        const sent = await sendPfqPurchaseEmail({
          email,
          amountCents: amount,
          paymentId,
          feature,
          purchasedAt: event.created,
          currency: session.currency ?? "gbp",
        });
        if (!sent) {
          console.error(
            "[stripe] PFQ entitlement written but purchase email failed — CCR acknowledgement not confirmed in durable medium",
            { userId, paymentId, email },
          );
          // 500 so Stripe retries Resend; grantFeatureEntitlement is idempotent.
          return NextResponse.json(
            { error: "Purchase confirmation email failed" },
            { status: 500 },
          );
        }

        notifyAdminOfPurchase({
          email,
          productName:
            (feature && PFQ_RECEIPT_PRODUCT[feature]) ||
            "PFQ in 2 Days: Pro Bundle",
          amountCents: amount,
          currency: session.currency ?? "gbp",
          paymentId,
          purchasedAt: event.created,
          courseId: PFQ_COURSE_ID,
          feature,
        });

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
        entitlementGranted = true;

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
        creditGranted = true;
      }

      if (feature === "ai_tutor_topup") {
        const amountCents = Number(session.metadata?.amount_cents ?? 0);
        const gross =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : amountCents;

        if (gross < 100) {
          console.error("ai_tutor_topup missing/invalid amount", session.id);
          await recordGrantFailed(session, event.created, "invalid_amount");
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
        creditGranted = true;
      }

      if (!entitlementGranted && !creditGranted) {
        console.error("[stripe] checkout.session.completed granted nothing", {
          sessionId: session.id,
          feature,
        });
        await recordGrantFailed(session, event.created, "invalid_feature");
        return NextResponse.json(
          { error: "Nothing to grant" },
          { status: 400 },
        );
      }

      await recordPurchase(session, event.created, {
        entitlementGranted,
        creditGranted,
      });

      // ─── Receipt + CCR durable-medium confirmation (PMQ / Sly) ───
      // Runs after the grant so a retry never double-grants (grant + credit
      // are idempotent). A failed send returns 500 so Stripe retries; the
      // Resend Idempotency-Key stops a retry from emailing twice.
      const receiptProduct = feature ? PMQ_RECEIPT_PRODUCT[feature] : undefined;
      if (receiptProduct) {
        const email =
          session.customer_details?.email || session.customer_email || undefined;
        if (!email) {
          console.error(
            "[stripe] PMQ purchase granted but no customer email on session; receipt not sent",
            { userId, paymentId, sessionId: session.id },
          );
          return NextResponse.json(
            { error: "Missing customer email for purchase receipt" },
            { status: 500 },
          );
        }

        const amountCents =
          typeof session.amount_total === "number" && session.amount_total > 0
            ? session.amount_total
            : feature === "ai_tutor_topup"
              ? Number(session.metadata?.amount_cents ?? 0)
              : SLY_UNLOCK_PRICE_CENTS;

        const sent = await sendPurchaseReceipt({
          email,
          productName: receiptProduct,
          amountCents,
          currency: session.currency ?? "gbp",
          paymentId,
          purchasedAt: event.created,
          kind: feature === "ai_tutor_topup" ? "topup" : "unlock",
          accessPath: `/courses/${PMQ_SLUG}`,
          accessLabel:
            feature === "ai_tutor_topup" ? "Back to the course" : "Open the course",
        });
        if (!sent) {
          console.error(
            "[stripe] PMQ purchase granted but receipt email failed; Stripe will retry",
            { userId, paymentId, email },
          );
          return NextResponse.json(
            { error: "Purchase receipt email failed" },
            { status: 500 },
          );
        }

        notifyAdminOfPurchase({
          email,
          productName: receiptProduct,
          amountCents,
          currency: session.currency ?? "gbp",
          paymentId,
          purchasedAt: event.created,
          courseId: courseId || PMQ_COURSE_ID,
          feature,
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
      if (entitlementGranted || creditGranted) {
        // The Pro row (or the top-up credit) is already written. Record that
        // even though Stripe will retry the rest of the handler.
        await recordPurchase(session, event.created, {
          entitlementGranted,
          creditGranted,
        });
      } else {
        await recordGrantFailed(
          session,
          event.created,
          feature === "ai_tutor_topup" ? "credit_write_failed" : "entitlement_write_failed",
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
