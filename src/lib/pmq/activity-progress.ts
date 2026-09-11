"use server";

import { createClient } from "@/lib/supabase/server";
import { activityContentHash } from "@/lib/pmq/activity-content-hash";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import { getPmqTier } from "@/lib/pmq/queries";
import { canAccessRecallActivities } from "@/lib/pmq/tiers";
import type { LoActivity } from "@/types/pmq";

export type ActivityInputMode = "drag" | "tap";
export type ActivityDevice = "mobile" | "desktop";
export type ActivityOutcome = "completed" | "abandoned";

export type StartActivityAttemptResult = {
  attemptId: string;
  totalWrongTurns: number;
  attemptNumber: number;
};

export type RecordWrongTurnInput = {
  attemptId: string;
  item: string | null;
  chosen: string | null;
  expected: string | null;
  detail?: Record<string, unknown> | null;
  msSinceStart: number | null;
};

async function requireRecallUser(courseId: string = PMQ_COURSE_ID) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "not_signed_in" as const, supabase: null, userId: null };
  }
  const tier = await getPmqTier(supabase, user.id, courseId);
  if (!canAccessRecallActivities(tier)) {
    return { error: "locked" as const, supabase: null, userId: null };
  }
  return { error: null, supabase, userId: user.id };
}

export async function startActivityAttempt(input: {
  activity: LoActivity;
  courseId?: string;
  loNumber: number;
  inputMode: ActivityInputMode;
  device: ActivityDevice;
}): Promise<
  | { ok: true; data: StartActivityAttemptResult }
  | { ok: false; error: string }
> {
  const courseId = input.courseId ?? PMQ_COURSE_ID;
  const gate = await requireRecallUser(courseId);
  if (gate.error || !gate.supabase) {
    return { ok: false, error: gate.error ?? "unavailable" };
  }

  const contentHash = activityContentHash(input.activity);
  const { data, error } = await gate.supabase.rpc("start_activity_attempt", {
    p_activity_id: input.activity.id,
    p_activity_type: input.activity.type,
    p_course_id: courseId,
    p_lo_number: input.loNumber,
    p_heading: input.activity.heading,
    p_content_hash: contentHash,
    p_input_mode: input.inputMode,
    p_device: input.device,
  });

  if (error) {
    console.error("start_activity_attempt failed:", error.message);
    return { ok: false, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.attempt_id) {
    return { ok: false, error: "no_attempt" };
  }

  // attempt_number lives on the row we just inserted — fetch lightly for analytics.
  const { data: attemptRow } = await gate.supabase
    .from("activity_attempts")
    .select("attempt_number")
    .eq("id", row.attempt_id)
    .maybeSingle();

  return {
    ok: true,
    data: {
      attemptId: row.attempt_id as string,
      totalWrongTurns: Number(row.total_wrong_turns ?? 0),
      attemptNumber: Number(attemptRow?.attempt_number ?? 1),
    },
  };
}

export async function recordWrongTurn(
  input: RecordWrongTurnInput,
): Promise<
  | { ok: true; totalWrongTurns: number }
  | { ok: false; error: string }
> {
  const gate = await requireRecallUser();
  if (gate.error || !gate.supabase) {
    return { ok: false, error: gate.error ?? "unavailable" };
  }

  const { data, error } = await gate.supabase.rpc("record_activity_wrong_turn", {
    p_attempt_id: input.attemptId,
    p_item: input.item,
    p_chosen: input.chosen,
    p_expected: input.expected,
    p_detail: input.detail ?? null,
    p_ms_since_start: input.msSinceStart,
  });

  if (error) {
    console.error("record_activity_wrong_turn failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, totalWrongTurns: Number(data ?? 0) };
}

export async function finishActivityAttempt(input: {
  attemptId: string;
  outcome: ActivityOutcome;
  moves: number;
  durationMs: number | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireRecallUser();
  if (gate.error || !gate.supabase) {
    return { ok: false, error: gate.error ?? "unavailable" };
  }

  const { error } = await gate.supabase.rpc("finish_activity_attempt", {
    p_attempt_id: input.attemptId,
    p_outcome: input.outcome,
    p_moves: input.moves,
    p_duration_ms: input.durationMs,
  });

  if (error) {
    console.error("finish_activity_attempt failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
