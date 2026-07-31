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

export function resolvePmqStartHref(isSignedIn: boolean): string {
  if (isSignedIn) return "/dashboard";
  if (hasCreatedAccount()) return "/auth/sign-in";
  return "/auth/sign-up";
}
