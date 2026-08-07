"use client";

import { useEffect, useRef } from "react";
import { trackCheckoutCompleted } from "@/lib/analytics/events";

type CheckoutCompletedBeaconProps = {
  product: string;
  priceCents: number;
};

/**
 * Fires `checkout_completed` once on mount from Stripe return query params.
 * Does not clear the URL — callers leave `?sly_topup=1` / `?tutor_unlocked=1`.
 */
export function CheckoutCompletedBeacon({
  product,
  priceCents,
}: CheckoutCompletedBeaconProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackCheckoutCompleted({ product, price_cents: priceCents });
  }, [product, priceCents]);

  return null;
}
