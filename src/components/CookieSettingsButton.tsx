"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  readConsent,
  resetConsent,
  type ConsentState,
} from "@/lib/analytics/consent";

const LABEL: Record<ConsentState, string> = {
  granted: "Analytics are currently on.",
  denied: "Analytics are currently off.",
  unset: "You haven’t made a choice yet.",
};

/**
 * Consent withdrawal, on the Cookie Notice page.
 *
 * UK GDPR Art. 7(3) requires withdrawing consent to be as easy as giving it.
 * The Cookie Notice used to tell people to delete a localStorage key by hand,
 * which is not "as easy" by any reading. This clears the stored choice and
 * dispatches CONSENT_EVENT, which brings the consent pill straight back.
 *
 * It lives here rather than in the footer because the footer already links to
 * this page, and one button on one page is easier to keep honest than a control
 * duplicated site-wide. CookieBanner hides itself on /cookies so the pill can
 * never cover this button.
 */
export function CookieSettingsButton() {
  const [state, setState] = useState<ConsentState>("unset");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(readConsent());
    setMounted(true);
    function onChange() {
      setState(readConsent());
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return (
    <section className="mt-10 rounded-2xl border border-black/[0.08] bg-paper p-6 dark:border-white/[0.12]">
      <h2 className="font-display text-[1.15rem] font-bold tracking-[-0.03em] text-ink">
        Change your choice
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
        You can change your cookie choice at any time.{" "}
        {/* Rendered only after mount: it reads localStorage, which the server cannot see. */}
        {mounted ? LABEL[state] : null}
      </p>
      <button
        type="button"
        onClick={() => resetConsent()}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 px-5 text-[13px] font-semibold text-ink outline-none transition-colors hover:border-ink/50 hover:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        Change cookie settings
      </button>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink/60">
        This brings the cookie banner back so you can choose again. If you then
        select Reject, analytics are switched off and the PostHog identifier is
        cleared.
      </p>
    </section>
  );
}
