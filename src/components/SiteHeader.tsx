"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteHeaderControls } from "@/components/SiteHeaderControls";
import { COURSE_STATIC } from "@/lib/courses/registry-data";
import type { CourseSlug } from "@/lib/courses/types";
import { isPmqStudySurface } from "@/lib/pmq/constants";
import { isPfqStudySurface } from "@/lib/pfq/constants";
import type { HeaderAccount } from "@/components/SiteHeaderMenu";
import type { PmqTier } from "@/lib/pmq/tiers";
import type { PfqTier } from "@/lib/pfq/tiers";

type PaidTier = PmqTier | PfqTier;

type SiteHeaderProps = {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
  /**
   * When true (default), bar is fixed to the viewport.
   * When false, bar floats in document flow and scrolls away.
   * Always unpinned on PMQ/PFQ overview + study pages.
   */
  pinned?: boolean;
  /** Per-course paid tier — drives the Pro / AI Pro mark beside the course name. */
  courseTiers?: Partial<Record<CourseSlug, PaidTier>>;
};

/** Same chrome marks as CourseHeader (beside course name). */
const proMark =
  "inline-flex h-[1.125rem] shrink-0 items-center rounded-[0.25rem] bg-teal/[0.12] px-1 text-[10px] font-semibold tracking-tight text-teal dark:bg-teal/[0.2] dark:text-teal";

const aiProMark =
  "inline-flex h-[1.125rem] shrink-0 items-center rounded-[0.25rem] bg-[color-mix(in_srgb,var(--gold)_32%,rgb(var(--paper-rgb)))] px-1 text-[10px] font-semibold tracking-tight text-[color-mix(in_srgb,var(--gold)_55%,#241a12)]";

function courseContextFromPath(
  pathname: string | null | undefined,
): { slug: CourseSlug; displayName: string } | null {
  if (!pathname?.startsWith("/courses/")) return null;
  const parts = pathname.split("/").filter(Boolean);
  // courses / {slug} / … — overview is exactly two segments
  if (parts.length < 3) return null;

  const slug = parts[1] as CourseSlug;
  const product = COURSE_STATIC[slug];
  if (!product) return null;

  const section = parts[2];
  // LO study surfaces
  if (section === "lo") return { slug, displayName: product.displayName };
  // PFQ objective lessons live under /learn/{n}
  if (section === "learn" && parts.length >= 4) {
    return { slug, displayName: product.displayName };
  }
  // Mock exams
  if (section === "mock") return { slug, displayName: product.displayName };

  return null;
}

function TierMark({ tier }: { tier: PaidTier | undefined }) {
  if (tier === "ai_pro") {
    return (
      <span className={aiProMark} aria-label="AI Pro unlocked">
        AI Pro
      </span>
    );
  }
  if (tier === "pro") {
    return (
      <span className={proMark} aria-label="Pro unlocked">
        Pro
      </span>
    );
  }
  return null;
}

export function SiteHeader({
  isSignedIn = false,
  account = null,
  pinned = true,
  courseTiers,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isPinned =
    pinned && !isPmqStudySurface(pathname) && !isPfqStudySurface(pathname);
  const course = courseContextFromPath(pathname);
  const tier = course ? courseTiers?.[course.slug] : undefined;

  const nav = (
    <nav
      className="site-header pointer-events-auto flex h-12 w-full max-w-wrap items-center justify-between gap-2.5 rounded-xl border border-black/[0.08] bg-paper/90 px-2.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:h-14 sm:gap-3.5 sm:px-3.5 dark:border-white/[0.12]"
      aria-label="Primary"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
        <Link
          href="/"
          className="brand flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-lg motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:gap-2.5"
        >
          <Logo priority className="h-7 w-7 sm:h-9 sm:w-9" alt="Learn in Curve" />
          <span className="brand-name flex w-max flex-col font-display text-[clamp(0.68rem,1.3vw,0.8rem)] font-bold leading-none tracking-[-0.02em]">
            <span className="whitespace-nowrap leading-none">Learn in</span>
            <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
              Curve
            </span>
          </span>
        </Link>

        {course ? (
          <>
            <span
              className="h-6 w-[1.5px] shrink-0 self-center rounded-full bg-ink/35 sm:h-7"
              aria-hidden
            />
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="min-w-0 truncate font-body text-[13px] font-extralight leading-none tracking-tight text-ink/75 sm:text-[14px]">
                {course.displayName}
              </span>
              <TierMark tier={tier} />
            </span>
          </>
        ) : null}
      </div>

      <SiteHeaderControls isSignedIn={isSignedIn} account={account} />
    </nav>
  );

  if (isPinned) {
    return (
      <>
        <div className="h-[4.25rem] shrink-0 sm:h-[4.75rem]" aria-hidden />
        <div className="site-header-shell pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
          {nav}
        </div>
      </>
    );
  }

  return (
    <div className="site-header-shell pointer-events-none relative z-30 flex shrink-0 justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      {nav}
    </div>
  );
}
