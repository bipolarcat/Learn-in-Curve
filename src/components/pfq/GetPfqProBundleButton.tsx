"use client";

import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import { formatPfqPriceGbp } from "@/lib/pfq/constants";
import { cn } from "@/lib/utils";

/**
 * Dashboard / compact "Get Pro Bundle" control for PFQ.
 *
 * Same chrome as PMQ's `GetProBundleButton` so the purchase read is identical
 * across course cards. Checkout goes through `createPfqCheckout`, not the
 * PMQ Stripe path.
 */
const getProBundleButtonClass =
  "inline-flex shrink-0 !w-auto !min-h-8 items-center justify-center gap-1 !rounded-lg !border !border-ink/70 !bg-ink !px-2.5 !py-1 !font-body !text-[11px] !font-semibold !normal-case !tracking-tight !text-paper hover:!bg-teal-deep disabled:!opacity-90";

type GetPfqProBundleButtonProps = {
  /** Signed-in on the dashboard always; kept explicit for checkout auth branch. */
  isSignedIn?: boolean;
  className?: string;
};

export function GetPfqProBundleButton({
  isSignedIn = true,
  className,
}: GetPfqProBundleButtonProps) {
  const priceLabel = formatPfqPriceGbp();

  return (
    <PfqCheckoutButton
      isSignedIn={isSignedIn}
      inline
      ariaLabel={`Get Pro Bundle · ${priceLabel}`}
      label={
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
