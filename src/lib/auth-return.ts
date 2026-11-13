import { DEFAULT_AUTH_NEXT_PATH, getSafeNextPath } from "./auth-next.ts";

/**
 * Strictly necessary cookie: where to send someone after they open an email
 * link. The Supabase confirm template hardcodes next=/dashboard, which drops
 * ?intent=pro and any other return path. The cookie is the copy we keep.
 * It is not an analytics cookie and it expires in an hour.
 */
export const AUTH_NEXT_COOKIE = "lic_auth_next";
export const AUTH_NEXT_MAX_AGE_SECONDS = 60 * 60;

export function resolveAuthDestination(
  urlNext: string | null | undefined,
  cookieValue: string | null | undefined,
): string {
  const fromUrl = getSafeNextPath(urlNext);
  let fromCookie: string | null = null;
  if (cookieValue) {
    try {
      fromCookie = getSafeNextPath(decodeURIComponent(cookieValue));
    } catch {
      fromCookie = null;
    }
  }
  if (fromUrl !== DEFAULT_AUTH_NEXT_PATH) return fromUrl;
  if (fromCookie && fromCookie !== DEFAULT_AUTH_NEXT_PATH) return fromCookie;
  return fromUrl;
}

export function readAuthNextCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === AUTH_NEXT_COOKIE) {
      const value = rest.join("=");
      return value || null;
    }
  }
  return null;
}

export function writeAuthNextCookie(nextPath: string): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(getSafeNextPath(nextPath));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_NEXT_COOKIE}=${value}; Path=/; Max-Age=${AUTH_NEXT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthNextCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
