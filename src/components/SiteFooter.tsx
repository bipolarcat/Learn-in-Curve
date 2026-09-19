import Link from "next/link";

import { FooterFlickerBand } from "@/components/FooterFlickerBand";
import { Logo } from "@/components/Logo";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { NotifyMailboxMark } from "@/components/NotifyMailboxMark";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { APM_DISCLAIMER } from "@/lib/legal-copy";

/** ≥44px hit area on touch; visually compact from `sm` up. */
const socialChipClass =
  "inline-flex size-11 items-center justify-center rounded-lg text-cream/70 transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-cream/[0.08] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.96] sm:size-8";

const footerLinkClass =
  "inline-flex min-h-11 items-center rounded-md px-0.5 text-[13px] font-medium tracking-tight text-cream/70 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:min-h-8";

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
    <footer className="relative bg-ink pb-0 pt-5 text-cream sm:pt-6">
      <div className="wrap relative z-[1] pb-4 sm:pb-5">
        <div className="flex flex-col gap-3 sm:gap-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="brand flex shrink-0 items-center gap-2.5">
              <Logo alt="" />
              <span className="brand-name flex w-max flex-col font-display text-[0.78rem] font-bold leading-none tracking-[-0.02em]">
                <span className="whitespace-nowrap leading-none">Learn in</span>
                <span className="-mt-[0.08em] whitespace-nowrap text-[1.41em] leading-none tracking-[-0.03em] text-orange">
                  Curve
                </span>
              </span>
            </div>
            <div className="flex shrink-0 items-center">
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
            className="flex flex-wrap items-center gap-x-4 gap-y-0.5 sm:gap-x-5 lg:justify-end"
          >
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

        <section
          id="newsletter"
          aria-labelledby="footer-newsletter-heading"
          className="mt-3 flex flex-col gap-2 border-t border-cream/[0.08] pt-3 sm:mt-3.5 sm:flex-row sm:items-center sm:gap-3 sm:pt-3.5"
        >
          <div className="flex min-w-0 shrink-0 items-center gap-1.5">
            <div
              className="flex h-7 w-7 shrink-0 items-end justify-center"
              aria-hidden
            >
              <NotifyMailboxMark className="h-full w-full" />
            </div>
            <h2
              id="footer-newsletter-heading"
              className="min-w-0 text-balance font-display text-[0.9rem] font-semibold leading-none tracking-[-0.02em] text-cream sm:text-[0.95rem]"
            >
              Join our newsletter.
            </h2>
          </div>
          <div className="min-w-0 w-full sm:max-w-xs sm:flex-1 lg:max-w-sm">
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
