"use client";

import { useEffect } from "react";
import { identify } from "@/components/PostHogProvider";

/**
 * Mounted in the authenticated layout so every signed-in page view is attached
 * to a person. Safe to mount repeatedly — posthog.identify is idempotent for
 * the same distinct_id.
 *
 * Deliberately takes only the UUID and the tier. Tier is a person property
 * (not an event property) because it describes the user, not the moment.
 */
export function AnalyticsIdentify({
  userId,
  tier,
}: {
  userId: string;
  tier?: string;
}) {
  useEffect(() => {
    if (!userId) return;
    identify(userId, tier ? { tier } : undefined);
  }, [userId, tier]);

  return null;
}
