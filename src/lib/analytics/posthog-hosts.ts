/**
 * PostHog hosts and the first-party proxy path.
 *
 * Browser traffic goes to POSTHOG_PROXY_PATH on this site. next.config.ts
 * rewrites that path to the EU ingestion and asset hosts, so the browser
 * never talks to posthog.com (ad blockers drop that domain). The path is
 * deliberately not /ingest, /analytics, or /posthog: PostHog's proxy guide
 * says obvious names are on filter lists.
 *
 * Server-side capture (Stripe webhook) keeps calling the EU ingest host
 * directly. A relative proxy path is meaningless from a webhook, and the
 * webhook is not subject to browser ad blockers.
 *
 * ui_host is the PostHog app (toolbar links), not the ingest host.
 */

export const POSTHOG_PROXY_PATH = "/rq";

export const POSTHOG_UI_HOST = "https://eu.posthog.com";

export const POSTHOG_EU_INGEST_HOST = "https://eu.i.posthog.com";

export const POSTHOG_EU_ASSETS_HOST = "https://eu-assets.i.posthog.com";

export type AnalyticsConsent = "granted" | "denied" | "unset";

export function isPostHogProxyPath(pathname: string): boolean {
  return (
    pathname === POSTHOG_PROXY_PATH ||
    pathname.startsWith(`${POSTHOG_PROXY_PATH}/`)
  );
}

/** Drop credentials before Next rewrites the request on to PostHog. */
export function headersForPostHogProxy(source: Headers): Headers {
  const headers = new Headers(source);
  headers.delete("cookie");
  headers.delete("authorization");
  return headers;
}

/**
 * Absolute EU ingest URL for server capture. Ignores a relative proxy path
 * if NEXT_PUBLIC_POSTHOG_HOST is ever pointed at one.
 */
export function resolvePostHogServerHost(
  configured: string | undefined = process.env.NEXT_PUBLIC_POSTHOG_HOST,
): string {
  const host = (configured ?? "").trim().replace(/\/+$/, "");
  if (host.startsWith("https://")) return host;
  return POSTHOG_EU_INGEST_HOST;
}

/**
 * SDK init for the installed posthog-js.
 *
 * Cookieless until Accept: `persistence: "memory"`. That stores the
 * distinct id only in page memory, so nothing is written to cookies,
 * localStorage, or sessionStorage, and events still send. PostHog's
 * `cookieless_mode: "on_reject"` does not send anything until the visitor
 * accepts or rejects, which is the gap this fixes (ignored banner).
 *
 * `set_config({ persistence: "localStorage+cookie" })` on Accept migrates
 * that in-memory id, so the landing UTMs stay on the same person.
 *
 * Do not set `defaults`. Newer snapshots mark localhost as an internal
 * user inside the SDK. Host filtering stays in the PostHog project, which
 * already excludes localhost and the LAN.
 */
export function posthogBrowserInitConfig(consent: AnalyticsConsent) {
  const full = consent === "granted";
  return {
    api_host: POSTHOG_PROXY_PATH,
    ui_host: POSTHOG_UI_HOST,
    person_profiles: "identified_only" as const,
    capture_pageview: false as const,
    capture_pageleave: true as const,
    persistence: (full ? "localStorage+cookie" : "memory") as
      | "localStorage+cookie"
      | "memory",
    disable_session_recording: !full,
    disable_surveys: !full,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
    },
    opt_out_capturing_by_default: false,
  };
}

export function posthogProxyRewrites() {
  return [
    {
      source: `${POSTHOG_PROXY_PATH}/static/:path*`,
      destination: `${POSTHOG_EU_ASSETS_HOST}/static/:path*`,
    },
    {
      source: `${POSTHOG_PROXY_PATH}/array/:path*`,
      destination: `${POSTHOG_EU_ASSETS_HOST}/array/:path*`,
    },
    {
      source: `${POSTHOG_PROXY_PATH}/:path*`,
      destination: `${POSTHOG_EU_INGEST_HOST}/:path*`,
    },
  ];
}
