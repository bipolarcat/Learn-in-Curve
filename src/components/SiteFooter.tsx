import Link from "next/link";

import { FooterFlickerBand } from "@/components/FooterFlickerBand";
import { Logo } from "@/components/Logo";
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
  "inline-flex size-8 items-center justify-center rounded-lg text-cream/65 transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-cream/[0.08] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.96]";

const footerLinkClass =
  "inline-flex min-h-9 items-center rounded-md px-0.5 text-[13px] font-medium tracking-tight text-cream/70 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

/**
 * Full-bleed ink footer — quiet link strip + “Keep Learning” flicker band.
 *
 * APM disclaimer is opt-in (`showApmDisclaimer`) and currently only enabled
 * on the PMQ course overview via `CoursesSiteFooter` (LIC-48 surface).
 * Wording is pinned to legal/TERMS_OF_SERVICE.md §2 via `APM_DISCLAIMER`.
 * Do not delete the constant or this render path — gate it, don't remove it.
 */
export function SiteFooter({
  showApmDisclaimer = false,
}: {
  showApmDisclaimer?: boolean;
} = {}) {
  return (
    <footer className="relative bg-ink pb-0 pt-7 text-cream sm:pt-9">
      <div className="wrap relative z-[1] pb-5 sm:pb-6">
        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="flex shrink-0 items-start justify-between gap-4 lg:block">
            <div>
              <div className="brand mb-1 flex items-center gap-2.5">
                <Logo alt="" />
                <span className="brand-name flex w-max flex-col font-display text-[0.78rem] font-bold leading-none tracking-[-0.02em]">
                  <span className="whitespace-nowrap leading-none">
                    Learn in
                  </span>
                  <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
                    Curve
                  </span>
                </span>
              </div>
              <p className="max-w-[17rem] text-[12.5px] leading-snug tracking-tight text-cream/55">
                Master project Management &{" "}
                <span className="text-orange">AI</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 lg:mt-3.5">
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
            className="grid grid-cols-3 gap-x-3 gap-y-0.5 sm:gap-x-5 lg:flex lg:max-w-[36rem] lg:flex-wrap lg:justify-end lg:gap-x-5 lg:gap-y-1"
          >
            <Link href="/about" className={footerLinkClass}>
              About
            </Link>
            <Link href="/free-mock-exam" className={footerLinkClass}>
              Free mock exam
            </Link>
            <Link href="/contact" className={footerLinkClass}>
              Get in touch
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

        {showApmDisclaimer ? (
          <p className="mt-5 max-w-[46rem] border-t border-cream/[0.08] pt-4 text-[11.5px] leading-snug tracking-tight text-cream/45 sm:mt-6">
            {APM_DISCLAIMER}
          </p>
        ) : null}
      </div>

      <FooterFlickerBand />
    </footer>
  );
}
