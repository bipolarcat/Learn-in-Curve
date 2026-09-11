import { createHash } from "crypto";
import type { LoActivity } from "@/types/pmq";

/** Deterministic JSON for content hashing (sorted object keys, recursive). */
export function canonicalizeForHash(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeForHash);
  }
  if (value !== null && typeof value === "object") {
    const input = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      out[key] = canonicalizeForHash(input[key]);
    }
    return out;
  }
  return value;
}

/** Stable SHA-256 hex of the activity JSON (sorted keys). */
export function activityContentHash(activity: LoActivity): string {
  const canonical = JSON.stringify(canonicalizeForHash(activity));
  return createHash("sha256").update(canonical).digest("hex");
}
