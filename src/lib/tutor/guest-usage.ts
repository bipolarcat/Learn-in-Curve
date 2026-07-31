import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GUEST_TIER_MESSAGE_CAP } from "./constants";

export function getGuestTutorIpSalt(): string {
  return (
    process.env.GUEST_TUTOR_IP_SALT ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) ||
    "lic-guest-tutor-dev-salt"
  );
}

export function hashGuestIp(ip: string, salt = getGuestTutorIpSalt()): string {
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex");
}

/** Best-effort client IP behind proxies (Vercel / Railway / local). */
export function resolveClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export type GuestClaimResult = {
  allowed: boolean;
  messageCount: number;
  messagesRemaining: number;
  locked: boolean;
};

export async function claimGuestTutorMessage(
  admin: SupabaseClient,
  ipHash: string,
  cap = GUEST_TIER_MESSAGE_CAP,
): Promise<GuestClaimResult> {
  const { data, error } = await admin.rpc("claim_guest_tutor_message", {
    p_ip_hash: ipHash,
    p_cap: cap,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = Boolean(row?.allowed);
  const messageCount = Number(row?.message_count ?? cap);
  const messagesRemaining = Math.max(0, cap - messageCount);

  return {
    allowed,
    messageCount,
    messagesRemaining,
    locked: !allowed || messagesRemaining === 0,
  };
}

export async function getGuestTutorUsage(
  admin: SupabaseClient,
  ipHash: string,
  cap = GUEST_TIER_MESSAGE_CAP,
): Promise<{ messageCount: number; messagesRemaining: number; locked: boolean }> {
  const { data, error } = await admin
    .from("guest_tutor_usage")
    .select("message_count")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const messageCount = Number(data?.message_count ?? 0);
  const messagesRemaining = Math.max(0, cap - messageCount);

  return {
    messageCount,
    messagesRemaining,
    locked: messagesRemaining === 0 && messageCount > 0,
  };
}

export type GuestBudgetSpendResult = {
  totalGbpCents: number;
  capGbpCents: number;
  justCrossed: boolean;
  enabled: boolean;
};

/**
 * Global spend guardrail (separate from the per-IP message cap above).
 * Atomically adds `deltaGbpCents` to the running total and reports whether
 * this call is the one that just pushed it over the cap (used to fire
 * exactly one alert email, not one per message after the cap is hit).
 */
export async function recordGuestTutorSpend(
  admin: SupabaseClient,
  deltaGbpCents: number,
): Promise<GuestBudgetSpendResult> {
  const { data, error } = await admin.rpc("record_guest_tutor_spend", {
    p_delta_gbp_cents: Math.max(0, Math.round(deltaGbpCents)),
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    totalGbpCents: Number(row?.total_gbp_cents ?? 0),
    capGbpCents: Number(row?.cap_gbp_cents ?? 0),
    justCrossed: Boolean(row?.just_crossed),
    enabled: Boolean(row?.enabled ?? true),
  };
}

/**
 * Kill-switch check. Fails CLOSED (treats errors as disabled) — this is a
 * cost guardrail, so a transient DB/read error should not silently let
 * guest traffic keep spending against Gemini unchecked.
 */
export async function isGuestTutorEnabled(
  admin: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await admin
    .from("guest_tutor_budget")
    .select("enabled")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("guest tutor budget enabled-check failed:", error.message);
    return false;
  }

  return data?.enabled ?? true;
}
