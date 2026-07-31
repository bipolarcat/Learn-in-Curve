/**
 * Narrow semantic UI families.
 *
 * These describe intent, not a universal card/button API: marketing, product,
 * form, and conversation surfaces keep distinct visual contracts.
 *
 * Buttons: rounded-xl, flat (no sticker shadow) — matches landing hero CTAs.
 */
const reducedTransparency =
  "[@media(prefers-reduced-transparency:reduce)]:bg-paper [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none";

export const marketingStampSurface =
  "rounded-2xl border-2 border-ink bg-paper shadow-[4px_4px_0_var(--shadow-ink)]";

export const productSurface =
  `rounded-2xl border border-black/[0.08] bg-paper/80 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/55 dark:border-white/[0.12] ${reducedTransparency}`;

export const productSurfaceQuiet =
  `rounded-xl border border-black/[0.08] bg-paper/90 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 dark:border-white/[0.12] ${reducedTransparency}`;

/** Opaque paper panel — no glass blur (reading / LO content stages). */
export const productSurfaceOpaque =
  "rounded-xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] dark:border-white/[0.12]";

export const quietFormSurface =
  "rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_12px_32px_rgb(0_0_0_/_0.08)]";

export const conversationSurface =
  "overflow-hidden border border-ink/20 bg-paper shadow-[0_12px_40px_rgb(var(--ink-rgb)_/_0.28)]";

const actionFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";
const actionMotion =
  "transition-[transform,background-color,border-color,color] duration-150 ease-[var(--ease-out-quint)] active:scale-[0.98] motion-reduce:transition-none";

export const marketingActionPrimary =
  `group inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-transparent bg-action px-5 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-paper hover:bg-action-hover sm:min-h-12 sm:px-6 sm:text-[12px] ${actionFocus} ${actionMotion}`;

export const marketingActionSecondary =
  `group inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-ink/20 bg-cream px-5 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-ink hover:bg-cream-2 sm:min-h-12 sm:px-6 sm:text-[12px] ${actionFocus} ${actionMotion}`;

/** Flat aliases — same as primary/secondary (hero language is the site default). */
export const marketingActionPrimaryFlat = marketingActionPrimary;
export const marketingActionSecondaryFlat = marketingActionSecondary;

export const productActionPrimary =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent bg-action px-4 text-[13px] font-bold text-paper hover:bg-action-hover ${actionFocus} ${actionMotion}`;

export const productActionSecondary =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-paper px-4 text-[13px] font-semibold text-ink hover:bg-cream ${actionFocus} ${actionMotion}`;

export const formActionPrimary =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent bg-action px-4 text-sm font-semibold text-white hover:bg-action-hover ${actionFocus} ${actionMotion}`;

export const formActionSecondary =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-ink hover:border-black/[0.14] hover:bg-[#f8f7f5] ${actionFocus} ${actionMotion}`;

/**
 * Inline form / field hints (invalid email, save failed, etc.).
 * Quiet body grey — not stamp, not rust. Keep `role="alert"` for a11y.
 */
export const fieldErrorHint =
  "font-body text-[11px] font-medium leading-snug tracking-tight text-ink/55 text-pretty";

export const iconAction =
  `inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-current hover:bg-ink/[0.06] ${actionFocus} ${actionMotion}`;
