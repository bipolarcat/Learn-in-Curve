/**
 * Server-side PostHog capture. Browser `capture()` cannot run in a webhook;
 * this posts to the same EU project using the existing public write-only key.
 *
 * Distinct IDs must match client `identify()` — Supabase user UUID, never email.
 */

import { resolvePostHogServerHost } from "@/lib/analytics/posthog-hosts";
import {
  LIVE_ANALYTICS_HOSTNAME,
  liveAnalyticsOriginFromEnv,
} from "@/lib/analytics/live-host";

export async function captureServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
  opts?: {
    /** Stable event id for PostHog dedupe (top-level `uuid` on /i/v0/e/). */
    uuid?: string;
    /** Event time as ISO string (defaults to now). */
    timestamp?: string;
  },
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = resolvePostHogServerHost();

  // Webhooks have no browser. Skip unless this deploy is the live www host,
  // so a local Stripe CLI forward does not write into the production project.
  if (!apiKey || !distinctId || !liveAnalyticsOriginFromEnv()) return;

  const body: Record<string, unknown> = {
    api_key: apiKey,
    event,
    distinct_id: distinctId,
    timestamp: opts?.timestamp ?? new Date().toISOString(),
    properties: {
      ...properties,
      $lib: "lic-server",
      $host: LIVE_ANALYTICS_HOSTNAME,
    },
  };
  if (opts?.uuid) {
    body.uuid = opts.uuid;
  }

  const response = await fetch(`${host}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `PostHog capture failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }
}
