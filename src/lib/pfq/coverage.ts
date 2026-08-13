import {
  PFQ_OBJECTIVES,
  PFQ_OUTCOME_COUNT,
  outcomeTitle,
} from "./outcomes.ts";
import type {
  PfqCoverageOutcome,
  PfqCoverageSignal,
  PfqObjectiveResult,
} from "./types.ts";

/**
 * Build the 59-outcome coverage map from stored signals.
 * Missing outcomes stay unattempted. Signals already encode most-recent-wins.
 */
export function buildCoverageFromSignals(
  signals: PfqCoverageSignal[],
): {
  headlineCorrect: number;
  outcomeCount: number;
  coverage: PfqCoverageOutcome[];
  objectives: PfqObjectiveResult[];
} {
  const byOutcome = new Map(
    signals.map((s) => [s.learning_outcome, s] as const),
  );

  const coverage: PfqCoverageOutcome[] = [];
  for (const obj of PFQ_OBJECTIVES) {
    for (const code of obj.outcomes) {
      const signal = byOutcome.get(code);
      let state: PfqCoverageOutcome["state"] = "unattempted";
      if (signal) state = signal.correct ? "correct" : "incorrect";
      coverage.push({
        code,
        title: outcomeTitle(code),
        objective: obj.objective,
        day: obj.day,
        state,
        marks: 1,
      });
    }
  }

  const headlineCorrect = coverage.filter((c) => c.state === "correct").length;

  const objectives: PfqObjectiveResult[] = PFQ_OBJECTIVES.map((obj) => {
    const chips = coverage.filter((c) => c.objective === obj.objective);
    const scored = chips.filter((c) => c.state === "correct").length;
    return {
      objective: obj.objective,
      title: obj.title,
      day: obj.day,
      available: chips.length,
      scored,
    };
  });

  return {
    headlineCorrect,
    outcomeCount: PFQ_OUTCOME_COUNT,
    coverage,
    objectives,
  };
}
