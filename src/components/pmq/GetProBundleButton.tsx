"use client";

import { AiTutorUpgradeCta } from "@/components/pmq/AiTutorUpgradeCta";
import { ProBundleChip } from "@/components/ui/PurchaseCtaButton";
import { formatGbp } from "@/lib/pmq/constants";
import { cn } from "@/lib/utils";

/**
 * The one "Get Pro Bundle" control.
 *
 * Extracted from DashboardPmqCourseCard, which is the reference implementation.
 * The free-tier locked-media upsell used to carry its own near-miss copy of
 * these styles ("Get Pro · £15" on a slightly different button), so the same
 * purchase read as two different products depending on where a user met it.
 * Both now render this, which is why the classes live here rather than being
 * pasted per call site.
 *
 * The price is always `formatGbp(priceCents)` — never a literal. Callers pass
 * the same constant Stripe charges. See the comment in plans.ts for why that
 * matters beyond tidiness.
 *
 * Motion matches PFQ: shared `PurchaseCtaButton` spring + teal sheen.
 */
const getProBundleButtonClass =
  "inline-flex shrink-0 !min-h-8 !w-auto items-center justify-center !rounded-lg !border !border-ink/70 !bg-ink !px-2.5 !py-1 !font-body !text-[11px] !font-semibold !normal-case !tracking-tight !text-paper disabled:!opacity-90";

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
      purchaseMotion
      priceCents={priceCents}
      loNumber={loNumber}
      returnPath={returnPath}
      buttonAriaLabel={`Get Pro Bundle · ${priceLabel}`}
      buttonLabel={
        <>
          Get <ProBundleChip /> Bundle · {priceLabel}
        </>
      }
      className={cn("shrink-0", className)}
      buttonClassName={getProBundleButtonClass}
    />
  );
}
