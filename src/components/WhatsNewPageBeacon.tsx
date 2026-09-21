"use client";

import { useEffect } from "react";
import { trackWhatsNewPageViewed } from "@/lib/analytics/events";
import { markWhatsNewSeen } from "@/lib/whats-new/actions";

type WhatsNewPageBeaconProps = {
  /** Signed-in visitors have now seen every note, so clear the seen-state. */
  signedIn: boolean;
};

/**
 * Fires once when the public changelog page mounts.
 *
 * The seen-state write lives here, not in the page body: markWhatsNewSeen calls
 * revalidatePath, which Next 15 throws on during render, and a server render
 * also happens on link prefetch, which would mark notes seen on hover alone.
 */
export function WhatsNewPageBeacon({ signedIn }: WhatsNewPageBeaconProps) {
  useEffect(() => {
    trackWhatsNewPageViewed();
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    void markWhatsNewSeen();
  }, [signedIn]);

  return null;
}
