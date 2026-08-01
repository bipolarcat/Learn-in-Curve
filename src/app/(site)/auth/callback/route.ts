import { NextResponse } from "next/server";
import { authHrefWithNext, getSafeNextPath } from "@/lib/auth-next";
import { LAST_GOOGLE_EMAIL_COOKIE } from "@/lib/auth-hints";
import { createClient } from "@/lib/supabase/server";
import { syncThemeCookieFromProfile } from "@/lib/profile-actions";
import { getSiteOrigin } from "@/lib/site-origin";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Remember which Google account completed this flow so the next sign-in can pass
 * it to Google as a `login_hint` and skip the account chooser. Only for Google —
 * a password or magic-link user has no chooser to skip.
 *
 * Readable by JS (the sign-in form needs it) and survives sign-out by design, so
 * it is clearable from the UI via "Use a different Google account".
 */
function rememberGoogleAccount(
  response: NextResponse,
  user: { email?: string | null; app_metadata?: { provider?: string } } | null | undefined,
  origin: string,
) {
  const email = user?.email;
  if (!email || user?.app_metadata?.provider !== "google") return;

  response.cookies.set({
    name: LAST_GOOGLE_EMAIL_COOKIE,
    value: email,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    httpOnly: false,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Never use the request URL's origin here: behind the Railway proxy it is
  // https://localhost:8080, which sent every post-OAuth redirect to a dead
  // localhost address. See LIC-116 and src/lib/site-origin.ts.
  const origin = getSiteOrigin(request);
  const code = searchParams.get("code");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Seed the theme mirror cookie from the account before the first page
      // renders, so a dark-mode user signing in on a new device lands dark
      // instead of light-then-dark. See syncThemeCookieFromProfile.
      await syncThemeCookieFromProfile();
      const response = NextResponse.redirect(new URL(nextPath, origin));
      rememberGoogleAccount(response, data?.user, origin);
      return response;
    }
  }

  const signInUrl = new URL(
    authHrefWithNext("/auth/sign-in", nextPath),
    origin,
  );
  signInUrl.searchParams.set("error", "oauth");
  return NextResponse.redirect(signInUrl);
}
