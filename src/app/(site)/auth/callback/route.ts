import { NextResponse } from "next/server";
import { authHrefWithNext, getSafeNextPath } from "@/lib/auth-next";
import { createClient } from "@/lib/supabase/server";
import { syncThemeCookieFromProfile } from "@/lib/profile-actions";
import { getSiteOrigin } from "@/lib/site-origin";

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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Seed the theme mirror cookie from the account before the first page
      // renders, so a dark-mode user signing in on a new device lands dark
      // instead of light-then-dark. See syncThemeCookieFromProfile.
      await syncThemeCookieFromProfile();
      return NextResponse.redirect(new URL(nextPath, origin));
    }
  }

  const signInUrl = new URL(
    authHrefWithNext("/auth/sign-in", nextPath),
    origin,
  );
  signInUrl.searchParams.set("error", "oauth");
  return NextResponse.redirect(signInUrl);
}
