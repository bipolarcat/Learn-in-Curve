/**
 * Cookie consent state for non-essential (analytics) cookies.
 *
 * Why this exists: UK PECR reg 6 requires *prior* consent before setting any
 * cookie that isn't strictly necessary, and our published Cookie Notice commits
 * us to giving a clear Accept/Reject choice before analytics ever loads. So
 * PostHog must not initialise until this module reports "granted".
 *
 * Deliberate detail — the old `lic_cookie_notice_v1` key is NOT migrated to
 * consent. That banner was acknowledgement-only ("Got it") at a time when the
 * site ran no analytics; clicking it was not consent to be tracked, and
 * treating it as such retroactively would be exactly the dark pattern the
 * regulation exists to stop. Everyone gets asked once, properly.
 */

export const CONSENT_STORAGE_KEY = "lic_cookie_consent_v2";

/** Fired on the window when consent changes, so the provider reacts without a reload. */
export const CONSENT_EVENT = "lic:consent-change";

export type ConsentState = "granted" | "denied" | "unset";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    // Private mode / storage blocked. Treat as unset: ask again rather than
    // assume consent we can't prove we have.
    return "unset";
  }
}

export function writeConsent(state: Exclude<ConsentState, "unset">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    /* ignore — the event below still updates this page's session */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/**
 * Clears the stored choice so the banner reappears. Needed because "withdraw
 * consent must be as easy as giving it" — the /cookies page links to this.
 */
export function resetConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "unset" }));
}
