"use client";

import { useEffect } from "react";
import { setPersonProperties } from "@/components/PostHogProvider";
import {
  CONSENT_EVENT,
  readConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import {
  captureAttributionFromUrl,
  clearAttributionStorage,
  getAttribution,
} from "@/lib/analytics/attribution";

/**
 * On consent grant: persist first-touch UTMs and set referrer_category person property.
 * On deny: clear attribution storage.
 */
export function AttributionCapture() {
  useEffect(() => {
    function apply(state: ConsentState) {
      if (state === "granted") {
        captureAttributionFromUrl();
        const attr = getAttribution();
        setPersonProperties({
          referrer_category: attr.referrer_category,
          ...(attr.utm_source ? { utm_source: attr.utm_source } : {}),
          ...(attr.utm_medium ? { utm_medium: attr.utm_medium } : {}),
          ...(attr.utm_campaign ? { utm_campaign: attr.utm_campaign } : {}),
        });
      } else if (state === "denied") {
        clearAttributionStorage();
      }
    }

    apply(readConsent());

    function onChange(event: Event) {
      apply((event as CustomEvent<ConsentState>).detail ?? readConsent());
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}
