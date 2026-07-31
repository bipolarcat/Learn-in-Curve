/**
 * Shared stamp-chip button styles — header + landing CTAs.
 * Rounded-xl, flat (no sticker shadow) — matches landing hero CTAs.
 */

import type { ReactNode } from "react";
import {
  marketingActionPrimary,
  marketingActionPrimaryFlat,
  marketingActionSecondary,
  marketingActionSecondaryFlat,
} from "@/components/ui/semantic";

const stampMotion =
  "transition-[transform,background-color,color,border-color] duration-200 ease-[var(--ease-out-quint)] hover:border-ink/40 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/** Square icon stamp (signed-in header chrome). */
export const stampChipBase = `group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/25 ${stampMotion}`;

export const stampChipIdle = `${stampChipBase} bg-paper text-ink hover:bg-cream`;
export const stampChipActive = `${stampChipBase} bg-ink text-paper hover:bg-ink hover:text-paper`;
export const stampChipPrimary = `${stampChipBase} bg-action text-paper border-ink/30 hover:bg-action-hover hover:text-paper`;
export const stampChipTeal = `${stampChipBase} bg-teal text-paper border-ink/30 hover:bg-teal hover:text-paper`;

/** Labeled stamp — header Courses / Sign up. */
export const stampChipLabeled = `group inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-ink/25 px-3 font-body text-[10px] font-bold uppercase tracking-[0.06em] ${stampMotion} sm:gap-2 sm:px-3.5 sm:text-[11px]`;

export const stampChipLabeledIdle = `${stampChipLabeled} bg-paper text-ink hover:bg-cream`;
export const stampChipLabeledPrimary = `${stampChipLabeled} bg-action text-paper border-ink/30 hover:bg-action-hover hover:text-paper`;
export const stampChipLabeledTeal = `${stampChipLabeled} bg-teal text-paper border-ink/30 hover:bg-teal hover:text-paper`;

/**
 * Page CTAs (hero / Meet Sly) — same stamp language as header labeled primary,
 * slightly taller for conversion.
 */
export const stampCtaPrimary = marketingActionPrimary;

/** Quiet secondary stamp CTA (Explore / browse). */
export const stampCtaSecondary = marketingActionSecondary;

/**
 * Compact stamp size — course cards, dialogs, dense chrome.
 * Use this (or `*Compact` aliases) for any CTA inside a card or popup.
 */
export const stampCtaCompact =
  "!min-h-8 !h-auto !px-[0.85rem] !py-[0.35rem] !text-[9px] !tracking-[0.05em] !gap-1 [&_svg]:!h-[0.85em] [&_svg]:!w-[0.85em]";

export const stampCtaPrimaryCompact = `${stampCtaPrimary} ${stampCtaCompact}`;
export const stampCtaSecondaryCompact = `${stampCtaSecondary} ${stampCtaCompact}`;

/** Flat primary/secondary CTAs for the home brand hero (no sticker shadow). */
export const stampCtaPrimaryFlat = marketingActionPrimaryFlat;
export const stampCtaSecondaryFlat = marketingActionSecondaryFlat;

/** Right arrow for landing / page CTAs — nudges on group hover. */
export function CtaArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 ${className}`}
    >
      <path d="M3 8h10" />
      <path d="M9 4l4 4-4 4" />
    </svg>
  );
}

/** Left arrow — Previous / back CTAs; nudges left on group hover. */
export function CtaArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5 ${className}`}
    >
      <path d="M13 8H3" />
      <path d="M7 4 3 8l4 4" />
    </svg>
  );
}

/** Top-right (↗) arrow — explore / external-path CTAs. */
export function CtaArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${className}`}
    >
      <path d="M4 12 12 4" />
      <path d="M6 4h6v6" />
    </svg>
  );
}

/** Label + arrow for stamp / btn CTAs. */
export function StampCtaLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      <CtaArrow />
    </span>
  );
}
