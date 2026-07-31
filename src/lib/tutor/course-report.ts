/**
 * Course completion report meters + helpers (LIC-65).
 * Thresholds confirmed Sim 2026-07-28 — do not change without product sign-off.
 */

export type MeterTier =
  | "not_enough_data"
  | "weak"
  | "developing"
  | "strong";

export type PerLoMeter = {
  loNumber: number;
  wrongCount: number;
  totalCount: number;
  tier: MeterTier;
};

export type WeakLoNote = {
  loNumber: number;
  note: string;
};

export type CourseReportPayload = {
  chatMessage: string;
  keyTakeaways: string[];
  weakLoNotes: WeakLoNote[];
  improvementTips: string[];
};

/** <3 attempts = not enough data; <65% = weak; 65–79% = developing; 80%+ = strong. */
export function bucketLo(wrongCount: number, totalCount: number): MeterTier {
  if (totalCount < 3) return "not_enough_data";
  const pctCorrect = ((totalCount - wrongCount) / totalCount) * 100;
  if (pctCorrect < 65) return "weak";
  if (pctCorrect < 80) return "developing";
  return "strong";
}

/**
 * Parse a leading LO number out of `learning_objective` values. Real data in
 * this app is APM sub-point lo_code strings like "1a, 1b, 1c, 1d" or
 * "12a, 12b, 12c" (confirmed against `PMQ in 5 days/content/lo*.json` and
 * live `attempts` rows, 2026-07-28) — the number is always at the START,
 * never the end, so a trailing-digit match (the original implementation)
 * never matched anything and silently dropped every real row. "LO1"/"1"
 * style bare-number inputs still work fine with a leading match.
 */
export function parseLoNumber(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,2})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > 24) return null;
  return n;
}

/**
 * Build one meter row per LO 1–24 from course weak-area aggregates.
 * LOs with no attempts → not_enough_data (0/0).
 */
export function buildPerLoMeters(
  areas: { learningObjective: string; wrongCount: number; totalCount: number }[],
): PerLoMeter[] {
  const byLo = new Map<number, { wrongCount: number; totalCount: number }>();
  for (const a of areas) {
    const lo = parseLoNumber(a.learningObjective);
    if (lo == null) continue;
    const prev = byLo.get(lo) ?? { wrongCount: 0, totalCount: 0 };
    byLo.set(lo, {
      wrongCount: prev.wrongCount + a.wrongCount,
      totalCount: prev.totalCount + a.totalCount,
    });
  }

  const out: PerLoMeter[] = [];
  for (let loNumber = 1; loNumber <= 24; loNumber++) {
    const stats = byLo.get(loNumber) ?? { wrongCount: 0, totalCount: 0 };
    out.push({
      loNumber,
      wrongCount: stats.wrongCount,
      totalCount: stats.totalCount,
      tier: bucketLo(stats.wrongCount, stats.totalCount),
    });
  }
  return out;
}

export function meterBarFill(tier: MeterTier): number {
  switch (tier) {
    case "not_enough_data":
      return 0.12;
    case "weak":
      return 0.35;
    case "developing":
      return 0.62;
    case "strong":
      return 1;
  }
}

export function meterTierLabel(tier: MeterTier): string {
  switch (tier) {
    case "not_enough_data":
      return "Not enough data";
    case "weak":
      return "Weak";
    case "developing":
      return "Developing";
    case "strong":
      return "Strong";
  }
}

/** Hex colours for PDF / UI — rust / gold / olive / grey. */
export function meterTierColor(tier: MeterTier): string {
  switch (tier) {
    case "not_enough_data":
      return "#9A8B78";
    case "weak":
      return "#B3341C";
    case "developing":
      return "#D9A441";
    case "strong":
      return "#5F7A3D";
  }
}

export const COURSE_REPORT_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    chatMessage: {
      type: "STRING",
      description:
        "LIC-52-style course-completion prose for the tutor chat. Mention the downloadable report is ready. British English, no markdown headings.",
    },
    keyTakeaways: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3-5 short key takeaways grounded in the quiz numbers provided.",
    },
    weakLoNotes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          loNumber: { type: "INTEGER" },
          note: { type: "STRING" },
        },
        required: ["loNumber", "note"],
      },
      description:
        "One short note per LO that is weak or developing only — never invent scores.",
    },
    improvementTips: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Up to 5 practical improvement tips.",
    },
  },
  required: ["chatMessage", "keyTakeaways", "weakLoNotes", "improvementTips"],
} as const;

export function parseCourseReportPayload(raw: string): CourseReportPayload {
  const data = JSON.parse(raw) as Partial<CourseReportPayload>;
  if (typeof data.chatMessage !== "string" || !data.chatMessage.trim()) {
    throw new Error("Invalid report JSON: missing chatMessage");
  }
  const keyTakeaways = Array.isArray(data.keyTakeaways)
    ? data.keyTakeaways.filter((s): s is string => typeof s === "string").slice(0, 5)
    : [];
  if (keyTakeaways.length < 1) {
    throw new Error("Invalid report JSON: keyTakeaways empty");
  }
  const weakLoNotes = Array.isArray(data.weakLoNotes)
    ? data.weakLoNotes
        .map((n) => {
          if (!n || typeof n !== "object") return null;
          const loNumber = Number((n as WeakLoNote).loNumber);
          const note = (n as WeakLoNote).note;
          if (!Number.isInteger(loNumber) || typeof note !== "string") return null;
          return { loNumber, note: note.trim() };
        })
        .filter((n): n is WeakLoNote => n != null && n.note.length > 0)
    : [];
  const improvementTips = Array.isArray(data.improvementTips)
    ? data.improvementTips
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];
  return {
    chatMessage: data.chatMessage.trim(),
    keyTakeaways,
    weakLoNotes,
    improvementTips,
  };
}
