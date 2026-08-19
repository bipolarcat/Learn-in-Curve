/**
 * Allowlist of markdown tables that become tap-to-order sequences.
 *
 * This is not a detector. Across the course, table headers collide and shapes
 * are too varied for a classifier. An unrecognised table must keep the current
 * static render. Silent degradation is the required failure mode.
 *
 * Identity is lo number + outcome code + first body cell of column one.
 * Header text is not enough: LO1 1a has two "Phase | What happens" tables.
 */

export const INTERACTIVE_TABLES_ENABLED = true;

export type InteractiveTableMode = "sequence";

type SequenceAllowEntry = {
  loNumber: number;
  outcomeCode: string;
  firstCell: string;
  mode: InteractiveTableMode;
};

export const INTERACTIVE_SEQUENCE_TABLES: readonly SequenceAllowEntry[] = [
  {
    loNumber: 1,
    outcomeCode: "1a",
    firstCell: "Concept",
    mode: "sequence",
  },
  {
    loNumber: 1,
    outcomeCode: "1a",
    firstCell: "Pre-project and feasibility",
    mode: "sequence",
  },
];

export function normaliseTableCell(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

export function matchSequenceTable(
  loNumber: number | null,
  outcomeCode: string,
  firstCell: string,
): boolean {
  if (!INTERACTIVE_TABLES_ENABLED || loNumber == null) return false;
  const cell = normaliseTableCell(firstCell);
  const outcome = outcomeCode.trim().toLowerCase();
  return INTERACTIVE_SEQUENCE_TABLES.some(
    (entry) =>
      entry.loNumber === loNumber &&
      entry.outcomeCode === outcome &&
      entry.firstCell === cell,
  );
}

/** Deterministic permutation so SSR and hydration match. Never identity. */
export function shuffleIndices(length: number, seed: number): number[] {
  const idx = Array.from({ length }, (_, i) => i);
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return s / 4294967296;
  };
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = idx[i]!;
    const b = idx[j]!;
    idx[i] = b;
    idx[j] = a;
  }
  if (idx.every((v, i) => v === i)) return shuffleIndices(length, seed + 7);
  return idx;
}

export function seedFromLabels(labels: readonly string[]): number {
  const raw = labels.join("\0");
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
