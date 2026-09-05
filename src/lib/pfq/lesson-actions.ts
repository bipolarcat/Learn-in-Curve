"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqLessons } from "@/lib/pfq/tiers";
import {
  PFQ_COURSE_ID,
  PFQ_LEARN_HREF,
  PFQ_LESSONS_ENABLED,
} from "@/lib/pfq/constants";
import { pfqSectionId } from "@/lib/pfq/section-ids";
import { getPfqLesson } from "@/lib/pfq/content";
import {
  PFQ_STAGE_REACHED_COLUMN,
  getPfqReachedCountFromProgress,
  getPfqReachedStageIds,
  PFQ_PROGRESS_UNIT_PERCENT,
  type PfqStageId,
  type PfqStageSignals,
} from "@/lib/pfq/lesson-stages";

/**
 * Checkpoint progress for PFQ objectives.
 *
 * Product rule (2026-08-13): lesson checkpoints do NOT write
 * pfq_coverage_signals. Coverage headline stays measured (practice/mock only).
 * Objective completion is tracked separately via section_progress.
 *
 * Reset clears BOTH completed_at and checklist_state (OPERATIONS.md gotcha).
 */

async function requirePfqLessonUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  if (!PFQ_LESSONS_ENABLED) {
    return { ok: false, error: "Lessons are not enabled yet." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqLessons(tier)) {
    return { ok: false, error: "PFQ Pro is required." };
  }
  return { ok: true, userId: user.id };
}

function revalidateLesson(objective: number) {
  revalidatePath(PFQ_LEARN_HREF);
  revalidatePath(`${PFQ_LEARN_HREF}/${objective}`);
}

/**
 * Persist that the learner left a pathway stage (orient / learn / apply / drill).
 * Idempotent. Does not touch pfq_coverage_signals.
 */
