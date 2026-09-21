export type ReleaseNote = {
  /** Stable slug, never reused. Used as the analytics property and the anchor id. */
  id: string;
  /** ISO date, publication date, not build date. */
  publishedAt: string;
  title: string;
  /** One or two plain sentences. No marketing claims about outcomes. */
  body: string;
  /** Where the feature lives. */
  href: string;
  /** Banner and changelog CTA label. */
  cta: string;
  /** Nav hrefs that get a New chip while this note is unseen. */
  badgeHrefs?: readonly string[];
};

/**
 * Release notes — keep sorted newest first.
 * Adding a future feature is one object in this array and nothing else.
 */
export const RELEASE_NOTES: readonly ReleaseNote[] = [
  {
    id: "2026-09-the-shelf",
    publishedAt: "2026-09-18",
    title: "The Shelf",
    body: "Every practice question in one browsable place, grouped by learning objective.",
    href: "/library",
    cta: "Open The Shelf",
    badgeHrefs: ["/library"],
  },
  {
    id: "2026-09-mock-me",
    publishedAt: "2026-09-14",
    title: "Mock Me",
    body: "Free mock exams for APM PMQ, APM PFQ and PMP, with a readiness score at the end.",
    href: "/mock-me",
    cta: "Try a free mock",
    badgeHrefs: ["/mock-me"],
  },
];
