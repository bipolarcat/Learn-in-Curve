"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import {
  CONSENT_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/analytics/consent";

/** Flat cookie mark — same stamp vocabulary as Notify mailbox / course chrome. */
function CookieMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="#E8CE93"
        stroke="#241A12"
        strokeWidth="2.5"
      />
      <circle cx="16" cy="18" r="2.4" fill="#241A12" />
      <circle cx="26" cy="15" r="1.8" fill="#241A12" />
      <circle cx="31" cy="23" r="2.2" fill="#241A12" />
      <circle cx="18" cy="28" r="1.7" fill="#241A12" />
      <circle cx="27" cy="31" r="2.5" fill="#D5501F" />
    </svg>
  );
}

/** Invisible 44px hit target on controls that are visually smaller. */
const HIT =
  'relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-full after:min-w-[44px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-[""]';

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/**
 * Sitewide cookie consent: a compact pill in the bottom-left corner.
 *
 * This is a real consent gate, not an acknowledgement. PostHog analytics and
 * session replay are non-essential cookies, so under UK PECR reg 6 they cannot
 * load until the visitor actively accepts. Two rules follow, and neither is
 * cosmetic:
 *
 *   1. Reject is the same size and weight as Accept. Demoting it to a text
 *      link, or hiding it behind the details chevron while Accept stays in
 *      view, is the dark pattern the regulation exists to stop.
 *   2. Dismissing or ignoring the pill is NOT consent. There is no close
 *      button, because a close button invites "closed it, must be fine".
 *
 * Shape: the previous version was a 22.5rem card that went full-width along the
 * bottom edge on mobile, so it covered the page and had to be suppressed on
 * /auth and /free-mock-exam to keep those flows usable. Suppressing a consent
 * prompt to make room for the page is the wrong trade, so this is small enough
 * not to need it. The only route it still hides on is /cookies, where it would
 * cover the "Change cookie settings" button that the Cookie Notice tells people
 * to use.
 *
 * After a choice the pill disappears entirely and nothing is left in the
 * corner. Withdrawal lives on /cookies (linked from the footer), which calls
 * resetConsent() and brings this back via CONSENT_EVENT.
 *
 * The choice is read by src/lib/analytics/consent.ts, which PostHogProvider
 * watches. Until "granted", no analytics script is even downloaded.
 */
export function CookieBanner() {
  const pathname = usePathname();
  const panelId = useId();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read after mount: localStorage during render would break hydration.
  useEffect(() => {
    setVisible(readConsent() === "unset");
  }, []);

  // resetConsent() on /cookies dispatches this, so the pill returns without a reload.
  useEffect(() => {
    function onConsentChange() {
      const next = readConsent() === "unset";
      setVisible(next);
      if (next) {
        setLeaving(false);
        setOpen(false);
      }
    }
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  // Layout persists across soft navigation, so re-check on route change.
  useEffect(() => {
    if (readConsent() !== "unset") setVisible(false);
  }, [pathname]);

  // Escape closes the details panel only. It must never dismiss the pill:
  // dismissal is not a decision, and the choice still has to be made.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  const choose = useCallback((state: "granted" | "denied") => {
    writeConsent(state);
    setOpen(false);
    setLeaving(true);
    exitTimer.current = setTimeout(() => setVisible(false), 200);
  }, []);

  if (!visible || pathname === "/cookies") return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={`pointer-events-none fixed bottom-4 left-4 z-[60] max-w-[calc(100vw-2rem)] ${
        leaving
          ? "motion-safe:animate-[cookie-pill-out_0.2s_var(--ease-out-quint)_both]"
          : "motion-safe:animate-[cookie-banner-in_0.45s_var(--ease-out-quint)_both]"
      }`}
    >
      {open ? (
        <div
          id={panelId}
          className="pointer-events-auto mb-2 w-[22.5rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/[0.08] bg-paper p-5 text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_18px_48px_rgb(var(--ink-rgb)_/_0.18)] motion-safe:animate-[cookie-panel-in_0.22s_var(--ease-out-quint)_both] dark:border-white/[0.12]"
        >
          <h2 className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-ink">
            What we use cookies for
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
            We use one strictly necessary cookie to keep you signed in. We’d also
            like analytics cookies to see which lessons work and where people get
            stuck. No ads, ever.
          </p>
          <div className="mt-4 flex items-center gap-5">
            <Link
              href="/cookies"
              className="text-[13px] font-semibold text-teal underline decoration-teal/35 underline-offset-4 transition-colors hover:text-teal-deep hover:decoration-teal"
            >
              Cookie notice
            </Link>
            <Link
              href="/privacy"
              className="text-[13px] font-semibold text-teal underline decoration-teal/35 underline-offset-4 transition-colors hover:text-teal-deep hover:decoration-teal"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto inline-flex flex-wrap items-center gap-2 rounded-[1.75rem] border border-black/[0.08] bg-paper p-1 pl-2.5 text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_18px_48px_rgb(var(--ink-rgb)_/_0.18)] sm:rounded-full dark:border-white/[0.12]">
        <span className="flex items-center gap-2">
          <CookieMark className="h-6 w-6 shrink-0" />
          <span className="whitespace-nowrap text-[13.5px] font-semibold">
            Cookies
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          {/* Equal width and height on both, deliberately. See the note above. */}
          <button
            type="button"
            onClick={() => choose("granted")}
            className={`${HIT} ${FOCUS} h-9 w-[86px] rounded-full bg-orange text-[13px] font-semibold text-paper transition-colors hover:bg-orange-dark`}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className={`${HIT} ${FOCUS} h-9 w-[86px] rounded-full border border-ink/25 text-[13px] font-semibold text-ink transition-colors hover:border-ink/50 hover:bg-ink/[0.05]`}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-label={open ? "Hide cookie details" : "Show cookie details"}
            className={`${HIT} ${FOCUS} flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.08] text-ink transition-colors hover:bg-ink/[0.06] dark:border-white/[0.12]`}
          >
            <ChevronUp
              className={`h-4 w-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
        </span>
      </div>
    </div>
  );
}
