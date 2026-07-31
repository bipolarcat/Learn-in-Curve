export const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
export const PMQ_SLUG = "pmq-in-5-days";
/**
 * @deprecated Entitlement is now a tier — see `PMQ_PAID_TIERS` in ./tiers.ts.
 * The single 'ai_tutor' row was migrated to 'ai_pro' on 2026-07-30
 * (20260730170000_entitlement_tiers.sql) and the CHECK constraint no longer
 * permits this value. Kept only so any stale import fails loudly at review
 * rather than silently querying for rows that can't exist.
 */
export const AI_TUTOR_FEATURE = "ai_tutor";

// Launch flag: the AI tutor's chat/grounding experience isn't built yet — only
// the paid unlock UI and Stripe checkout exist. Keep this false so the panel
// shows "Coming soon" and never triggers a real charge for a feature that
// doesn't functionally exist yet. Flip to true only once the tutor itself
// ships (see BUSINESS_STATE.md, 2026-07-06 decision).
// Flipped true 2026-07-09 for Sim's local trial of the LIC-42 backend
// (Stripe is in test-mode here, so no real-charge risk) — flip back to
// false, or gate properly, before any real deploy per LIC-49/50/51.
export const AI_TUTOR_LAUNCHED = true;

export function pmqLoHref(loNumber: number): string {
  return `/courses/${PMQ_SLUG}/lo/${loNumber}`;
}

/** Course overview + LO + mock study pages (header scrolls away; hide Home chip). */
export function isPmqStudySurface(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === `/courses/${PMQ_SLUG}` ||
    pathname.startsWith(`/courses/${PMQ_SLUG}/lo/`) ||
    pathname.startsWith(`/courses/${PMQ_SLUG}/mock`)
  );
}

export function pmqMockHref(
  tier?: "lite" | "full",
  examSet?: 1 | 2 | 3 | 4,
): string {
  if (!tier) return `/courses/${PMQ_SLUG}/mock`;
  const resolvedSet = examSet ?? (tier === "lite" ? 1 : 2);
  return `/courses/${PMQ_SLUG}/mock?tier=${tier}&exam=${resolvedSet}`;
}

export const PMQ_SECTION_COUNT = 24;

/** Authoritative day→LO grouping — matches PMQ in 5 days/scripts/app.js DAY_LOS. */
export const PMQ_DAY_LOS: Record<number, readonly number[]> = {
  1: [1, 2, 3, 4, 5],
  2: [6, 7, 8, 9, 10],
  3: [11, 12, 13, 14, 15],
  4: [16, 17, 18, 19, 20],
  5: [21, 22, 23, 24],
} as const;

/** First LO of each day — theme label source on the live site (DAY_THEME_LO). */
export const PMQ_DAY_THEME_LO: Record<number, number> = {
  1: 1,
  2: 6,
  3: 11,
  4: 16,
  5: 21,
};

export function getDayForLo(loNumber: number): number {
  for (const [day, los] of Object.entries(PMQ_DAY_LOS)) {
    if (los.includes(loNumber)) return Number(day);
  }
  return Math.ceil(loNumber / 5);
}

/** Day labels — no theme names (Foundations, Planning, etc.). */
export const PMQ_DAY_LABELS: Record<number, string> = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

export function getDayLabel(dayNumber: number): string {
  return PMQ_DAY_LABELS[dayNumber] ?? `Day ${dayNumber}`;
}

/** Canonical LO titles (match content JSON). */
export const PMQ_LO_TITLES: Record<number, string> = {
  1: "Life cycles",
  2: "Governance Arrangements",
  3: "Sustainability",
  4: "Business Case",
  5: "Procurement",
  6: "Reviews",
  7: "Assurance",
  8: "Transition Management",
  9: "Benefits Management",
  10: "Stakeholder Engagement and Communications Management",
  11: "Conflict Resolution",
  12: "Leadership",
  13: "Team Management",
  14: "Diversity and Inclusion",
  15: "Ethics, Compliance and Professionalism",
  16: "Requirements Management",
  17: "Solutions Development",
  18: "Quality Management",
  19: "Integrated Planning",
  20: "Schedule Management",
  21: "Resource Management",
  22: "Budgeting and Cost Control",
  23: "Risk and Issue Management",
  24: "Change Control",
};

export type LoMediaAsset = {
  /** Public URL, or null when the file is not ready yet (placeholder UI). */
  src: string | null;
  /** Static poster JPEG for player + free-tier lock (no MP4 fetch when locked). */
  posterSrc: string | null;
  /** WebVTT captions when available. */
  captionsSrc: string | null;
  title: string;
  sectionTitle: string;
};

function padLo(n: number): string {
  return String(n).padStart(2, "0");
}

/** Explainer videos per LO — files live at `/videos/pmq/lo-NN.mp4`. */
export const PMQ_LO_EXPLAINER_VIDEOS: Record<number, LoMediaAsset> =
  Object.fromEntries(
    Array.from({ length: PMQ_SECTION_COUNT }, (_, i) => {
      const lo = i + 1;
      const title = PMQ_LO_TITLES[lo] ?? `Learning Objective ${lo}`;
      const pad = padLo(lo);
      return [
        lo,
        {
          src: `/videos/pmq/lo-${pad}.mp4`,
          posterSrc: `/videos/pmq/posters/lo-${pad}.jpg`,
          captionsSrc: null,
          title: `${title} — video overview`,
          sectionTitle: `${title} · Video`,
        } satisfies LoMediaAsset,
      ];
    }),
  ) as Record<number, LoMediaAsset>;

/** Audio overviews per LO — NotebookLM m4a in `public/audio/pmq/lo-NN.m4a`. */
export const PMQ_LO_AUDIO_OVERVIEWS: Record<number, LoMediaAsset> =
  Object.fromEntries(
    Array.from({ length: PMQ_SECTION_COUNT }, (_, i) => {
      const lo = i + 1;
      const title = PMQ_LO_TITLES[lo] ?? `Learning Objective ${lo}`;
      const readySrc = `/audio/pmq/lo-${padLo(lo)}.m4a`;
      return [
        lo,
        {
          src: readySrc,
          posterSrc: null,
          captionsSrc: null,
          title: `${title} — audio overview`,
          sectionTitle: `${title} · Audio`,
        } satisfies LoMediaAsset,
      ];
    }),
  ) as Record<number, LoMediaAsset>;

export function formatGbp(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
