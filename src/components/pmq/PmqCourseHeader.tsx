"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Flame } from "lucide-react";
import { CourseChromeProgress } from "@/components/pmq/CourseChromeProgress";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import type { PmqTier } from "@/lib/pmq/tiers";

type PmqCourseHeaderProps = {
  courseName: string;
  /** Current LO (or deeper) label when not on overview — e.g. `[{ label: "LO 3" }]`. */
  breadcrumb?: { label: string; href?: string }[];
  /** 0–100 course completion. Narrow % bar when progress is shown. */
  completionPercent?: number;
  /** Signed-in: show compact streak + % progress. */
  showProgress?: boolean;
  /** @deprecated Use showProgress. */
  showStats?: boolean;
  /** @deprecated Unused — XP no longer in course chrome. */
  xp?: number;
  /** Current study streak (days). */
  streak?: number;
  /**
   * Paid-tier mark beside the course name.
   * Pro → teal Pro chip; AI Pro → matt-gold AI Pro chip; starter → none.
   */
  userTier?: PmqTier;
  /** @deprecated Prefer `userTier`. True maps to Pro (not AI Pro). */
  isPro?: boolean;
  /** @deprecated Site chrome is always SiteHeader — ignored. */
  showStudyNav?: boolean;
  /** @deprecated Site chrome is always SiteHeader — ignored. */
  isSignedIn?: boolean;
  /** @deprecated Sub-header is not sticky — ignored. */
  stickyTopClassName?: string;
  /** @deprecated Sub-header is not sticky — ignored. */
  sticky?: boolean;
  /** False on course overview (you are already there). */
  showOverviewLink?: boolean;
  /** Optional trailing meta (e.g. mock overall timer). Replaces streak/% when set alone. */
  trailing?: ReactNode;
};

const chromeBar =
  "flex w-full max-w-wrap items-center gap-2.5 rounded-xl border border-black/[0.08] bg-paper/90 px-2.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:gap-3 sm:px-3.5 dark:border-white/[0.12]";

const metaSep = "select-none text-ink/25";

const proMark =
  "inline-flex h-[1.125rem] shrink-0 items-center rounded-[0.25rem] bg-teal/[0.12] px-1 text-[10px] font-semibold tracking-tight text-teal dark:bg-teal/[0.2] dark:text-teal";

const aiProMark =
  "inline-flex h-[1.125rem] shrink-0 items-center rounded-[0.25rem] bg-[color-mix(in_srgb,var(--gold)_32%,rgb(var(--paper-rgb)))] px-1 text-[10px] font-semibold tracking-tight text-[color-mix(in_srgb,var(--gold)_55%,#241a12)]";

function OverviewBackButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening course overview" : "Back to course overview"}
      className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-0.5 font-semibold text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-wait disabled:opacity-80"
      onClick={() => {
        startTransition(() => {
          router.push(`/courses/${PMQ_SLUG}`);
        });
      }}
    >
      {pending ? (
        <Spinner variant="ring" size={14} className="text-orange" aria-hidden />
      ) : (
        <>
          <span className="text-[0.95em]" aria-hidden>
            ←
          </span>
          Overview
        </>
      )}
    </button>
  );
}

/**
 * Course strip under SiteHeader — paired chrome language, compact study meta.
 */
export function PmqCourseHeader({
  courseName,
  breadcrumb = [],
  completionPercent = 0,
  streak = 0,
  userTier,
  isPro = false,
  showProgress,
  showStats = false,
  showOverviewLink = true,
  trailing,
}: PmqCourseHeaderProps) {
  const onLoPage = showOverviewLink && breadcrumb.length > 0;
  const currentLoLabel = onLoPage
    ? breadcrumb[breadcrumb.length - 1]?.label
    : null;
  const progressVisible = showProgress ?? showStats;
  const pct = Math.max(0, Math.min(100, Math.round(completionPercent)));
  const streakDays = Math.max(0, Math.floor(streak));
  const paidTier =
    userTier ?? (isPro ? ("pro" as const) : ("starter" as const));
  const tierBadge =
    paidTier === "ai_pro" ? (
      <span className={aiProMark} aria-label="AI Pro unlocked">
        AI Pro
      </span>
    ) : paidTier === "pro" ? (
      <span className={proMark} aria-label="Pro unlocked">
        Pro
      </span>
    ) : null;

  return (
    <div className="pmq-course-chrome relative z-40 scroll-mt-2">
      <div className="flex justify-center px-3 pb-2 pt-2 sm:px-5 sm:pb-2.5 sm:pt-2">
        <section
          className={`${chromeBar} min-h-10 py-1.5 sm:min-h-11 sm:py-1.5`}
          aria-label="Course"
        >
          <div className="min-w-0 flex-1">
            {onLoPage && currentLoLabel ? (
              <nav
                className="flex min-w-0 items-center gap-1.5 text-[12px] leading-none sm:gap-2 sm:text-[13px]"
                aria-label="Location"
              >
                <OverviewBackButton />
                <span className={metaSep} aria-hidden>
                  |
                </span>
                <span
                  className="min-w-0 truncate font-semibold text-orange"
                  aria-current="page"
                >
                  {currentLoLabel}
                </span>
              </nav>
            ) : (
              <nav
                className="flex min-w-0 items-center gap-1.5 text-[12px] leading-none sm:gap-2 sm:text-[13px]"
                aria-label="Location"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 truncate font-semibold text-ink">
                    {courseName}
                  </span>
                  {tierBadge}
                </span>
                <span className={metaSep} aria-hidden>
                  |
                </span>
                <span
                  className="shrink-0 font-semibold text-orange"
                  aria-current="page"
                >
                  Overview
                </span>
              </nav>
            )}
          </div>

          {trailing ? (
            <div className="flex shrink-0 items-center">{trailing}</div>
          ) : progressVisible ? (
            <div
              className="flex shrink-0 items-center gap-2 sm:gap-2.5"
              role="group"
              aria-label="Study progress"
            >
              <span
                className="inline-flex h-6 items-center gap-1 rounded-[0.25rem] bg-ink/[0.05] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight text-ink dark:bg-white/[0.08]"
                aria-label={`${streakDays} day streak`}
              >
                <Flame
                  className="size-3 shrink-0 text-orange"
                  strokeWidth={2.25}
                  aria-hidden
                />
                {streakDays}
              </span>
              <CourseChromeProgress percent={pct} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
