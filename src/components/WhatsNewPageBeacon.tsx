"use client";

import { useEffect } from "react";
import { trackWhatsNewPageViewed } from "@/lib/analytics/events";

/** Fires once when the public changelog page mounts. */
export function WhatsNewPageBeacon() {
  useEffect(() => {
    trackWhatsNewPageViewed();
  }, []);
  return null;
}
