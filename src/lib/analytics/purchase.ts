import { captureServer } from "@/lib/analytics/server";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";

/**
 * Minimal Stripe Checkout.Session fields used for `purchase_completed`.
 * Kept as a plain shape so unit tests don't need the Stripe SDK.
 */
export type CheckoutSessionForPurchase = {
  id: string;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id?: string | null } | null;
  metadata?: Record<string, string> | null;
};

export type PurchaseCompletedCapture = {
  distinctId: string;
  properties: Record<string, unknown>;
};

function productFromFeature(feature: string | undefined): string | undefined {
  if (!feature) return undefined;
  if (feature === "ai_tutor_topup") return "sly_topup";
  if (feature === "ai_tutor") return "ai_pro";
  return feature;
}

function courseFromId(courseId: string | undefined): string | undefined {
  if (!courseId) return undefined;
  return courseId === PMQ_COURSE_ID ? "pmq" : courseId;
}

function paymentId(session: CheckoutSessionForPurchase): string {
  const intent = session.payment_intent;
  if (typeof intent === "string" && intent) return intent;
  if (intent && typeof intent === "object" && intent.id) return intent.id;
  return session.id;
}

/**
 * Map a paid Checkout Session to a PostHog `purchase_completed` payload.
 * Returns null when we cannot identify the buyer or the session is not paid.
 */
export function purchaseCompletedFromCheckoutSession(
  session: CheckoutSessionForPurchase,
): PurchaseCompletedCapture | null {
  if (session.payment_status && session.payment_status !== "paid") {
    return null;
  }

  const distinctId = session.metadata?.user_id;
  if (!distinctId) return null;

  const product = productFromFeature(session.metadata?.feature);
  const course = courseFromId(session.metadata?.course_id);
  const stripePaymentId = paymentId(session);

  const properties: Record<string, unknown> = {
    $insert_id: `purchase_completed:${session.id}`,
    stripe_session_id: session.id,
    stripe_payment_id: stripePaymentId,
  };

  if (typeof session.amount_total === "number") {
    properties.amount_cents = session.amount_total;
  }
  if (session.currency) {
    properties.currency = session.currency;
  }
  if (product) {
    properties.product = product;
  }
  if (course) {
    properties.course = course;
  }

  return { distinctId, properties };
}

/**
 * Fire `purchase_completed` from the Stripe webhook. Best-effort: callers
 * should catch so a PostHog outage never fails entitlement grants.
 */
export async function trackPurchaseCompleted(
  session: CheckoutSessionForPurchase,
): Promise<void> {
  const payload = purchaseCompletedFromCheckoutSession(session);
  if (!payload) return;
  await captureServer(
    payload.distinctId,
    "purchase_completed",
    payload.properties,
  );
}
