"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  stampCtaPrimaryCompact,
  stampCtaSecondaryCompact,
} from "@/components/stamp-chip";

const STORAGE_KEY = "lic_cookie_notice_v1";

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

/**
 * Sitewide cookie notice — paper card matching Notify / courses chrome.
 * Acknowledgement only while we ship strictly-necessary cookies (session).
 * Local preference stored; does not gate analytics (none live yet).
 */
export function CookieBanner() {
  const pathname = usePathname();
  const titleId = useId();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setVisible(false);
        return;
      }
    } catch {
      /* private mode — still show */
    }
    setVisible(true);
  }, []);

  // Don't stack the notice on the cookies legal page itself.
  if (!visible || pathname === "/cookies") return null;

  function acknowledge() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:justify-start sm:p-0"
    >
      <div
        className="pointer-events-auto w-full max-w-[min(100%,22.5rem)] origin-bottom motion-safe:animate-[cookie-banner-in_0.45s_var(--ease-out-quint)_both] rounded-2xl border border-black/[0.08] bg-paper p-4 text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_18px_48px_rgb(var(--ink-rgb)_/_0.18)] dark:border-white/[0.12] sm:p-5"
      >
        <div className="flex gap-3">
          <CookieMark className="mt-0.5 h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
          <div className="min-w-0 flex-1">
            {/*
              Named with a <p>, not a heading, on purpose.

              This is a floating role="dialog" that renders on every page. As an
              <h2> it inserted itself into each page's document outline, so a
              screen-reader user navigating by heading met "Cookies" as a
              top-level section of whatever they were reading — and every page's
              heading structure gained a section that is not part of the page.

              `aria-labelledby` accepts any element, so the dialog keeps exactly
              the same accessible name without the outline side effect. Styling
              is utility classes rather than tag-derived, so this looks
              identical.
            */}
            <p
              id={titleId}
              className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-balance text-ink"
            >
              Cookies
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-pretty text-ink/75">
              We use a strictly necessary session cookie to keep you signed in.
              No ads or analytics cookies today.{" "}
              <Link
                href="/cookies"
                className="font-semibold text-teal underline decoration-teal/35 underline-offset-2 transition-colors hover:text-teal-deep hover:decoration-teal"
              >
                Cookie notice
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={acknowledge}
            className={`${stampCtaPrimaryCompact} justify-center`}
          >
            Got it
          </button>
          <Link
            href="/cookies"
            className={`${stampCtaSecondaryCompact} justify-center`}
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
