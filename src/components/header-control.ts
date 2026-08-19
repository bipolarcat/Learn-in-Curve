/**
 * Modern header control language — flat, snappy chrome for SiteHeader only.
 * Same corner radius as site stamp CTAs (`rounded-xl`, e.g. Notify me).
 */

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const motion =
  `motion-safe:transition-[transform,background-color,border-color,color,filter] motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.96] motion-reduce:transition-none ${focus}`;

/** Quiet icon control — no rim. */
export const headerIcon =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-0 bg-transparent text-ink hover:bg-ink/[0.07] ${motion}`;

/** Quiet danger hover for Home / Sign out. */
export const headerIconQuiet =
  `${headerIcon} hover:!bg-rust/[0.1] hover:!text-rust`;

/** Filled orange icon — primary nav affordance (Dashboard). */
export const headerIconPrimary =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-action text-paper hover:bg-action-hover ${motion}`;

/**
 * Compact signed-in chrome — matches ThemeToggle height (h-6).
 * Dashboard uses quiet press-only motion; Sign out owns its own exit animation.
 */
const compactMotionQuiet =
  `motion-safe:transition-[transform,background-color,border-color,color] motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.98] motion-reduce:transition-none ${focus}`;

/** Compact Dashboard — orange control, same height as ThemeToggle. */
export const headerIconCompactPrimary =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#D5501F] text-[#FBF3E1] hover:bg-[#c4481c] ${compactMotionQuiet}`;

/** Compact Sign out — theme-aware ink rim (visible in light + dark); overflow clips exiting arrow. */
export const headerIconCompactQuiet =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/45 bg-transparent text-ink hover:border-rust/70 hover:bg-rust/10 hover:text-rust motion-safe:transition-[transform,background-color,border-color,color] motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.96] motion-reduce:transition-none ${focus}`;

/** Compact Courses — teal control, same height as ThemeToggle / Dashboard. */
export const headerIconCompactTeal =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-transparent bg-teal text-paper hover:brightness-[1.08] ${compactMotionQuiet}`;

/** Teal icon — Courses when icon-only. */
export const headerIconTeal =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-teal text-paper hover:brightness-[1.08] ${motion}`;

/** Labeled secondary — Courses. */
export const headerPillSecondary =
  `group inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-transparent px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-ink hover:bg-ink/[0.07] sm:px-3 ${motion}`;

/** Overflow menu trigger: icon + Menu label (label hides when open). */
export const headerMenuTrigger =
  `group inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border-0 bg-transparent px-2 font-body text-[12px] font-semibold tracking-[-0.01em] text-ink hover:bg-ink/[0.07] ${motion}`;

/** Labeled teal — Courses with brand accent. */
export const headerPillTeal =
  `group inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-teal px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper hover:brightness-[1.08] sm:px-3 ${motion}`;

/** Primary CTA — Sign up / Sign in. */
export const headerPillPrimary =
  `group inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-action px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper hover:bg-action-hover sm:gap-1.5 sm:px-3 ${motion}`;

/** Dark-mode toggle shell — same flat geometry as icon chrome. */
export const headerThemeToggle =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${motion}`;
