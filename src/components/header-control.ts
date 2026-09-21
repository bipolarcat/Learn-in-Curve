/**
 * Modern header control language — flat, snappy chrome for SiteHeader only.
 * Same corner radius as site stamp CTAs (`rounded-xl`, e.g. Notify me).
 *
 * Hover washes are gated to fine pointers — iOS sticky :hover was leaving a
 * grey plate on Sign in / Menu after tap (“stale highlight”).
 */

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const tap =
  "touch-manipulation [-webkit-tap-highlight-color:transparent]";

const fineHover = "[@media(hover:hover)_and_(pointer:fine)]";

const motion =
  `motion-safe:transition-[transform,background-color,border-color,color,filter] motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.96] motion-reduce:transition-none ${focus}`;

/** Quiet icon control — no rim. */
export const headerIcon =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-0 bg-transparent text-ink ${tap} ${fineHover}:hover:bg-ink/[0.07] ${motion}`;

/** Quiet danger hover for Home / Sign out. */
export const headerIconQuiet =
  `${headerIcon} ${fineHover}:hover:!bg-rust/[0.1] ${fineHover}:hover:!text-rust`;

/** Filled orange icon — primary nav affordance (Dashboard). */
export const headerIconPrimary =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-action text-paper ${tap} ${fineHover}:hover:bg-action-hover ${motion}`;

/**
 * Compact signed-in chrome — matches ThemeToggle height (h-6).
 * Dashboard uses quiet press-only motion; Sign out owns its own exit animation.
 */
const compactMotionQuiet =
  `motion-safe:transition-[transform,background-color,border-color,color] motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.98] motion-reduce:transition-none ${focus}`;

/** Compact Dashboard — orange control, same height as ThemeToggle. */
export const headerIconCompactPrimary =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#D5501F] text-[#FBF3E1] ${tap} ${fineHover}:hover:bg-[#c4481c] ${compactMotionQuiet}`;

/** Compact Sign out — theme-aware ink rim (visible in light + dark); overflow clips exiting arrow. */
export const headerIconCompactQuiet =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/45 bg-transparent text-ink ${tap} ${fineHover}:hover:border-rust/70 ${fineHover}:hover:bg-rust/10 ${fineHover}:hover:text-rust motion-safe:transition-[transform,background-color,border-color,color] motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.96] motion-reduce:transition-none ${focus}`;

/** Compact Courses — teal control, same height as ThemeToggle / Dashboard. */
export const headerIconCompactTeal =
  `group inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-transparent bg-teal text-paper ${tap} ${fineHover}:hover:brightness-[1.08] ${compactMotionQuiet}`;

/** Teal icon — Courses when icon-only. */
export const headerIconTeal =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-teal text-paper ${tap} ${fineHover}:hover:brightness-[1.08] ${motion}`;

/** Labeled secondary — Courses / quiet Sign in utility (taller for touch). */
export const headerPillSecondary =
  `group inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-transparent px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-ink/70 ${tap} ${fineHover}:hover:bg-ink/[0.05] ${fineHover}:hover:text-ink sm:px-3 ${motion}`;

/** Quiet Sign in — h-8 so it sits inside the h-12/sm:h-14 bar with room for the rim. */
export const headerPillAuthUtility =
  `group inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-ink/35 bg-transparent px-2.5 font-body text-[12px] font-medium tracking-[-0.01em] text-ink/55 ${tap} ${fineHover}:hover:border-ink/50 ${fineHover}:hover:bg-ink/[0.05] ${fineHover}:hover:text-ink/80 sm:px-3 ${motion}`;

/** Overflow menu trigger: icon + Menu label (label hides when open). */
export const headerMenuTrigger =
  `group inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border-0 bg-transparent px-2 font-body text-[12px] font-semibold tracking-[-0.01em] text-ink ${tap} ${fineHover}:hover:bg-ink/[0.07] ${motion}`;

/**
 * Menu open — solid ink plate. Own string (no grey wash) so the closed
 * trigger’s hover wash cannot win on specificity / stylesheet order.
 */
export const headerMenuTriggerOpen =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1 rounded-xl border-0 bg-ink px-2 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper ${tap} hover:bg-ink hover:text-paper ${fineHover}:hover:bg-ink ${fineHover}:hover:text-paper ${motion}`;

/** Labeled teal — Courses with brand accent. */
export const headerPillTeal =
  `group inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-teal px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper ${tap} ${fineHover}:hover:brightness-[1.08] sm:px-3 ${motion}`;

/** Primary CTA — Sign up / Sign in. */
export const headerPillPrimary =
  `group inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-action px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper ${tap} ${fineHover}:hover:bg-action-hover sm:gap-1.5 sm:px-3 ${motion}`;

/**
 * Guest auth CTA — ink (black) fill + sheen sweep (21st Shiny Button cue).
 * Styles live in `globals.css` under `.header-auth-gleam`.
 */
export const headerPillAuthGleam =
  `header-auth-gleam group relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl border-0 px-2.5 font-body text-[12px] font-semibold tracking-[-0.01em] text-paper ${tap} sm:gap-1.5 sm:px-3 ${focus}`;

/** Dark-mode toggle shell — same flat geometry as icon chrome. */
export const headerThemeToggle =
  `group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${tap} ${motion}`;
