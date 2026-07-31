"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Intercom?: ((...args: unknown[]) => void) & { q?: unknown[][] };
    intercomSettings?: Record<string, unknown>;
  }
}

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

/**
 * Boots Intercom Messenger when NEXT_PUBLIC_INTERCOM_APP_ID is set.
 * No-ops entirely if the env var is missing — safe for local/dev builds.
 * Default launcher bubble is hidden; use SendFeedbackButton → Intercom('show').
 */
export function IntercomProvider() {
  useEffect(() => {
    if (!APP_ID || typeof window === "undefined") return;

    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: APP_ID,
      hide_default_launcher: true,
    };

    if (typeof window.Intercom === "function") {
      window.Intercom("reattach_activator");
      window.Intercom("update", window.intercomSettings);
      return;
    }

    const enqueue = function (...args: unknown[]) {
      enqueue.q = enqueue.q || [];
      enqueue.q.push(args);
    } as ((...args: unknown[]) => void) & { q?: unknown[][] };
    enqueue.q = [];
    window.Intercom = enqueue;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${APP_ID}`;
    document.body.appendChild(script);
  }, []);

  return null;
}
