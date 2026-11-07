"use client";

import { getAnalyticsIdentity } from "@/components/PostHogProvider";
import { readConsent } from "@/lib/analytics/consent";
import type { CheckoutAnalyticsContext } from "@/lib/analytics/checkout-return";
import { trackCheckoutStarted } from "@/lib/analytics/events";

/**
 * What the browser already knows at the moment of the click.
 * The distinct id is omitted after cookie consent because it is the account
 * id, and the server already has that. Before consent it is the anonymous
 * in-memory id, which is not written to a cookie.
 */
export function readCheckoutAnalyticsContext(): CheckoutAnalyticsContext {
  const consent = readConsent();
  const sourcePath =
    typeof window !== "undefined" ? window.location.pathname : undefined;
  const identity = getAnalyticsIdentity();
  return {
    sourcePath,
    consent,
    distinctId: consent === "granted" ? undefined : identity.distinctId,
    sessionId: identity.sessionId,
  };
}

/** A signed-out click never creates a Stripe session. Record the intent anyway. */
export function trackGuestCheckoutClick(props: {
  product: string;
  priceCents: number;
  course: "pmq" | "pfq";
}): void {
  trackCheckoutStarted({
    product: props.product,
    price_cents: props.priceCents,
    course: props.course,
    signed_in: false,
  });
}
