"use client";

import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import { ProBundleChip } from "@/components/ui/PurchaseCtaButton";
import { formatPfqPriceGbp } from "@/lib/pfq/constants";
import { cn } from "@/lib/utils";

/**
 * Dashboard / compact "Get Pro Bundle" control for PFQ.
 *
 * Same chrome as PMQ's `GetProBundleButton` so the purchase read is identical
 * across course cards. Checkout goes through `createPfqCheckout`, not the
 * PMQ Stripe path. Motion: shared `PurchaseCtaButton` spring + teal sheen.
 */
const getProBundleButtonClass =
  "inline-flex shrink-0 !min-h-8 !w-auto items-center justify-center !rounded-lg !border !border-ink/70 !bg-ink !px-2.5 !py-1 !font-body !text-[11px] !font-semibold !normal-case !tracking-tight !text-paper disabled:!opacity-90";

type GetPfqProBundleButtonProps = {
  /** Signed-in on the dashboard always; kept explicit for checkout auth branch. */
  isSignedIn?: boolean;
  /** Stripe Back / cancel return. Dashboard default. */
  returnPath?: string;
  className?: string;
};

export function GetPfqProBundleButton({
  isSignedIn = true,
  returnPath = "/dashboard",
  className,
}: GetPfqProBundleButtonProps) {
  const priceLabel = formatPfqPriceGbp();

  return (
    <PfqCheckoutButton
      isSignedIn={isSignedIn}
      inline
      purchaseMotion
      returnPath={returnPath}
      ariaLabel={`Get Pro Bundle · ${priceLabel}`}
      label={
        <>
          Get <ProBundleChip /> Bundle · {priceLabel}
        </>
      }
      className={cn(getProBundleButtonClass, className)}
    />
  );
}
