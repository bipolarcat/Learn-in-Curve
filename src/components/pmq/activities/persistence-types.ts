import type { LoActivity } from "@/types/pmq";

export type ActivityWrongTurnDetail = {
  item: string | null;
  chosen: string | null;
  expected: string | null;
  detail?: Record<string, unknown> | null;
};

/** Persistence props shared by Pair up / Lineup / Group up. */
export type ActivityPersistenceProps = {
  /** Lifetime wrong-turn total (optimistic + saved). */
  wrongTurns: number;
  /** Called on every wrong answer; parent persists + analytics. */
  onWrongTurn: (detail: ActivityWrongTurnDetail) => void;
  /** Called once when the learner finishes successfully. */
  onComplete: (moves: number) => void;
};

export type ActivityPlayMeta = {
  activity: LoActivity;
  loNumber: number;
  courseId: string;
};
