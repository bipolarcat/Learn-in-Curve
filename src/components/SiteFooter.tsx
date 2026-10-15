import Link from "next/link";

import { FooterFlickerBand } from "@/components/FooterFlickerBand";
import { Logo } from "@/components/Logo";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NotifyMailboxMark } from "@/components/NotifyMailboxMark";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { APM_DISCLAIMER } from "@/lib/legal-copy";

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialChipClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center text-cream/55 transition-[color,transform] duration-150 ease-[var(--ease-out-quint)] hover:text-[var(--orange-on-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-on-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.96]";

const footerLinkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2.5 text-[13px] font-medium tracking-tight text-cream/70 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-[var(--orange-on-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-on-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

/**
 * Crawlable site map in the footer (SEO audit, 2026-10-15).
 *
 * Why this exists: the header menu only renders its links after a click, so in
 * the server HTML Google sees the logo, About and the legal pages and nothing
 * else. Search Console showed 22 URLs "Discovered, not indexed" and the Library
 * had no incoming link from the homepage at all. Real <a href> links here put
 * every money page and the main guides one hop from every page on the site.
 *
 * Keep these as plain hardcoded paths: this component ships in the client
 * bundle (ConditionalSiteFooter is a client component), so importing the
 * library content index here would pull every article into the bundle.
 * If a slug changes, update it here too.
 */
const footerGroups: {
  heading: { href: string; label: string };
  links: { href: string; label: string }[];
}[] = [
  {
    heading: { href: "/courses", label: "All Courses" },
    links: [
      { href: "/courses/pmq-in-5-days/pricing", label: "APM PMQ in 5 Days" },
      { href: "/courses/pfq-in-2-days/pricing", label: "PFQ in 2 Days" },
    ],
  },
  {
    heading: { href: "/mock-me", label: "Mock Me" },
    links: [
      { href: "/free-mock-exam/apm-pmq", label: "Free APM PMQ mock exam" },
      { href: "/free-mock-exam/apm-pfq", label: "Free APM PFQ mock exam" },
      { href: "/free-mock-exam/pmp", label: "Free PMP readiness check" },
    ],
  },
  {
    heading: { href: "/library", label: "The Library" },
    links: [
      { href: "/library/how-hard-is-apm-pmq", label: "How hard is the APM PMQ?" },
      { href: "/library/apm-pmq-pass-mark", label: "APM PMQ pass mark" },
      { href: "/library/apm-pmq-exam-format", label: "APM PMQ exam format" },
      { href: "/library/apm-pmq-vs-pfq", label: "APM PMQ vs PFQ" },
    ],
  },
];

const footerGroupHeadingClass =
  "mb-1 inline-flex min-h-9 items-center text-[13px] font-semibold leading-snug tracking-tight text-[var(--orange-on-ink)] transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-on-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const footerGroupLinkClass =
  "inline-flex min-h-9 items-center text-[13px] leading-snug tracking-tight text-cream/70 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-[var(--orange-on-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-on-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

/**
 * Full-bleed ink footer — compact brand/social + links row, then newsletter.
 *
 * Course disclaimer is opt-in via `showApmDisclaimer` (LIC-48), wording via
 * `APM_DISCLAIMER`. Enabled on PMQ overview and PFQ learn overview through
 * `CoursesSiteFooter`. Do not delete the render path — gate it, don't remove it.
 */
export function SiteFooter({
  showApmDisclaimer = false,
}: {
  showApmDisclaimer?: boolean;
} = {}) {
  return (
    <footer className="site-footer relative overflow-hidden bg-ink pb-0 pt-5 text-cream sm:pt-6">
      <div className="wrap relative z-[1] pb-4 sm:pb-5">
        <div className="flex flex-col gap-3 sm:gap-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand flex shrink-0 items-center gap-2.5">
              <Logo alt="" />
              <span className="brand-name flex w-max flex-col font-display text-[0.78rem] font-bold leading-none tracking-[-0.02em]">
                <span className="whitespace-nowrap leading-none">Learn in</span>
                <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-[var(--orange-on-ink)]">
                  Curve
                </span>
              </span>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-2.5 lg:ml-0">
              <a
                href="https://www.instagram.com/learn.in.curve/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialChipClass}
                aria-label="Learn in Curve on Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/learn-in-curve/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialChipClass}
                aria-label="Learn in Curve on LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-1 sm:justify-end sm:gap-x-5 lg:w-auto lg:justify-end"
          >
            <Link href="/about" className={footerLinkClass}>
              About
            </Link>
            <Link href="/contact" className={footerLinkClass}>
              Contact
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
            <Link href="/terms" className={footerLinkClass}>
              Terms
            </Link>
            <Link href="/cookies" className={footerLinkClass}>
              Cookies
            </Link>
            <SendFeedbackButton
              source="Footer"
              className={`${footerLinkClass} text-left`}
            />
          </nav>
        </div>

        <nav
          aria-label="Site map"
          className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-cream/[0.08] pt-4 sm:grid-cols-3"
        >
          {footerGroups.map((group) => (
            <div key={group.heading.href} className="min-w-0">
              <Link href={group.heading.href} className={footerGroupHeadingClass}>
                {group.heading.label}
              </Link>
              <ul className="flex flex-col">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerGroupLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <section
          id="newsletter"
          aria-labelledby="footer-newsletter-heading"
          className="mt-3 flex flex-col gap-2 border-t border-cream/[0.08] pt-3 sm:mt-3.5 sm:ml-auto sm:max-w-sm sm:pt-3.5"
        >
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <div
              className="flex h-7 w-7 shrink-0 items-end justify-center"
              aria-hidden
            >
              <NotifyMailboxMark className="h-full w-full" />
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2
                id="footer-newsletter-heading"
                className="min-w-0 font-display text-[0.9rem] font-semibold leading-none tracking-[-0.02em] text-cream sm:text-[0.95rem]"
              >
                Join our{" "}
                <span className="text-[var(--orange-on-ink)]">newsletter</span>.
              </h2>
              <p className="shrink-0 text-[11px] leading-none tracking-tight text-cream/55">
                Unsubscribe anytime.{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 decoration-cream/30 transition-colors hover:text-cream hover:decoration-cream/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-on-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          <div className="min-w-0 w-full">
            <NewsletterSignup variant="footer" />
          </div>
        </section>

        {showApmDisclaimer ? (
          <p className="mt-4 max-w-[46rem] border-t border-cream/[0.08] pt-3.5 text-[11.5px] leading-snug tracking-tight text-cream/70">
            {APM_DISCLAIMER}
          </p>
        ) : null}
      </div>

      <FooterFlickerBand />
    </footer>
  );
}
