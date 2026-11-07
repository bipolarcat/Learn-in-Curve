/**
 * Checkout analytics fire only on the public www host.
 *
 * The PostHog project already drops localhost and LAN hosts from insights.
 * Server captures (the Stripe webhook) have no browser host, so they must
 * make the same decision from the configured public origin. A missing or
 * local origin does not send: that is local dev and Stripe CLI forwarding.
 */

export const LIVE_ANALYTICS_HOSTNAME = "www.learnincurve.com";

export function isLiveAnalyticsHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const host = hostname.split(":")[0]?.trim().toLowerCase() ?? "";
  return host === LIVE_ANALYTICS_HOSTNAME;
}

export function isLiveAnalyticsOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  try {
    return isLiveAnalyticsHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** True when this process is configured as the live www site. */
export function liveAnalyticsOriginFromEnv(
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
  appUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): boolean {
  const configured = (siteUrl || appUrl || "").trim();
  return isLiveAnalyticsOrigin(configured);
}

export function isLiveAnalyticsBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return isLiveAnalyticsHostname(window.location.hostname);
}
