export const DEFAULT_AUTH_NEXT_PATH = "/dashboard";

const AUTH_PATH_PREFIX = "/auth";
const VALIDATION_ORIGIN = "https://learnincurve.local";

/**
 * Returns a normalized same-origin destination, or the supplied fallback.
 * Auth destinations are rejected so a bad `next` value cannot create a loop.
 */
export function getSafeNextPath(
  value: string | string[] | null | undefined,
  fallback = DEFAULT_AUTH_NEXT_PATH,
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, VALIDATION_ORIGIN);
    const decodedUrl = new URL(decoded, VALIDATION_ORIGIN);

    if (
      url.origin !== VALIDATION_ORIGIN ||
      decodedUrl.origin !== VALIDATION_ORIGIN ||
      isAuthPath(url.pathname) ||
      isAuthPath(decodedUrl.pathname)
    ) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function authHrefWithNext(
  authPath: "/auth/sign-in" | "/auth/sign-up" | "/auth/callback",
  nextPath: string | string[] | null | undefined,
): string {
  const params = new URLSearchParams({
    next: getSafeNextPath(nextPath),
  });
  return `${authPath}?${params.toString()}`;
}

function isAuthPath(pathname: string): boolean {
  return pathname === AUTH_PATH_PREFIX || pathname.startsWith(`${AUTH_PATH_PREFIX}/`);
}