export async function markPfqStageReached(input: {
  objective: number;
  stageId: PfqStageId;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const column = PFQ_STAGE_REACHED_COLUMN[input.stageId];
    if (!column) return { ok: true };

    const access = await requirePfqLessonUser();
    if (!access.ok) return access;

    const lesson = getPfqLesson(input.objective);
    if (!lesson) return { ok: false, error: "Unknown objective." };

    const sectionId = pfqSectionId(input.objective);
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("section_progress")
      .select(`id, ${column}`)
      .eq("user_id", access.userId)
      .eq("section_id", sectionId)
      .maybeSingle();

    const existingRow = existing as { id?: string; [key: string]: unknown } | null;
    if (existingRow && existingRow[column]) {
      return { ok: true };
    }

    const now = new Date().toISOString();
    if (existingRow?.id) {
      const { error } = await supabase
        .from("section_progress")
        .update({ [column]: now, updated_at: now, course_id: PFQ_COURSE_ID })
        .eq("id", existingRow.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("section_progress").insert({
        user_id: access.userId,
        section_id: sectionId,
        course_id: PFQ_COURSE_ID,
        checklist_state: [],
        [column]: now,
        updated_at: now,
      });
      if (error) throw error;
    }

    revalidateLesson(input.objective);
    return { ok: true };
  } catch (err) {
    console.error("[pfq] markStageReached", err);
    return { ok: false, error: "Couldn’t save stage progress." };
  }
}

export async function updatePfqCheckpoint(input: {
  objective: number;
  checkpointIndex: number;
  checked: boolean;
}): Promise<
  | { ok: true; checklist_state: number[]; completed: boolean }
  | { ok: false; error: string }
> {
  try {
    const access = await requirePfqLessonUser();
    if (!access.ok) return access;

    const lesson = getPfqLesson(input.objective);
    if (!lesson) return { ok: false, error: "Unknown objective." };

    const total = lesson.progress_checkpoint.length;
    if (
      !Number.isInteger(input.checkpointIndex) ||
      input.checkpointIndex < 0 ||
      input.checkpointIndex >= total
    ) {
      return { ok: false, error: "Invalid checkpoint." };
    }

    const sectionId = pfqSectionId(input.objective);
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("section_progress")
      .select("id, checklist_state, completed_at")
      .eq("user_id", access.userId)
      .eq("section_id", sectionId)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const current = new Set<number>(
      Array.isArray(existing?.checklist_state)
        ? (existing.checklist_state as number[])
        : [],
    );
    if (input.checked) current.add(input.checkpointIndex);
    else current.delete(input.checkpointIndex);

    const checklist_state = Array.from(current).sort((a, b) => a - b);
    const allDone = checklist_state.length >= total && total > 0;
    const now = new Date().toISOString();

    // Completing sets completed_at; unticking any item clears it (both signals).
    const patch = {
      checklist_state,
      completed_at: allDone ? (existing?.completed_at ?? now) : null,
      updated_at: now,
      course_id: PFQ_COURSE_ID,
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("section_progress")
        .update(patch)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("section_progress").insert({
        user_id: access.userId,
        section_id: sectionId,
        ...patch,
      });
      if (error) throw error;
    }

    revalidateLesson(input.objective);
    return { ok: true, checklist_state, completed: allDone };
  } catch (err) {
    console.error("[pfq] updateCheckpoint", err);
    return {
      ok: false,
      error:
        "Couldn’t save checkpoint. Apply the PFQ sections migration if this is a fresh DB.",
    };
  }
}

/** Clears checklist_state AND completed_at together. */
export async function resetPfqObjectiveProgress(input: {
  objective: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const access = await requirePfqLessonUser();
    if (!access.ok) return access;

    const lesson = getPfqLesson(input.objective);
    if (!lesson) return { ok: false, error: "Unknown objective." };

    const sectionId = pfqSectionId(input.objective);
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("section_progress")
      .select("id")
      .eq("user_id", access.userId)
      .eq("section_id", sectionId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("section_progress")
        .update({
          checklist_state: [],
          completed_at: null,
          updated_at: now,
        })
        .eq("id", existing.id);
      if (error) throw error;
    }

    revalidateLesson(input.objective);
    return { ok: true };
  } catch (err) {
    console.error("[pfq] resetProgress", err);
    return { ok: false, error: "Couldn’t reset progress." };
  }
}

export async function getPfqLessonProgressMap(
  userId: string,
): Promise<
  Record<
    number,
    { checklist_state: number[]; completed: boolean; checked: number; total: number }
  >
> {
  const supabase = await createClient();
  const sectionIds = Array.from({ length: 10 }, (_, i) => pfqSectionId(i + 1));
  const { data } = await supabase
    .from("section_progress")
    .select("section_id, checklist_state, completed_at")
    .eq("user_id", userId)
    .in("section_id", sectionIds);

  const bySection = new Map(
    (data ?? []).map((row) => [row.section_id as string, row]),
  );

  const out: Record<
    number,
    { checklist_state: number[]; completed: boolean; checked: number; total: number }
  > = {};

  for (let n = 1; n <= 10; n += 1) {
    const lesson = getPfqLesson(n);
    const total = lesson?.progress_checkpoint.length ?? 0;
    const row = bySection.get(pfqSectionId(n));
    const checklist_state = Array.isArray(row?.checklist_state)
      ? (row!.checklist_state as number[])
      : [];
    const completed = Boolean(row?.completed_at) ||
      (total > 0 && checklist_state.length >= total);
    out[n] = {
      checklist_state,
      completed,
      checked: checklist_state.length,
      total,
    };
  }
  return out;
}

/**
 * Dashboard card resume + % for PFQ (10 objectives × pathway stages).
 * Does not write; safe for the dashboard server render.
 */
export async function getPfqDashboardCardState(userId: string): Promise<{
  completionPercent: number;
  nextObjective: number | null;
  nextStarted: boolean;
}> {
  const supabase = await createClient();
  const sectionIds = Array.from({ length: 10 }, (_, i) => pfqSectionId(i + 1));
  const { data } = await supabase
    .from("section_progress")
    .select(
      "section_id, checklist_state, completed_at, orient_reached_at, learn_reached_at, apply_reached_at, quiz_completed_at",
    )
    .eq("user_id", userId)
    .in("section_id", sectionIds);

  const bySection = new Map(
    (data ?? []).map((row) => [row.section_id as string, row]),
  );

  let reachedUnits = 0;
  let nextObjective: number | null = null;
  let nextStarted = false;

  for (let n = 1; n <= 10; n += 1) {
    const lesson = getPfqLesson(n);
    const total = lesson?.progress_checkpoint.length ?? 0;
    const row = bySection.get(pfqSectionId(n)) as PfqStageSignals & {
      checklist_state?: number[] | null;
      completed_at?: string | null;
    } | undefined;
    reachedUnits += getPfqReachedCountFromProgress(row ?? null);

    const checklist = Array.isArray(row?.checklist_state)
      ? row!.checklist_state!
      : [];
    const completed =
      Boolean(row?.completed_at) || (total > 0 && checklist.length >= total);

    if (!completed && nextObjective == null) {
      nextObjective = n;
      nextStarted = getPfqReachedStageIds(row ?? null).length > 0;
    }
  }

  return {
    completionPercent: Math.min(100, reachedUnits * PFQ_PROGRESS_UNIT_PERCENT),
    nextObjective,
    nextStarted,
  };
}
