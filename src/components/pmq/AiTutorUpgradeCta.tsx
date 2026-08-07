"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createAiTutorCheckout } from "@/lib/pmq/actions";
import { formatGbp, AI_TUTOR_LAUNCHED } from "@/lib/pmq/constants";
import { SlyUnlockInvite } from "@/components/pmq/SlyUnlockInvite";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";
import { trackAiTutorUnlockClicked } from "@/lib/analytics/events";
import { SLY_UNLOCK_PRICE_CENTS } from "@/lib/tutor/constants";

type AiTutorUpgradeCtaProps = {
  priceCents: number;
  /** LO to return to after Stripe checkout; defaults to LO 1. */
  loNumber?: number;
  /** Optional override for Stripe success/cancel return path. */
  returnPath?: string;
  /** Compact = single button; full = desire-led Sly unlock invite. */
  variant?: "full" | "compact";
  /** Compact-only: smaller secondary affordance. */
  size?: "default" | "sm";
  /** Override unlock button label (e.g. "Unlock Sly — £8.00"). */
  buttonLabel?: ReactNode;
  /** Accessible name when `buttonLabel` is not a plain string. */
  buttonAriaLabel?: string;
  /** Compact-only: icon/content before the label. */
  leading?: ReactNode;
  className?: string;
  /** full-only: soft tease vs free-cap urgency. */
  urgency?: "soft" | "cap";
};

/**
 * Shared Premium-bundle upgrade CTA (LIC-37). Full = SlyUnlockInvite;
 * compact = single checkout button for inline upsells.
 */
export function AiTutorUpgradeCta({
  priceCents,
  loNumber = 1,
  returnPath,
  variant = "full",
  size = "default",
  buttonLabel,
  buttonAriaLabel,
  leading,
  className = "",
  urgency = "soft",
}: AiTutorUpgradeCtaProps) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const priceLabel = formatGbp(priceCents);

  if (!AI_TUTOR_LAUNCHED) return null;

  if (variant === "full") {
    return (
      <SlyUnlockInvite
        priceCents={priceCents}
        loNumber={loNumber}
        returnPath={returnPath}
        urgency={urgency}
        className={className}
      />
    );
  }

  const handleUnlock = () => {
    setError("");
    trackAiTutorUnlockClicked({
      location: "ai_tutor_upgrade_cta_compact",
      price_cents: SLY_UNLOCK_PRICE_CENTS,
    });
    startTransition(async () => {
      const result = await createAiTutorCheckout({
        loNumber,
        returnPath,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  };

  const isSm = size === "sm";
  const defaultLabel = isSm
    ? `Unlock — ${priceLabel}`
    : `Unlock Sly — ${priceLabel}`;
  const accessibleLabel =
    buttonAriaLabel ??
    (typeof buttonLabel === "string" ? buttonLabel : undefined) ??
    defaultLabel;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleUnlock}
        disabled={pending}
        aria-busy={pending}
        aria-label={pending ? "Opening checkout" : accessibleLabel}
        className={
          isSm
            ? "btn btn-secondary inline-flex shrink-0 items-center justify-center gap-1.5 !min-h-8 !w-auto !rounded-xl !px-2.5 !py-1 !text-[10px] !font-body !uppercase !tracking-[0.04em]"
            : "btn btn-primary inline-flex w-full items-center justify-center gap-2"
        }
      >
        {pending ? (
          <Spinner variant="bars" size={14} className="text-current" aria-hidden />
        ) : (
          <>
            {leading}
            <span className="inline-flex min-w-0 flex-wrap items-center justify-center gap-x-1">
              {buttonLabel ?? defaultLabel}
            </span>
          </>
        )}
      </button>
      {error && (
        <p role="alert" className={`mt-1.5 ${fieldErrorHint}`}>
          {error}
        </p>
      )}
    </div>
  );
}
