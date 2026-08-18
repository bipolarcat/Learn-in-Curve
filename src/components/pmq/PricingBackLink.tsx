"use client";

import type { ReactNode } from "react";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { SOFT_NAV_BACK } from "@/lib/soft-nav-back";

/**
 * Pricing-page back control — same language as LO OverviewBackButton
 * (← + soft-nav ring spinner), labelled “Back to courses”.
 * Optional `current` is the page crumb after a pipe, not a second link.
 */
export function PricingBackLink({ current }: { current?: ReactNode }) {
  const target = SOFT_NAV_BACK.courses;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <SoftNavBackLink
        href={target.href}
        label={target.label}
        busyLabel={target.busyLabel}
      />
      {current ? (
        <>
          <span className="text-ink/30" aria-hidden>
            |
          </span>
          <span className="font-body text-[12px] font-semibold text-ink sm:text-[13px]">
            {current}
          </span>
        </>
      ) : null}
    </div>
  );
}
