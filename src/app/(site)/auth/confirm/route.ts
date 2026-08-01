import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth-next";
import { createClient } from "@/lib/supabase/server";
import { syncThemeCookieFromProfile } from "@/lib/profile-actions";
import { getSiteOrigin } from "@/lib/site-origin";

export const runtime = "nodejs";

/**
 * Email confirmation landing route — PKCE flow.
 *
 * Why this exists (LIC-120), and why it is NOT /auth/callback:
 *
 * `src/lib/supabase/client.ts` uses `createBrowserClient` from `@supabase/ssr`,
 * which defaults to the PKCE flow. But the Supabase "Confirm sign up" email
 * template shipped with `{{ .ConfirmationURL }}` — the legacy implicit-flow
 * link, which routes through Supabase's own `/auth/v1/verify` endpoint. That
 * combination does not hand back a `?code=` param, so `/auth/callback` found
 * nothing to exchange and bounced the user to the sign-in page.
 *
 * The PKCE-correct pattern is a link carrying `token_hash`, verified here with
 * `verifyOtp`. `/auth/callback` stays exactly as it is — it still handles the
 * Google OAuth `?code=` exchange, which is a genuinely different flow.
 *
 * REQUIRES a matching change to the Supabase dashboard template (Authentication
 * → Emails → Confirm sign up), whose button href must become:
 *
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard
 *
 * Ship this route FIRST, then change the template. Doing it the other way round
 * breaks confirmation for anyone who signs up in the gap.
 */

/**
 * Only the types we actually send. Anything else is rejected rather than passed
 * through to `verifyOtp` — `type` comes straight off a user-editable URL, and
 * an unexpected value should fail closed.
 */
const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "email",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
]);

function isAllowedOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.has(value as EmailOtpType);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Never the request URL's origin — behind the Railway proxy that is
  // https://localhost:8080. Same trap as LIC-116. See src/lib/site-origin.ts.
  const origin = getSiteOrigin(request);

  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  if (tokenHash && isAllowedOtpType(rawType)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: rawType,
      token_hash: tokenHash,
    });

    if (!error) {
      // Password recovery must land on the reset form, not the dashboard —
      // the user has a session but hasn't chosen a password yet.
      if (rawType === "recovery") {
        return NextResponse.redirect(new URL("/auth/reset-password", origin));
      }

      // Seed the theme mirror cookie before the first render so a dark-mode
      // user doesn't land light-then-dark. Same reason as /auth/callback.
      await syncThemeCookieFromProfile();
      return NextResponse.redirect(new URL(nextPath, origin));
    }

    console.error("[auth/confirm] verifyOtp failed", {
      type: rawType,
      message: error.message,
    });
  }

  // Failure path is deliberately visible: `?error=confirm` is rendered by the
  // sign-in page (src/lib/auth-errors.ts). The old behaviour — redirecting to a
  // sign-in form that said nothing — is what made this bug invisible.
  const signInUrl = new URL("/auth/sign-in", origin);
  signInUrl.searchParams.set("next", nextPath);
  signInUrl.searchParams.set("error", "confirm");
  return NextResponse.redirect(signInUrl);
}
