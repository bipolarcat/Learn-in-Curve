"use client";

import {
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { allowsDarkMode } from "@/lib/theme-routes";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import { stampChipLabeledIdle } from "@/components/stamp-chip";
import { SiteHeaderMenu, type HeaderAccount } from "@/components/SiteHeaderMenu";

export {
  stampChipActive,
  stampChipBase,
  stampChipIdle,
  stampChipLabeled,
  stampChipLabeledIdle,
  stampChipLabeledPrimary,
  stampChipLabeledTeal,
  stampChipPrimary,
  stampChipTeal,
  stampCtaPrimary,
} from "@/components/stamp-chip";

const iconClass =
  "header-icon h-[17px] w-[17px] shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)]";

/** Soft-nav header control. Ellipsis while the destination is pending. */
function HeaderNavButton({
  href,
  className,
  children,
  ariaLabel,
  title,
  busyLabel,
  spinnerClassName = "text-current",
  analyticsLocation,
  analyticsVariant,
}: {
  href: string;
  className: string;
  children: ReactNode;
  ariaLabel: string;
  title?: string;
  busyLabel: string;
  spinnerClassName?: string;
  analyticsLocation?: string;
  analyticsVariant?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? busyLabel : ariaLabel}
      title={title ?? ariaLabel}
      className={`${className} disabled:opacity-90`}
      onClick={() => {
        if (analyticsLocation) {
          trackCtaClicked({
            variant: analyticsVariant ?? ariaLabel,
            location: analyticsLocation,
          });
        }
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {pending ? (
        <Spinner
          variant="ellipsis"
          size={16}
          className={spinnerClassName}
          aria-hidden
        />
      ) : (
        children
      )}
    </button>
  );
}

/** Person for Sign in */
function AuthIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`${iconClass} group-hover:scale-110`}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c1.2-3.2 3.5-4.8 6.5-4.8s5.3 1.6 6.5 4.8" />
    </svg>
  );
}

function HeaderChip({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className="site-header-chip motion-safe:animate-[header-chip-in_0.45s_var(--ease-out-quint)_both] inline-flex"
      style={style}
    >
      {children}
    </span>
  );
}

type SiteHeaderControlsProps = {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
};

/**
 * Site chrome:
 * Overflow menu holds site links (including Home Page). Signed-in: profile
 * summary, My dashboard, Sign out, and (on dark-capable routes) the theme toggle.
 * Guests: quiet outline “Sign in” → `/auth/sign-in` (sign-up is linked from that form).
 * Auth pages (`/auth/*`) and course previews: menu only, no Sign in CTA.
 */
export function SiteHeaderControls({
  isSignedIn = false,
  account = null,
}: SiteHeaderControlsProps) {
  const pathname = usePathname();

  const onPmqPreview = pathname === "/courses/pmq-in-5-days/preview";
  const onPfqPreview = pathname === "/courses/pfq-in-2-days/preview";
  /** Auth + preview keep chrome minimal — no theme toggle / no auth CTA. */
  const hideGuestAuthCta =
    (pathname?.startsWith("/auth") ?? false) || onPmqPreview || onPfqPreview;
  const darkModeAllowed = allowsDarkMode(pathname);

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 sm:gap-2"
      role="group"
      aria-label="Site controls"
    >
      {!isSignedIn && !hideGuestAuthCta ? (
        <HeaderChip style={{ "--i": 2 } as CSSProperties}>
          <HeaderNavButton
            href="/auth/sign-in"
            className={stampChipLabeledIdle}
            ariaLabel="Sign in"
            title="Sign in"
            busyLabel="Opening sign in"
            spinnerClassName="text-current"
            analyticsLocation="header"
            analyticsVariant="Sign in"
          >
            <AuthIcon />
            <span>Sign in</span>
          </HeaderNavButton>
        </HeaderChip>
      ) : null}

      <HeaderChip style={{ "--i": 5 } as CSSProperties}>
        <SiteHeaderMenu
          isSignedIn={isSignedIn}
          account={account}
          showThemeToggle={darkModeAllowed}
        />
      </HeaderChip>
    </div>
  );
}
