"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackSignedIn } from "@/lib/analytics/events";

/**
 * Fires after Google OAuth returns via /auth/callback?auth_ok=google.
 * Server routes cannot capture(); the query flag is the hand-off.
 */
export function OAuthSignedInBeacon() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("auth_ok") !== "google") return;
    trackSignedIn({ method: "google" });
    const next = new URLSearchParams(searchParams.toString());
    next.delete("auth_ok");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, router, pathname]);

  return null;
}
