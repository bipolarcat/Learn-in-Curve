/**
 * Dark-mode policy. One file, four rules, no exceptions (LIC-114):
 *
 *   1. Dark mode exists only on the dashboard and individual LO pages.
 *   2. Every other page — the home page and all public/marketing pages — is
 *      light, regardless of any stored preference and regardless of auth state.
 *   3. The OS / browser `prefers-color-scheme` setting is NEVER consulted. A
 *      device with system dark mode on still renders this site light. Dark is
 *      opt-in through the in-app toggle only.
 *   4. A brand-new user is light.
 *
 * Rule 3 is the one that broke: the old resolver fell back to
 * `matchMedia('(prefers-color-scheme: dark)')` when nothing was stored, so a
 * first sign-in on a machine with OS dark mode opened the dashboard dark having
 * never been asked (LIC-107).
 *
 * The preference lives on `profiles.theme_preference` (per account, survives
 * logout and a change of device) and is mirrored into a readable cookie so the
 * blocking script in the document head can resolve the theme before first
 * paint without a database round trip. See `THEME_COOKIE` below.
 */

export type ThemeChoice = "light" | "dark";

/**
 * Mirror of `profiles.theme_preference` for the current browser.
 *
 * Deliberately NOT httpOnly: the whole point is that the inline script in
 * <head> can read it synchronously before the first paint. It carries no
 * authority — middleware deletes it whenever there is no session, and every
 * dark-capable route is behind auth anyway, so a hand-edited cookie can at
 * worst tint a page the user is about to be redirected off.
 */
export const THEME_COOKIE = "lic_theme";

/** One year. The preference is durable; the cookie is only a fast cache of it. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseThemeChoice(value: unknown): ThemeChoice {
  return value === "dark" ? "dark" : "light";
}

/**
 * Routes where a signed-in user may opt into dark mode.
 *
 * Exactly the dashboard and individual learning objectives. The PMQ course
 * overview (`/courses/pmq-in-5-days`) used to be on this list but is reachable
 * signed out, which makes it a public page under rule 2.
 */
export function allowsDarkMode(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    /^\/dashboard\/?$/.test(pathname) ||
    /^\/courses\/pmq-in-5-days\/lo\/[^/]+\/?$/.test(pathname)
  );
}

/** Read the mirrored preference from `document.cookie`. Client only. */
export function readThemeCookie(): ThemeChoice {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]*)`),
    );
    return parseThemeChoice(match?.[1]);
  } catch {
    return "light";
  }
}

/**
 * The single place `.dark` is applied.
 *
 * `color-scheme: only light|dark` rather than plain `light|dark` is load-bearing
 * — without `only`, Chrome and Edge will still auto-darken form controls and
 * scrollbars when the OS prefers dark, which reintroduces rule 3 through a side
 * door even though no CSS asks for it.
 */
export function applyDocumentTheme(pathname: string): boolean {
  const dark = allowsDarkMode(pathname) && readThemeCookie() === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "only dark" : "only light";
  return dark;
}

/**
 * Apply a toggle immediately, before the server round trip lands.
 *
 * Writes the cookie so a navigation that happens in the same breath resolves
 * the same way; `saveThemePreference` is what makes it durable and per-account.
 */
export function setDocumentTheme(next: ThemeChoice): void {
  try {
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    /* blocked storage — the in-memory toggle below still works this session */
  }
  const root = document.documentElement;
  const dark = next === "dark";
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "only dark" : "only light";
  window.dispatchEvent(new CustomEvent("lic-theme", { detail: { dark } }));
}
