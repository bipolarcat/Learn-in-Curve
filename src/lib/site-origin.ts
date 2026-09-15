/**
 * Canonical public origin for server-side absolute URLs (redirects, email links).
 *
 * Why this exists: in a Next.js Route Handler, `new URL(request.url).origin`
 * reflects the *internal* host the container was reached on. Behind Railway's
 * proxy that is `https://localhost:8080`, not the public domain. Building an
 * absolute redirect from it sends the browser to `https://localhost:8080/...`,
 * which is exactly what broke Google sign-in (LIC-116): the OAuth code was
 * exchanged fine, then the post-login redirect dead-ended on localhost.
 *
 * Order of preference:
 *  1. NEXT_PUBLIC_SITE_URL — deterministic and NOT attacker-controllable.
 *     Exception: when that value is loopback (local `.env.local`) AND the
 *     request Host is a private LAN address (phone on Wi‑Fi hitting the Mac),
 *     prefer the request host so mobile testing does not redirect to the
 *     phone's own localhost.
 *  2. x-forwarded-host / x-forwarded-proto — set by the proxy. Usable, but a
 *     client can spoof these if the proxy ever forwards them unfiltered, so it
 *     is only the fallback.
 *  3. request.url origin — correct in local dev, wrong in prod.
 */
const CANONICAL_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
  /\/+$/,
  "",
);

const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

function firstHeaderValue(value: string | null): string | undefined {
  // Proxies may append rather than replace, producing "a.example, b.example".
  return value?.split(",")[0]?.trim() || undefined;
}

/** Private LAN / .local — safe to trust as the phone↔Mac origin in local dev. */
export function isPrivateLanHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname) return false;
  if (hostname.endsWith(".local")) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }
  return false;
}

function configuredIsLoopback(origin: string): boolean {
  try {
    return LOOPBACK.test(new URL(origin).host);
  } catch {
    return false;
  }
}

export function getSiteOrigin(request: Request): string {
  const forwardedHost = firstHeaderValue(
    request.headers.get("x-forwarded-host"),
  );
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  // Phone on Wi‑Fi → Mac LAN IP. Env still says localhost:3000 for desktop
  // cookies; absolute redirects must follow the Host the phone actually used.
  if (
    CANONICAL_ORIGIN &&
    configuredIsLoopback(CANONICAL_ORIGIN) &&
    host &&
    isPrivateLanHost(host)
  ) {
    const proto =
      firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? "http";
    return `${proto}://${host}`;
  }

  if (CANONICAL_ORIGIN) return CANONICAL_ORIGIN;

  if (host && !LOOPBACK.test(host)) {
    const proto =
      firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? "https";
    return `${proto}://${host}`;
  }

  // Local dev (localhost:3000) and anything else: fall back to the request URL.
  return new URL(request.url).origin;
}
