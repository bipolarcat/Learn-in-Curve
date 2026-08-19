"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteHeaderControls } from "@/components/SiteHeaderControls";
import { isPmqStudySurface } from "@/lib/pmq/constants";
import type { HeaderAccount } from "@/components/SiteHeaderMenu";

type SiteHeaderProps = {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
  /**
   * When true (default), bar is fixed to the viewport.
   * When false, bar floats in document flow and scrolls away.
   * Always unpinned on PMQ overview + LO pages (study surfaces).
   */
  pinned?: boolean;
};

export function SiteHeader({
  isSignedIn = false,
  account = null,
  pinned = true,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isPinned = pinned && !isPmqStudySurface(pathname);

  const nav = (
    <nav
      className="site-header pointer-events-auto flex h-12 w-full max-w-wrap items-center justify-between gap-2.5 rounded-xl border border-black/[0.08] bg-paper/90 px-2.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:h-14 sm:gap-3.5 sm:px-3.5 dark:border-white/[0.12]"
      aria-label="Primary"
    >
      <Link
        href="/"
        className="brand flex min-w-0 flex-1 items-center gap-2 rounded-lg motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)] motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:flex-initial sm:gap-2.5"
      >
        <Logo priority className="h-7 w-7 sm:h-9 sm:w-9" alt="" />
        <span className="brand-name flex w-max flex-col font-display text-[clamp(0.68rem,1.3vw,0.8rem)] font-bold leading-none tracking-[-0.02em]">
          <span className="whitespace-nowrap leading-none">Learn in</span>
          <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
            Curve
          </span>
        </span>
      </Link>

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
