"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackSignedIn, trackSignedUp } from "@/lib/analytics/events";

/**
 * Fires after Google OAuth returns via /auth/callback.
 * - auth_ok=google_signup → signup_completed (new account)
 * - auth_ok=google → signed_in only (returning)
 * Server routes cannot capture(); the query flag is the hand-off.
 */
export function OAuthSignedInBeacon() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const flag = searchParams.get("auth_ok");
    if (flag !== "google" && flag !== "google_signup") return;

    if (flag === "google_signup") {
      trackSignedUp({ signup_method: "google" });
    } else {
      trackSignedIn({ method: "google" });
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("auth_ok");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, router, pathname]);

  return null;
}
