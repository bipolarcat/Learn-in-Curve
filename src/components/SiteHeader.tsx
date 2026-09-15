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

type SiteHeaderProps = {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
  /**
   * When true (default), bar is fixed to the viewport.
   * When false, bar floats in document flow and scrolls away.
   * Always unpinned on PMQ/PFQ overview + study pages.
   */
  pinned?: boolean;
};

function courseDisplayNameFromPath(
  pathname: string | null | undefined,
): string | null {
  if (!pathname?.startsWith("/courses/")) return null;
  const parts = pathname.split("/").filter(Boolean);
  // courses / {slug} / … — overview is exactly two segments
  if (parts.length < 3) return null;

  const slug = parts[1];
  const product = COURSE_STATIC[slug as CourseSlug];
  if (!product) return null;

  const section = parts[2];
  // LO study surfaces
  if (section === "lo") return product.displayName;
  // PFQ objective lessons live under /learn/{n}
  if (section === "learn" && parts.length >= 4) return product.displayName;
  // Mock exams
  if (section === "mock") return product.displayName;

  return null;
}

export function SiteHeader({
  isSignedIn = false,
  account = null,
  pinned = true,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isPinned =
    pinned && !isPmqStudySurface(pathname) && !isPfqStudySurface(pathname);
  const courseName = courseDisplayNameFromPath(pathname);

  const nav = (
    <nav
      className="site-header pointer-events-auto flex h-12 w-full max-w-wrap items-center justify-between gap-2.5 rounded-xl border border-black/[0.08] bg-paper/90 px-2.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:h-14 sm:gap-3.5 sm:px-3.5 dark:border-white/[0.12]"
      aria-label="Primary"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
        <Link
          href="/"
          className="brand flex min-w-0 shrink-0 items-center gap-2 rounded-lg motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:gap-2.5"
        >
          <Logo priority className="h-7 w-7 sm:h-9 sm:w-9" alt="" />
          <span className="brand-name flex w-max flex-col font-display text-[clamp(0.68rem,1.3vw,0.8rem)] font-bold leading-none tracking-[-0.02em]">
            <span className="whitespace-nowrap leading-none">Learn in</span>
            <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
              Curve
            </span>
          </span>
        </Link>

        {courseName ? (
          <>
            <span
              className="h-6 w-[1.5px] shrink-0 self-center rounded-full bg-ink/35 sm:h-7"
              aria-hidden
            />
            <span className="min-w-0 truncate font-body text-[13px] font-extralight leading-none tracking-tight text-ink/75 sm:text-[14px]">
              {courseName}
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
