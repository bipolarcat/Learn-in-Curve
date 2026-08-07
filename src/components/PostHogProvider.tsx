"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  readConsent,
  type ConsentState,
} from "@/lib/analytics/consent";

/**
 * PostHog, gated behind cookie consent.
 *
 * Nothing here runs — no script, no cookie, no network call — until the visitor
 * has clicked Accept in the cookie banner. That ordering is the whole point:
 * PECR requires consent *before* a non-essential cookie is set, so the SDK is
 * dynamically imported rather than bundled into the initial load.
 *
 * If the user later rejects, we opt out and reset, which clears PostHog's
 * distinct_id so the next session isn't stitched to the old one.
 *
 * Env: NEXT_PUBLIC_POSTHOG_KEY is a *public, write-only* project token — it can
 * only send events, never read them, so shipping it to the browser is expected
 * and safe. NEXT_PUBLIC_POSTHOG_HOST must stay on the EU cloud
 * (https://eu.i.posthog.com); routing UK/EU users' behavioural data through the
 * US host would add an international-transfer question we don't currently have.
 */

type PostHogModule = typeof import("posthog-js")["default"];

let posthogInstance: PostHogModule | null = null;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const pathname = usePathname();
  const initialised = useRef(false);

  // Read stored consent after mount. Reading during render would touch
  // localStorage during SSR and mismatch on hydration.
  useEffect(() => {
    setConsent(readConsent());
    function onChange(event: Event) {
      setConsent((event as CustomEvent<ConsentState>).detail ?? readConsent());
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
    if (!key) return;

    if (consent === "granted" && !initialised.current) {
      initialised.current = true;
      void import("posthog-js").then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: host,
          // Data minimisation: without an explicit identify() call this creates
          // no person profile at all, so anonymous visitors leave events but no
          // stored profile. Funnels and trends still work.
          person_profiles: "identified_only",
          // App Router does not emit the history events posthog watches for, so
          // pageviews are captured manually in the effect below.
          capture_pageview: false,
          capture_pageleave: true,
          session_recording: {
            // Aggressive masking. Learners type exam answers and personal
            // details into this app; recording them would turn replay into a
            // second copy of their coursework and contact details.
            maskAllInputs: true,
            maskTextSelector: "*",
          },
        });
        posthogInstance = posthog;
        posthog.capture("$pageview");
      });
    }

    if (consent === "denied" && posthogInstance) {
      posthogInstance.opt_out_capturing();
      posthogInstance.reset();
    }
  }, [consent]);

  // Manual pageview on client-side navigation.
  useEffect(() => {
    if (consent !== "granted" || !posthogInstance || !pathname) return;
    posthogInstance.capture("$pageview");
  }, [pathname, consent]);

  return <>{children}</>;
}

/**
 * Safe accessor for custom event tracking elsewhere in the app.
 * Returns null when the user hasn't consented, so callers never need to guard.
 *
 * Usage: capture("quiz_completed", { lo_id: "1.1", score: 8 })
 */
export function capture(
  event: string,
  properties?: Record<string, unknown>,
): void {
  posthogInstance?.capture(event, properties);
}

/**
 * Associates subsequent events with a stable user. Required for retention,
 * cohorts and any per-user funnel — with `person_profiles: "identified_only"`
 * PostHog creates no profile at all until this fires.
 *
 * Pass the Supabase user UUID only. Never email, never name: ANALYTICS_SPEC.md
 * §5 forbids PII in PostHog, and a UUID is enough to join back to Supabase
 * when we need the human behind a number.
 */
export function identify(
  userId: string,
  properties?: Record<string, unknown>,
): void {
  posthogInstance?.identify(userId, properties);
}
