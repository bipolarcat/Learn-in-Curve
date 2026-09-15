"use client";

import Link from "next/link";
import { Lightbulb, Lock } from "lucide-react";
import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import {
  formatPfqPriceGbp,
  PFQ_LEARN_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { productSurfaceQuiet } from "@/components/ui/semantic";
import { cn } from "@/lib/utils";

type Props = {
  objectiveNumber: number;
  isSignedIn: boolean;
  /**
   * `inline` — sits inside the Insights disclosure (same Learn chrome as Pro).
   * `card` — standalone plate (legacy; prefer inline in Learn).
   */
  variant?: "inline" | "card";
};

/**
 * Insights teaching text is stripped server-side — there is no body to blur.
 * Design for absence: a clear Pro upsell, not a faded teaser.
 */
export function PfqInsightsLockedUpsell({
  objectiveNumber,
  isSignedIn,
  variant = "inline",
}: Props) {
  const returnPath = `${PFQ_LEARN_HREF}/${objectiveNumber}`;

  if (variant === "inline") {
    return (
      <div
        role="note"
        className="rounded-lg border border-orange/20 bg-orange/[0.06] px-3 py-3 sm:px-3.5"
        aria-label="Insights for this outcome are part of Pro"
      >
        <div className="flex items-start gap-2.5">
          <Lock
            className="mt-0.5 size-3.5 shrink-0 text-orange"
            strokeWidth={2.25}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13px] font-semibold tracking-tight text-ink">
              Insights unlock with Pro
            </p>
            <p className="m-0 mt-1 text-[12.5px] leading-snug text-pretty text-ink/65">
              The teaching for this outcome is part of Pro. Takeaways and the
              rest of the lesson stay free.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <PfqCheckoutButton
                isSignedIn={isSignedIn}
                returnPath={returnPath}
                label={`Get Pro — ${formatPfqPriceGbp()}`}
                className="btn btn-primary inline-flex !min-h-8 !w-auto !rounded-lg !px-3 !text-[12.5px]"
              />
              <Link
                href={PFQ_PRICING_HREF}
                className="inline-flex min-h-8 items-center px-1 text-[12.5px] font-semibold text-ink/55 underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="note"
      className={cn(
        productSurfaceQuiet,
        "relative overflow-hidden px-4 py-5 sm:px-5 sm:py-6",
      )}
      aria-label="Insights for this objective are part of Pro"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange/80 via-teal/50 to-transparent"
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange/[0.12] text-orange"
          aria-hidden
        >
          <Lightbulb className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/45">
            Part of Pro
          </p>
          <h3 className="m-0 mt-1 font-display text-[1.15rem] font-bold tracking-[-0.02em] text-ink text-balance sm:text-[1.25rem]">
            Insights for objective {objectiveNumber} unlock with Pro
          </h3>
          <p className="m-0 mt-2 max-w-[42ch] text-[13.5px] leading-relaxed text-pretty text-ink/65">
            The teaching text for this objective is not on this page until you
            unlock Pro. Takeaways, definitions, misconceptions and memory aids
            stay free.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <PfqCheckoutButton
              isSignedIn={isSignedIn}
              returnPath={returnPath}
              label={`Get Pro — ${formatPfqPriceGbp()}`}
              className="btn btn-primary inline-flex !min-h-9 !w-auto !rounded-xl !px-3.5 !text-[13px]"
            />
            <Link
              href={PFQ_PRICING_HREF}
              className="inline-flex min-h-9 items-center px-1 text-[13px] font-semibold text-ink/55 underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
