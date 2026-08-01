export const HAS_ACCOUNT_KEY = "lic_has_account";

export function markHasAccount(): void {
  try {
    localStorage.setItem(HAS_ACCOUNT_KEY, "1");
  } catch {
    // ignore private browsing / blocked storage
  }
}

export function hasCreatedAccount(): boolean {
  try {
    return localStorage.getItem(HAS_ACCOUNT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Last Google account this browser signed in with, used as an OAuth `login_hint`
 * so returning users skip Google's account chooser. Written server-side by
 * /auth/callback (see setLastGoogleEmailCookie) because that is the only place
 * we know the account that actually completed the flow.
 *
 * Deliberately a cookie rather than localStorage: the write happens on the
 * server during the OAuth redirect, where localStorage doesn't exist.
 * Deliberately NOT httpOnly: the sign-in form has to read it.
 *
 * Privacy: this is an email address on the device. It survives sign-out on
 * purpose — that is the whole feature — so it must stay clearable from the UI
 * ("Use a different Google account") and be named in the storage policy.
 */
export const LAST_GOOGLE_EMAIL_COOKIE = "lic_last_google_email";

export function readLastGoogleEmail(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LAST_GOOGLE_EMAIL_COOKIE}=`));
    if (!match) return null;
    const value = decodeURIComponent(match.slice(match.indexOf("=") + 1));
    // Cheap sanity check — never hand junk to Google as a login_hint.
    return value.includes("@") ? value : null;
  } catch {
    return null;
  }
}

export function forgetLastGoogleEmail(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${LAST_GOOGLE_EMAIL_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
  } catch {
    // ignore blocked storage
  }
}

export function resolvePmqStartHref(isSignedIn: boolean): string {
  if (isSignedIn) return "/dashboard";
  if (hasCreatedAccount()) return "/auth/sign-in";
  return "/auth/sign-up";
}
