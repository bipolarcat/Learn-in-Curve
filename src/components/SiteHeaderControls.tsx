"use client";

import {
  useEffect,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { SignOutButton } from "@/components/SignOutButton";
import { hasCreatedAccount } from "@/lib/auth-hints";
import { isPmqStudySurface } from "@/lib/pmq/constants";
import { allowsDarkMode } from "@/lib/theme-routes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { trackCtaClicked } from "@/lib/analytics/events";
import {
  headerIconPrimary,
  headerIconQuiet,
  headerIconTeal,
  headerPillPrimary,
  headerPillSecondary,
} from "@/components/header-control";

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

/** Smaller glyph when a control explicitly opts into compact sizing. */
const compactIconClass =
  "header-icon h-3.5 w-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-quint)]";

function HomeIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={compact ? 1.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`${compact ? compactIconClass : iconClass} group-hover:-translate-y-0.5`}
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function BoardIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={compact ? 1.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={
        compact
          ? compactIconClass
          : `${iconClass} group-hover:rotate-[-6deg]`
      }
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  );
}

/** Soft-nav header control — ellipsis while the destination is pending. */
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

/** Orange dashboard control — ellipsis spinner while soft-nav is pending. */
function DashboardNavButton() {
  return (
    <HeaderNavButton
      href="/dashboard"
      className={headerIconPrimary}
      ariaLabel="Dashboard"
      title="Dashboard"
      busyLabel="Opening dashboard"
      spinnerClassName="text-paper"
    >
      <BoardIcon />
    </HeaderNavButton>
  );
}

/** Ticket / destination board for Courses */
function CoursesIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={compact ? 1.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`${compact ? compactIconClass : iconClass} group-hover:translate-x-0.5`}
    >
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M8 5v14M12 9.5h4M12 13h3" />
    </svg>
  );
}

