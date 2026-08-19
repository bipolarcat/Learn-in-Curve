/**
 * Tier chips — one definition, used by the practice console toast, plan chrome
 * and the landing feature cards. Previously duplicated inside
 * `PracticeGenerateHint.tsx`; a second copy drifts, and a badge that says the
 * wrong tier is a pricing claim, not a styling bug.
 */

const aiProBadgeClass =
  "inline-flex h-4 shrink-0 items-center rounded-[0.25rem] bg-[color-mix(in_srgb,var(--gold)_32%,rgb(var(--paper-rgb)))] px-1 font-body text-[9px] font-bold tracking-[0.02em] text-[color-mix(in_srgb,var(--gold)_55%,#241a12)]";

/** Teal Pro chip — matches plan cards / course chrome. */
export function ProBadge() {
  return (
    <span className="inline-flex h-4 shrink-0 items-center rounded-[0.25rem] bg-teal/[0.14] px-1 font-body text-[9px] font-bold tracking-[0.02em] text-teal dark:bg-teal/[0.22]">
      Pro
    </span>
  );
}

/** Matt gold AI Pro chip — matches plan cards. */
export function AiProBadge() {
  return <span className={aiProBadgeClass}>AI Pro</span>;
}

/** Same tier-family treatment for the landing-page tutor descriptor. */
export function AiTutorBadge() {
  return <span className={aiProBadgeClass}>AI TUTOR</span>;
}

/** Rust Beta chip — same geometry as Pro / AI Pro. */
export function BetaBadge() {
  return (
    <span className="inline-flex h-4 shrink-0 items-center rounded-[0.25rem] bg-[color-mix(in_srgb,var(--rust)_16%,rgb(var(--paper-rgb)))] px-1 font-body text-[9px] font-bold tracking-[0.02em] text-rust">
      Beta
    </span>
  );
}

/** Same chip geometry as Pro / AI Pro; orange wash like the Pro teal plate. */
export function NewBadge() {
  return (
    <span className="inline-flex h-[1.125rem] shrink-0 items-center rounded-[0.25rem] bg-orange/[0.12] px-1 text-[10px] font-semibold tracking-tight text-orange dark:bg-orange/[0.2]">
      New
    </span>
  );
}
