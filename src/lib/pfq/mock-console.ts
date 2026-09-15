/**
 * Overview-console helpers for PFQ timed mock papers.
 * Mirrors PMQ mockExamSelectorState / console timer, adapted to a single
 * continuous sitting (no break / parts).
 */

import { PFQ_DURATION_SECONDS } from "@/lib/pfq/outcomes";
import { PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import type { PfqMockSet } from "@/lib/pfq/generator";
import type { PfqMockSetSummary } from "@/lib/pfq/actions";

/** PFQ sitting is 60 minutes — MM:SS, no hours. */
export function formatPfqExamClock(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function emptyPfqMockSummary(mockSet: PfqMockSet): PfqMockSetSummary {
  return {
    mockSet,
    activeAttemptId: null,
    endsAt: null,
    latestAttemptId: null,
    lastScore: null,
    lastSubmittedAt: null,
    passed: false,
  };
}

export function pfqEndsAtFromStart(startedAt: string): string {
  return new Date(
    new Date(startedAt).getTime() + PFQ_DURATION_SECONDS * 1000,
  ).toISOString();
}

export function pfqMockConsoleSecondsRemaining(
  summary: PfqMockSetSummary,
  now = Date.now(),
): number | null {
  if (!summary.activeAttemptId || !summary.endsAt) return null;
  return Math.max(
    0,
    Math.ceil((new Date(summary.endsAt).getTime() - now) / 1000),
  );
}

export type PfqMockSelectorState = {
  /** Null when never started — Start button is enough. */
  status: string | null;
  tone: "done" | "open" | "plain";
  action: string;
  enabled: boolean;
  href: string;
};

/**
 * PMQ-parity row state for a PFQ paper.
 * `activeOtherSet` blocks starting a second paper while one is in progress.
 */
export function pfqMockSelectorState(
  summary: PfqMockSetSummary,
  activeOtherSet: PfqMockSet | null,
): PfqMockSelectorState {
  if (summary.activeAttemptId) {
    return {
      status: "In progress",
      tone: "open",
      action: "Resume",
      enabled: true,
      href: `${PFQ_MOCK_HREF}/${summary.activeAttemptId}`,
    };
  }

  if (summary.latestAttemptId) {
    return {
      status: summary.passed ? "Passed" : "Completed · Refer",
      tone: summary.passed ? "done" : "plain",
      action: "View result",
      enabled: true,
      href: `${PFQ_MOCK_HREF}/${summary.latestAttemptId}`,
    };
  }

  if (activeOtherSet != null && activeOtherSet !== summary.mockSet) {
    return {
      status: null,
      tone: "plain",
      action: `Finish exam ${activeOtherSet} first`,
      enabled: false,
      href: `${PFQ_MOCK_HREF}?set=${summary.mockSet}`,
    };
  }

  return {
    status: null,
    tone: "plain",
    action: "Start",
    enabled: true,
    href: `${PFQ_MOCK_HREF}?set=${summary.mockSet}`,
  };
}