function SignOutIcon({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? compactIconClass : iconClass;
  const doorMotion =
    "motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-reduce:transition-none";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={compact ? 1.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`${sizeClass} overflow-visible`}
    >
      {/* Open door — idle / hover */}
      <path
        d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2"
        className={cn(doorMotion, "group-[.is-signing-out]:opacity-0")}
      />
      {/* Closed door — full left edge + solid fill after click */}
      <path
        d="M12 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="currentColor"
        stroke="currentColor"
        className={cn(doorMotion, "opacity-0 group-[.is-signing-out]:opacity-100")}
      />
      {/* Arrow: slight left on hover; snaps fully off-left on click */}
      <g
        className={cn(
          "origin-center motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "motion-safe:group-hover:-translate-x-0.5",
          "motion-safe:group-[.is-signing-out]:-translate-x-[20px]",
        )}
      >
        <path d="M15 12H3M6 9l-3 3 3 3" />
      </g>
    </svg>
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

/** Landing-only: Courses pops in once the brand hero has scrolled out of view. */
function CoursesReveal({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.span
          key="header-courses"
          className="inline-flex origin-top"
          initial={
            reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.86, y: -10 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.92, y: -6 }
          }
          transition={{
            duration: reduceMotion ? 0.12 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

type SiteHeaderControlsProps = {
  isSignedIn?: boolean;
};

/**
 * Site chrome:
 * - Guests: labeled Courses on all sizes (prompt to browse); Get Started / Sign in
 *   labeled at all sizes. Off-home: icon-only Home (space reserved for Courses prompt).
 *   Also show labeled Courses on PMQ preview, About, Careers, Privacy, Terms.
 * - Dark toggle: dashboard, PMQ overview and individual LOs only
 * - Auth pages (`/auth/*`) and PMQ preview: Home icon + labeled Courses
 *   only — no Sign in/up CTA (auth form is already on the page)
 * - Signed in: same h-8 icon discs as guest chrome + Courses↔Home swap
 * - Landing (`/`): Courses appears only after scrolling past `#home-brand-hero`
 */
export function SiteHeaderControls({
  isSignedIn = false,
}: SiteHeaderControlsProps) {
  const pathname = usePathname();
  const [guestCta, setGuestCta] = useState<GuestCta>({
    href: "/auth/sign-up",
    label: "Get Started",
  });
  const [pastHomeHero, setPastHomeHero] = useState(false);

  useEffect(() => {
    setGuestCta(resolveGuestCta());
  }, []);

  const onDashboard = pathname === "/dashboard";
  const onHome = pathname === "/";
  const onFreeMock = pathname === "/free-mock-exam";
  const onPmqPreview = pathname === "/courses/pmq-in-5-days/preview";
  const showGuestCoursesPill =
    onPmqPreview ||
    pathname === "/about" ||
    pathname === "/careers" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    onFreeMock;
  const hideHomeIconOnCourseExperience = isPmqStudySurface(pathname);
  /** Auth + preview keep chrome minimal — no theme toggle / no auth CTA. */
  const hideGuestAuthCta =
    (pathname?.startsWith("/auth") ?? false) || onPmqPreview;
  const darkModeAllowed = allowsDarkMode(pathname);

  useEffect(() => {
    if (!onHome) {
      setPastHomeHero(false);
      return;
    }

    const hero = document.getElementById("home-brand-hero");
    if (!hero) {
      setPastHomeHero(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal Courses once the brand hero has left the viewport.
        setPastHomeHero(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        // Trigger a touch early so the chip is ready as the hero clears the fold.
        rootMargin: "-8% 0px 0px 0px",
      },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [onHome]);

  const showLandingCourses = onHome && pastHomeHero;

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 sm:gap-2"
      role="group"
      aria-label="Site controls"
    >
      {isSignedIn ? (
        <>
          {darkModeAllowed && (
            <HeaderChip style={{ "--i": 0 } as CSSProperties}>
              <ThemeToggle />
            </HeaderChip>
          )}

          {!onDashboard ? (
            <HeaderChip style={{ "--i": 1 } as CSSProperties}>
              <DashboardNavButton />
            </HeaderChip>
          ) : null}

          {!onFreeMock ? (
            <HeaderChip style={{ "--i": 1.5 } as CSSProperties}>
              <HeaderNavButton
                href="/free-mock-exam"
                className={headerPillSecondary}
                ariaLabel="Free mock exam"
                title="Free mock exam"
                busyLabel="Opening free mock"
              >
                <span>Free mock</span>
              </HeaderNavButton>
            </HeaderChip>
          ) : null}

          {!onDashboard && !hideHomeIconOnCourseExperience ? (
            onHome ? (
              <CoursesReveal show={showLandingCourses}>
                <HeaderNavButton
                  href="/courses"
                  className={headerIconTeal}
                  ariaLabel="Courses"
                  title="Courses"
                  busyLabel="Opening courses"
                  spinnerClassName="text-paper"
                >
                  <CoursesIcon />
                </HeaderNavButton>
              </CoursesReveal>
            ) : (
              <HeaderChip
                style={{ "--i": onDashboard ? 1 : 2 } as CSSProperties}
              >
                <HeaderNavButton
                  href="/"
                  className={headerIconQuiet}
                  ariaLabel="Home"
                  title="Home"
                  busyLabel="Opening home"
                >
                  <HomeIcon />
                </HeaderNavButton>
              </HeaderChip>
            )
          ) : null}

          <HeaderChip style={{ "--i": onDashboard ? 2 : 3 } as CSSProperties}>
            <SignOutButton
              aria-label="Sign out"
              title="Sign out"
              className={headerIconQuiet}
            >
              <SignOutIcon />
            </SignOutButton>
          </HeaderChip>
        </>
      ) : hideGuestAuthCta ? (
        <>
          <HeaderChip style={{ "--i": 0 } as CSSProperties}>
            <HeaderNavButton
              href="/courses"
              className={headerPillSecondary}
              ariaLabel="Courses"
              busyLabel="Opening courses"
            >
              <CoursesIcon />
              <span>Courses</span>
            </HeaderNavButton>
          </HeaderChip>

          <HeaderChip style={{ "--i": 1 } as CSSProperties}>
            <HeaderNavButton
              href="/"
              className={headerIconPrimary}
              ariaLabel="Home"
              title="Home"
              busyLabel="Opening home"
              spinnerClassName="text-paper"
            >
              <HomeIcon />
            </HeaderNavButton>
          </HeaderChip>
        </>
      ) : (
        <>
          {darkModeAllowed && (
            <HeaderChip style={{ "--i": 0 } as CSSProperties}>
              <ThemeToggle />
            </HeaderChip>
          )}

          {showGuestCoursesPill ? (
            <HeaderChip style={{ "--i": 1 } as CSSProperties}>
              <HeaderNavButton
                href="/courses"
                className={headerPillSecondary}
                ariaLabel="Courses"
                busyLabel="Opening courses"
              >
                <CoursesIcon />
                <span>Courses</span>
              </HeaderNavButton>
            </HeaderChip>
          ) : null}

          {!onFreeMock ? (
            <HeaderChip
              style={
                {
                  "--i": showGuestCoursesPill ? 1.5 : 1,
                } as CSSProperties
              }
            >
              <HeaderNavButton
                href="/free-mock-exam"
                className={headerPillSecondary}
                ariaLabel="Free mock exam"
                title="Free mock exam"
                busyLabel="Opening free mock"
              >
                <span>Free mock</span>
              </HeaderNavButton>
            </HeaderChip>
          ) : null}

          {!onDashboard && !hideHomeIconOnCourseExperience ? (
            onHome ? (
              <CoursesReveal show={showLandingCourses}>
                <HeaderNavButton
                  href="/courses"
                  className={headerPillSecondary}
                  ariaLabel="Courses"
                  busyLabel="Opening courses"
                  analyticsLocation="header"
                  analyticsVariant="Courses"
                >
                  <CoursesIcon />
                  <span>Courses</span>
                </HeaderNavButton>
              </CoursesReveal>
            ) : (
              <HeaderChip
                style={
                  { "--i": showGuestCoursesPill ? 2 : 1 } as CSSProperties
                }
              >
                <HeaderNavButton
                  href="/"
                  className={headerIconQuiet}
                  ariaLabel="Home"
                  title="Home"
                  busyLabel="Opening home"
                >
                  <HomeIcon />
                </HeaderNavButton>
              </HeaderChip>
            )
          ) : null}

          <HeaderChip
            style={
              { "--i": showGuestCoursesPill ? 3 : 2 } as CSSProperties
            }
          >
            <HeaderNavButton
              href={guestCta.href}
              className={headerPillPrimary}
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
        </>
      )}
    </div>
  );
}
