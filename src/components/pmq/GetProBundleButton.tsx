"use client";

import { AiTutorUpgradeCta } from "@/components/pmq/AiTutorUpgradeCta";
import { formatGbp } from "@/lib/pmq/constants";
import { cn } from "@/lib/utils";

/**
 * The one "Get Pro Bundle" control.
 *
 * Extracted from DashboardPmqCourseCard, which is the reference implementation.
 * The free-tier locked-media upsell used to carry its own near-miss copy of
 * these styles ("Get Pro · £8" on a slightly different button), so the same
 * purchase read as two different products depending on where a user met it.
 * Both now render this, which is why the classes live here rather than being
 * pasted per call site.
 *
 * The price is always `formatGbp(priceCents)` — never a literal. Callers pass
 * the same constant Stripe charges. See the comment in plans.ts for why that
 * matters beyond tidiness.
 */
const getProBundleButtonClass =
  "shrink-0 [&_button]:!min-h-8 [&_button]:!w-auto [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-ink/70 [&_button]:!bg-ink [&_button]:!px-2.5 [&_button]:!py-1 [&_button]:!font-body [&_button]:!text-[11px] [&_button]:!font-semibold [&_button]:!normal-case [&_button]:!tracking-tight [&_button]:!text-paper hover:[&_button]:!bg-teal-deep";

type GetProBundleButtonProps = {
  priceCents: number;
  /** LO to return to after checkout. Omit when `returnPath` is given. */
  loNumber?: number;
  /** Explicit Stripe return path, e.g. "/dashboard". */
  returnPath?: string;
  className?: string;
};

export function GetProBundleButton({
  priceCents,
  loNumber,
  returnPath,
  className,
}: GetProBundleButtonProps) {
  const priceLabel = formatGbp(priceCents);

  return (
    <AiTutorUpgradeCta
      variant="compact"
      size="sm"
      priceCents={priceCents}
      loNumber={loNumber}
      returnPath={returnPath}
      buttonAriaLabel={`Get Pro Bundle · ${priceLabel}`}
      buttonLabel={
        <>
          Get{" "}
          <span className="inline-flex h-4 shrink-0 items-center rounded-[0.2rem] bg-teal px-1 text-[9px] font-bold leading-none tracking-tight text-paper">
            Pro
          </span>{" "}
          Bundle · {priceLabel}
        </>
      }
      className={cn(getProBundleButtonClass, className)}
    />
  );
}
