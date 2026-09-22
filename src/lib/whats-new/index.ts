import type { ReleaseNote } from "@/content/whats-new";

/** Nav New chips expire after this many days so dormant returns stay meaningful. */
export const MAX_BADGE_AGE_DAYS = 30;

const MS_PER_DAY = 86_400_000;

function parseIso(value: string | null | undefined): number {
  if (value == null || value === "") return Number.NaN;
  const t = Date.parse(value);
  return Number.isNaN(t) ? Number.NaN : t;
}

/** Missing or unparseable seenAt → epoch (treat notes as unseen). */
function seenAtMs(seenAtIso: string | null | undefined): number {
  const t = parseIso(seenAtIso);
  return Number.isNaN(t) ? 0 : t;
}

function nowMs(nowIso: string): number {
  const t = parseIso(nowIso);
  return Number.isNaN(t) ? Date.now() : t;
}

function isUnseen(note: ReleaseNote, seenMs: number): boolean {
  const publishedMs = parseIso(note.publishedAt);
  if (Number.isNaN(publishedMs)) return false;
  return publishedMs > seenMs;
}

function withinBadgeAge(note: ReleaseNote, now: number): boolean {
  const publishedMs = parseIso(note.publishedAt);
  if (Number.isNaN(publishedMs)) return false;
  return now - publishedMs <= MAX_BADGE_AGE_DAYS * MS_PER_DAY;
}

export function unseenNotes(
  notes: readonly ReleaseNote[],
  seenAtIso: string | null | undefined,
  nowIso: string,
): ReleaseNote[] {
  void nowIso;
  const seenMs = seenAtMs(seenAtIso);
  return notes.filter((note) => isUnseen(note, seenMs));
}

/** Nav hrefs that should show a New chip (unseen and within MAX_BADGE_AGE_DAYS). */
export function newBadgeHrefs(
  notes: readonly ReleaseNote[],
  seenAtIso: string | null | undefined,
  nowIso: string,
): string[] {
  const seenMs = seenAtMs(seenAtIso);
  const now = nowMs(nowIso);
  const hrefs = new Set<string>();
  for (const note of notes) {
    if (!isUnseen(note, seenMs)) continue;
    if (!withinBadgeAge(note, now)) continue;
    for (const href of note.badgeHrefs ?? []) {
      hrefs.add(href);
    }
  }
  return [...hrefs];
}
