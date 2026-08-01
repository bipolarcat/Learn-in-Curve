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

export function getSiteOrigin(request: Request): string {
  if (CANONICAL_ORIGIN) return CANONICAL_ORIGIN;

  const forwardedHost = firstHeaderValue(
    request.headers.get("x-forwarded-host"),
  );
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  if (host && !LOOPBACK.test(host)) {
    const proto =
      firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? "https";
    return `${proto}://${host}`;
  }

  // Local dev (localhost:3000) and anything else: fall back to the request URL.
  return new URL(request.url).origin;
}
