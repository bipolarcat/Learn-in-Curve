"use client";

import {
  useEffect,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { hasCreatedAccount } from "@/lib/auth-hints";
import { isPmqStudySurface } from "@/lib/pmq/constants";
import { allowsDarkMode } from "@/lib/theme-routes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import {
  headerIconPrimary,
  headerIconQuiet,
  headerPillTeal,
} from "@/components/header-control";
import { SiteHeaderMenu } from "@/components/SiteHeaderMenu";

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

function HomeIcon({ busy = false }: { busy?: boolean }) {
  const reduceMotion = useReducedMotion();
  const looping = busy && !reduceMotion;
  const loop = {
    duration: 0.7,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const settle = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={iconClass}
    >
      {/* Stroke draw while navigating — same pathLength morph as 21st.dev
          animated-state-icons SuccessIcon (demo 10058), on the house glyph. */}
      <motion.path
        d="M3 10.5 12 3l9 7.5"
        initial={false}
        animate={
          looping
            ? { pathLength: [0.2, 1], opacity: [0.4, 1] }
            : { pathLength: 1, opacity: 1 }
        }
        transition={looping ? loop : settle}
      />
      <motion.path
        d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
        initial={false}
        animate={
          looping
            ? { pathLength: [0.25, 1], opacity: [0.4, 1] }
            : { pathLength: 1, opacity: 1 }
        }
        transition={
          looping ? { ...loop, delay: 0.08 } : settle
        }
      />
    </svg>
  );
}

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
      className={`${className} disabled:cursor-wait disabled:opacity-90`}
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

/** Home — house glyph redraws while the route is pending (no ellipsis). */
function HomeNavButton({ className }: { className: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening home" : "Home"}
      title="Home"
      className={`${className} disabled:cursor-wait`}
      onClick={() => {
        startTransition(() => {
          router.push("/");
        });
      }}
    >
      <HomeIcon busy={pending} />
    </button>
  );
}

/** Person for Sign up / Sign in */
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

type GuestCta = {
  href: string;
  label: string;
};

function resolveGuestCta(): GuestCta {
  if (hasCreatedAccount()) {
    return { href: "/auth/sign-in", label: "Sign in" };
  }
  return { href: "/auth/sign-up", label: "Get Started" };
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
};

/**
 * Site chrome:
 * Overflow menu holds Explore Courses, site links, and (when signed in)
 * My dashboard plus Sign me out.
 * Guests: Get Started / Sign in labeled at all sizes; off-home icon-only Home.
 * Dark toggle: dashboard, PMQ overview and individual LOs only.
 * Auth pages (`/auth/*`) and PMQ preview: Home only, no Sign in/up CTA.
 */
export function SiteHeaderControls({
  isSignedIn = false,
}: SiteHeaderControlsProps) {
  const pathname = usePathname();
  const [guestCta, setGuestCta] = useState<GuestCta>({
    href: "/auth/sign-up",
    label: "Get Started",
  });

  useEffect(() => {
    setGuestCta(resolveGuestCta());
  }, []);

  const onDashboard = pathname === "/dashboard";
  const onHome = pathname === "/";
  const onPmqPreview = pathname === "/courses/pmq-in-5-days/preview";
  const onPfqPreview = pathname === "/pfq/preview";
  const hideHomeIconOnCourseExperience = isPmqStudySurface(pathname);
  /** Auth + preview keep chrome minimal — no theme toggle / no auth CTA. */
  const hideGuestAuthCta =
    (pathname?.startsWith("/auth") ?? false) || onPmqPreview || onPfqPreview;
  const darkModeAllowed = allowsDarkMode(pathname);
  const showHome =
    !onHome && !onDashboard && !hideHomeIconOnCourseExperience;

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 sm:gap-2"
      role="group"
      aria-label="Site controls"
    >
      {isSignedIn ? (
        <>
          {darkModeAllowed && (
            <HeaderChip style={{ "--i": 1 } as CSSProperties}>
              <ThemeToggle />
            </HeaderChip>
          )}

          {showHome ? (
            <HeaderChip style={{ "--i": 2 } as CSSProperties}>
              <HomeNavButton className={headerIconQuiet} />
            </HeaderChip>
          ) : null}
        </>
      ) : hideGuestAuthCta ? (
        <HeaderChip style={{ "--i": 1 } as CSSProperties}>
          <HomeNavButton className={headerIconPrimary} />
        </HeaderChip>
      ) : (
        <>
          {darkModeAllowed && (
            <HeaderChip style={{ "--i": 1 } as CSSProperties}>
              <ThemeToggle />
            </HeaderChip>
          )}

          <HeaderChip style={{ "--i": 2 } as CSSProperties}>
            <HeaderNavButton
              href={guestCta.href}
              className={headerPillTeal}
              ariaLabel={guestCta.label}
              title={guestCta.label}
              busyLabel={
                guestCta.label === "Sign in"
                  ? "Opening sign in"
                  : "Opening sign up"
              }
              spinnerClassName="text-paper"
              analyticsLocation="header"
              analyticsVariant={guestCta.label}
            >
              <AuthIcon />
              <span>{guestCta.label}</span>
            </HeaderNavButton>
          </HeaderChip>

          {showHome ? (
            <HeaderChip style={{ "--i": 3 } as CSSProperties}>
              <HomeNavButton className={headerIconQuiet} />
            </HeaderChip>
          ) : null}
        </>
      )}

      <HeaderChip style={{ "--i": 5 } as CSSProperties}>
        <SiteHeaderMenu isSignedIn={isSignedIn} />
      </HeaderChip>
    </div>
  );
}
