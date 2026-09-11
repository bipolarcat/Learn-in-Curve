/**
 * Server-side PostHog capture. Browser `capture()` cannot run in a webhook;
 * this posts to the same EU project using the existing public write-only key.
 *
 * Distinct IDs must match client `identify()` — Supabase user UUID, never email.
 */

const DEFAULT_EU_HOST = "https://eu.i.posthog.com";

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
  const host = (
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_EU_HOST
  ).replace(/\/+$/, "");

  if (!apiKey || !distinctId) return;

  const body: Record<string, unknown> = {
    api_key: apiKey,
    event,
    distinct_id: distinctId,
    timestamp: opts?.timestamp ?? new Date().toISOString(),
    properties: {
      ...properties,
      $lib: "lic-server",
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
