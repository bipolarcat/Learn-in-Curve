/**
 * Generic pathway stage helpers — course-agnostic unlock/seal logic.
 * PMQ stage ids and the 24×7 progress unit constant stay in `lo-stages.ts`.
 */

export type CourseStageDef<TId extends string = string> = {
  id: TId;
  label: string;
  continueLabel: string;
};

/**
 * Pathway icons may open any stage the learner has already been on, not only
 * stages they left via Next. `doneIds` is Continue-off; `visitedIds` is every
 * current stage they have landed on (including the frontier they have not
 * Next'd away from yet).
 */
export function collectUnlockedStages<TId extends string>(
  stageIds: readonly TId[],
  doneIds: ReadonlySet<TId>,
  visitedIds: ReadonlySet<TId>,
  currentId: TId,
  sealed: boolean,
): Set<TId> {
  if (sealed) return new Set(stageIds);
  const next = new Set(doneIds);
  for (const id of visitedIds) next.add(id);
  next.add(currentId);
  return next;
}

/** Seal when the checklist is done (quiz no longer gates complete). */
export function canSealCourse(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): boolean {
  if (input.checkpointTotal <= 0) return true;
  return input.completedCheckpointCount >= input.checkpointTotal;
}

export function sealBlockedReason(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): string | null {
  if (canSealCourse(input)) return null;
  return "Finish the checklist to mark this LO complete.";
}

export function buildStageContinueLabels<TId extends string>(
  order: readonly TId[],
  meta: Record<TId, { label: string; continueLabel: string }>,
): CourseStageDef<TId>[] {
  return order.map((id, index) => {
    const next = order[index + 1];
    let continueLabel = meta[id].continueLabel;
    const isLast = index === order.length - 1;
    if (next && !isLast) {
      continueLabel = `Continue to ${meta[next].label}`;
    }
    return {
      id,
      label: meta[id].label,
      continueLabel,
    };
  });
}
