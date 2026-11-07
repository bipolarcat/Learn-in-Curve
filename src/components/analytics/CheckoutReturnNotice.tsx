"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  interpretCheckoutReturn,
  type CheckoutReturnReading,
} from "@/lib/analytics/checkout-return";
import {
  trackCheckoutCancelled,
  trackCheckoutCompleted,
} from "@/lib/analytics/events";
import { PFQ_PRICING_HREF } from "@/lib/pfq/constants";
import { PMQ_PRICING_HREF } from "@/lib/pmq/pro-intent";
import { productSurfaceQuiet } from "@/components/ui/semantic";

function retryLinks(
  reading: CheckoutReturnReading,
): { href: string; label: string }[] {
  if (reading.product === "sly_topup") {
    return [{ href: "/dashboard", label: "Try again" }];
  }
  if (reading.course === "pmq") {
    return [{ href: PMQ_PRICING_HREF, label: "Try again" }];
  }
  if (reading.course === "pfq") {
    return [{ href: PFQ_PRICING_HREF, label: "Try again" }];
  }
  return [
    { href: PMQ_PRICING_HREF, label: "PMQ plans" },
    { href: PFQ_PRICING_HREF, label: "PFQ plans" },
  ];
}

const linkClass =
  "font-semibold text-teal underline decoration-teal/30 underline-offset-2 hover:decoration-teal";

/**
 * Success and cancel used to be the same URL. This reads `checkout=cancelled`
 * (and a bare return from checkout.stripe.com, which is what a Back button
 * looks like) and says so. The success URL only records the return; the
 * webhook records the payment.
 */
export function CheckoutReturnNotice() {
  const fired = useRef(false);
  const [cancelled, setCancelled] = useState<CheckoutReturnReading | null>(null);

  useEffect(() => {
    if (fired.current) return;
    const reading = interpretCheckoutReturn({
      search: window.location.search,
      referrer: document.referrer,
    });
    if (!reading) return;
    fired.current = true;

    if (reading.kind === "success") {
      trackCheckoutCompleted({
        product: reading.product,
        course: reading.course,
        checkout_ref: reading.checkoutRef,
        stripe_session_id: reading.stripeSessionId,
      });
      return;
    }

    trackCheckoutCancelled({
      product: reading.product,
      course: reading.course,
      checkout_ref: reading.checkoutRef,
      stripe_session_id: reading.stripeSessionId,
      signal: reading.signal === "stripe_referrer" ? "stripe_referrer" : "cancel_url",
    });
    setCancelled(reading);
  }, []);

  if (!cancelled) return null;

  const retries = retryLinks(cancelled);

  return (
    <div className="wrap pt-4">
      <div
        className={`${productSurfaceQuiet} checkout-cancelled-notice mx-auto max-w-[40rem] px-4 py-3.5 sm:px-5`}
        role="status"
      >
        <p className="text-[14px] font-medium leading-snug text-ink">
          Checkout closed before payment. Nothing was charged.
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink/70">
          You can try again, or ask a question if something got in the way.
        </p>
        <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {retries.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className={linkClass}>
            Ask a question
          </Link>
        </p>
      </div>
    </div>
  );
}
