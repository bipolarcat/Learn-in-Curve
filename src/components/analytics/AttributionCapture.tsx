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
  getAttribution,
  releasePersistentAttribution,
} from "@/lib/analytics/attribution";

/**
 * Always remember landing UTMs in memory so cookieless events and the
 * free-mock lead carry them. Persist to sessionStorage, and set person
 * properties, only after Accept. Decline or a withdrawn choice drops the
 * durable copy and keeps the in-memory one for the rest of the visit.
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
      } else {
        releasePersistentAttribution();
        captureAttributionFromUrl();
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
