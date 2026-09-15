import { createHash } from "crypto";
import { captureServer } from "@/lib/analytics/server";
import { PMQ_COURSE_ID, PFQ_COURSE_ID } from "@/lib/courses/ids";

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
  /** Deterministic PostHog event uuid — same session always → same uuid. */
  uuid: string;
  /** ISO timestamp from Stripe `event.created`. */
  timestamp: string;
  properties: Record<string, unknown>;
};

/** Fixed LIC namespace for purchase_completed UUIDv5-style ids. */
const PURCHASE_UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

/**
 * Deterministic UUID from a Stripe Checkout Session id.
 * SHA-256 of `purchase_completed:${sessionId}` formatted as a UUID (version 5 bits).
 */
export function purchaseCompletedEventUuid(sessionId: string): string {
  const digest = createHash("sha256")
    .update(`purchase_completed:${sessionId}`)
    .update(PURCHASE_UUID_NAMESPACE)
    .digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function productFromFeature(feature: string | undefined): string | undefined {
  if (!feature) return undefined;
  if (feature === "ai_tutor_topup") return "sly_topup";
  if (feature === "ai_tutor") return "ai_pro";
  return feature;
}

function courseFromId(courseId: string | undefined): string | undefined {
  if (!courseId) return undefined;
  if (courseId === PMQ_COURSE_ID) return "pmq";
  if (courseId === PFQ_COURSE_ID) return "pfq";
  return courseId;
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
 *
 * @param eventCreatedSeconds Stripe `event.created` (unix seconds).
 */
export function purchaseCompletedFromCheckoutSession(
  session: CheckoutSessionForPurchase,
  eventCreatedSeconds: number,
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
    stripe_session_id: session.id,
    stripe_payment_id: stripePaymentId,
  };

  if (typeof session.amount_total === "number") {
    properties.amount_cents = session.amount_total;
  }
  if (session.currency) {
    properties.currency = session.currency.toUpperCase();
  }
  if (product) {
    properties.product = product;
  }
  if (course) {
    properties.course = course;
  }

  return {
    distinctId,
    uuid: purchaseCompletedEventUuid(session.id),
    timestamp: new Date(eventCreatedSeconds * 1000).toISOString(),
    properties,
  };
}

/**
 * Fire `purchase_completed` from the Stripe webhook. Best-effort: callers
 * should catch so a PostHog outage never fails entitlement grants.
 */
export async function trackPurchaseCompleted(
  session: CheckoutSessionForPurchase,
  eventCreatedSeconds: number,
): Promise<void> {
  const payload = purchaseCompletedFromCheckoutSession(
    session,
    eventCreatedSeconds,
  );
  if (!payload) return;
  await captureServer(
    payload.distinctId,
    "purchase_completed",
    payload.properties,
    { uuid: payload.uuid, timestamp: payload.timestamp },
  );
}
