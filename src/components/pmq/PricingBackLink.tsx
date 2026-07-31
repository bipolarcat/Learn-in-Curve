"use client";

import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { SOFT_NAV_BACK } from "@/lib/soft-nav-back";

/**
 * Pricing-page back control — same language as LO OverviewBackButton
 * (← + soft-nav ring spinner), labelled “Back to courses”.
 */
export function PricingBackLink() {
  const target = SOFT_NAV_BACK.courses;
  return (
    <SoftNavBackLink
      href={target.href}
      label={target.label}
      busyLabel={target.busyLabel}
      className="mb-4"
    />
  );
}
