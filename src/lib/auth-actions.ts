"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-side "is this browser signed in yet?" check for the check-inbox card.
 *
 * Why this is NOT `supabase.auth.getSession()` on the client (LIC-166):
 * the confirmation link opens in a NEW TAB, and /auth/confirm writes the auth
 * cookies from the server. The original tab's browser client was constructed
 * before those cookies existed, and `@supabase/ssr` keeps the session in
 * cookies rather than localStorage, so there is no cross-tab `storage` event to
 * tell that tab anything changed. Its Continue button therefore reported "that
 * link hasn't been opened yet" to a user who was already signed in.
 *
 * Reading the cookie jar on the server removes every one of those failure
 * modes: it is the same jar /auth/confirm just wrote to, and it is also immune
 * to the apex/www split (a cookie written on one host is invisible to the
 * other, see src/lib/site-url.ts).
 *
 * `getUser()`, not `getSession()`: getUser revalidates the token against the
 * auth server, so a stale or tampered cookie cannot produce a false positive.
 */
export async function hasConfirmedSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return !error && Boolean(data.user);
  } catch {
    return false;
  }
}
