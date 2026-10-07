"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  readConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import { posthogBrowserInitConfig } from "@/lib/analytics/posthog-hosts";

/**
 * PostHog.
 *
 * Before the visitor accepts (and after they reject), the SDK runs with
 * persistence "memory": pageviews, pageleaves, and the app's capture()
 * events are sent, but nothing is written to cookies, localStorage, or
 * sessionStorage, and session replay stays off.
 *
 * Accept switches persistence to localStorage+cookie and starts replay.
 * set_config migrates the in-memory distinct id, so the landing UTMs stay
 * attached to later events. Reject (or withdrawing consent) switches back
 * to memory and stops replay. It does not call opt_out_capturing(), which
 * would drop the cookieless events.
 *
 * Requests go to the first-party proxy path (see posthog-hosts.ts), not
 * eu.i.posthog.com. $host is still the page host, so the PostHog project's
 * localhost / LAN filters are unchanged.
 *
 * Env: NEXT_PUBLIC_POSTHOG_KEY is a public write-only project token.
 * Server-side capture still uses the EU ingest host directly.
 */

type PostHogModule = typeof import("posthog-js")["default"];

let posthogInstance: PostHogModule | null = null;

type PersonProps = Record<string, string | number | boolean | null>;

let pendingIdentify: {
  userId: string;
  properties?: Record<string, unknown>;
} | null = null;

let pendingPerson: PersonProps | null = null;

function flushPending(): void {
  if (!posthogInstance || readConsent() !== "granted") return;
  if (pendingIdentify) {
    const queued = pendingIdentify;
    pendingIdentify = null;
    posthogInstance.identify(queued.userId, queued.properties);
  }
  if (pendingPerson) {
    const queued = pendingPerson;
    pendingPerson = null;
    posthogInstance.setPersonProperties(queued);
  }
}

/**
 * Older builds called opt_out_capturing() on Reject, which stores a PostHog
 * opt-out flag and then refuses to send. Clear that flag so a declined
 * visitor is still counted cookieless. Fresh visitors have no flag, so this
 * does not write storage for them.
 */
function clearLegacyOptOut(posthog: PostHogModule): void {
  if (posthog.has_opted_out_capturing()) {
    posthog.clear_opt_in_out_capturing();
  }
}

/** Drop any PostHog cookie or localStorage entry. Consent choice is a different key. */
function clearPostHogBrowserStorage(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("ph_") || key.startsWith("__ph_")) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* private mode */
  }
  try {
    for (const part of document.cookie.split(";")) {
      const name = part.split("=")[0]?.trim();
      if (!name || (!name.startsWith("ph_") && !name.startsWith("__ph_"))) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  } catch {
    /* ignore */
  }
}

function applyTrackingMode(posthog: PostHogModule, consent: ConsentState): void {
  if (consent === "granted") {
    posthog.set_config({
      persistence: "localStorage+cookie",
      disable_surveys: false,
    });
    posthog.startSessionRecording();
    flushPending();
    return;
  }
  posthog.stopSessionRecording();
  posthog.set_config({
    persistence: "memory",
    disable_surveys: true,
  });
  clearLegacyOptOut(posthog);
  clearPostHogBrowserStorage();
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // null until we've read localStorage, so a returning Accept isn't briefly
  // initialised cookieless.
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const pathname = usePathname();
  const initialised = useRef(false);
  const mode = useRef<"full" | "cookieless" | null>(null);
  const capturedPath = useRef<string | null>(null);

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
    if (!key || consent === null) return;

    let cancelled = false;
    const want = consent === "granted" ? "full" : "cookieless";

    void import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;

      if (!initialised.current) {
        initialised.current = true;
        posthog.init(key, posthogBrowserInitConfig(consent));
        posthogInstance = posthog;
        mode.current = want;
        if (want === "cookieless") {
          clearLegacyOptOut(posthog);
          clearPostHogBrowserStorage();
        } else {
          flushPending();
        }
        capturedPath.current = window.location.pathname;
        posthog.capture("$pageview");
        return;
      }

      if (mode.current === want) {
        if (want === "cookieless") {
          clearLegacyOptOut(posthog);
          clearPostHogBrowserStorage();
        } else {
          flushPending();
        }
        return;
      }
      applyTrackingMode(posthog, consent);
      mode.current = want;
    });

    return () => {
      cancelled = true;
    };
  }, [consent]);

  // Client-side navigations. The landing view is captured at init.
  useEffect(() => {
    if (!pathname || !posthogInstance) return;
    if (capturedPath.current === pathname) return;
    capturedPath.current = pathname;
    posthogInstance.capture("$pageview");
  }, [pathname]);

  return <>{children}</>;
}

/**
 * Custom events. Sends before consent as well: the SDK is in memory
 * persistence, so this does not set a cookie. No-ops until init finishes.
 */
export function capture(
  event: string,
  properties?: Record<string, unknown>,
): void {
  posthogInstance?.capture(event, properties);
}

/**
 * Associates subsequent events with a stable user. Required for retention,
 * cohorts and any per-user funnel. With `person_profiles: "identified_only"`
 * PostHog creates no profile at all until this fires.
 *
 * Pass the Supabase user UUID only. Never email, never name.
 * Held back until cookie consent: a UUID is a persistent identifier.
 */
export function identify(
  userId: string,
  properties?: Record<string, unknown>,
): void {
  if (readConsent() !== "granted") {
    pendingIdentify = null;
    return;
  }
  if (!posthogInstance) {
    pendingIdentify = { userId, properties };
    return;
  }
  posthogInstance.identify(userId, properties);
}

/**
 * Update person properties without changing distinct_id. Use when the layout
 * already has the value (e.g. dashboard tier). Held back until consent, same
 * as identify().
 */
export function setPersonProperties(properties: PersonProps): void {
  if (readConsent() !== "granted") return;
  if (!posthogInstance) {
    pendingPerson = { ...pendingPerson, ...properties };
    return;
  }
  posthogInstance.setPersonProperties(properties);
}
