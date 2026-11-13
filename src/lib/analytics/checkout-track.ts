import { captureServer } from "@/lib/analytics/server";
import {
  resolveCheckoutPerson,
  sanitizeCheckoutRef,
  sanitizeSourcePath,
  type CheckoutAnalyticsContext,
  type CheckoutCourse,
} from "@/lib/analytics/checkout-return";
import { purchaseCompletedEventUuid } from "@/lib/analytics/purchase";
import type { CheckoutSessionForPurchase } from "@/lib/analytics/purchase";

/**
 * Server checkout events. Best-effort: a PostHog outage must not fail
 * session creation or an entitlement grant. Callers catch.
 *
 * `checkout_started` is the moment a Stripe Checkout Session exists.
 * `purchase_grant_failed` is a webhook that did not write the entitlement
 * (or, for a top-up, the credit). `purchase_completed` stays in purchase.ts
 * and only fires after that write succeeds.
 */

export type CheckoutStartedInput = {
  userId: string;
  stripeSessionId: string;
  checkoutRef: string;
  product: string;
  course: CheckoutCourse;
  priceCents: number;
  sourcePath?: string;
  analytics?: CheckoutAnalyticsContext;
};

function personProperties(person: ReturnType<typeof resolveCheckoutPerson>): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  if (person.posthogSessionId) properties.$session_id = person.posthogSessionId;
  return properties;
}

export async function trackCheckoutStartedServer(input: CheckoutStartedInput): Promise<void> {
  const person = resolveCheckoutPerson({
    userId: input.userId,
    consent: input.analytics?.consent,
    anonDistinctId: input.analytics?.distinctId,
    posthogSessionId: input.analytics?.sessionId,
    fallbackDistinctId: input.userId,
  });
  const sourcePath = sanitizeSourcePath(input.sourcePath ?? input.analytics?.sourcePath);
  const checkoutRef = sanitizeCheckoutRef(input.checkoutRef) ?? input.checkoutRef;

  await captureServer(person.distinctId, "checkout_started", {
    ...personProperties(person),
    product: input.product,
    course: input.course,
    price_cents: input.priceCents,
    signed_in: true,
    stripe_session_id: input.stripeSessionId,
    checkout_ref: checkoutRef,
    ...(sourcePath ? { source_path: sourcePath } : {}),
  });
}

export type PurchaseGrantFailureReason =
  | "missing_metadata"
  | "invalid_feature"
  | "invalid_amount"
  | "entitlement_write_failed"
  | "credit_write_failed";

export async function trackPurchaseGrantFailed(
  session: CheckoutSessionForPurchase,
  eventCreatedSeconds: number,
  reason: PurchaseGrantFailureReason,
): Promise<void> {
  const userId = session.metadata?.user_id;
  const person = resolveCheckoutPerson({
    userId,
    consent: session.metadata?.ph_consent,
    anonDistinctId: session.metadata?.ph_distinct_id,
    posthogSessionId: session.metadata?.ph_session_id,
    fallbackDistinctId: `stripe:${session.id}`,
  });
  const sourcePath = sanitizeSourcePath(session.metadata?.source_path);
  const checkoutRef = sanitizeCheckoutRef(session.metadata?.checkout_ref);

  const properties: Record<string, unknown> = {
    ...personProperties(person),
    stripe_session_id: session.id,
    reason,
    entitlement_granted: false,
    signed_in: Boolean(userId),
  };
  if (typeof session.amount_total === "number") properties.amount_cents = session.amount_total;
  if (session.currency) properties.currency = session.currency.toUpperCase();
  if (session.metadata?.feature) properties.feature = session.metadata.feature;
  if (session.metadata?.product) properties.product = session.metadata.product;
  if (sourcePath) properties.source_path = sourcePath;
  if (checkoutRef) properties.checkout_ref = checkoutRef;

  await captureServer(person.distinctId, "purchase_grant_failed", properties, {
    uuid: purchaseCompletedEventUuid(`purchase_grant_failed:${session.id}:${reason}`),
    timestamp: new Date(eventCreatedSeconds * 1000).toISOString(),
  });
}
