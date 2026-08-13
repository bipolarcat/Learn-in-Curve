/**
 * Display titles for PFQ outcomes/objectives.
 * Source of truth: PFQ in 2 days/pfq-outcome-titles.json — do not invent strings.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

type TitlesFile = {
  objectives: Record<string, string>;
  outcomes: Record<string, string>;
};

const raw = JSON.parse(
  readFileSync(
    join(process.cwd(), "PFQ in 2 days", "pfq-outcome-titles.json"),
    "utf8",
  ),
) as TitlesFile;

export function pfqObjectiveDisplayTitle(objective: number): string {
  return (
    raw.objectives[String(objective)] ?? `Objective ${objective}`
  );
}

export function pfqOutcomeDisplayTitle(code: string): string {
  return raw.outcomes[code] ?? `Outcome ${code}`;
}
