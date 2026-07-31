/**
 * Shared Pro / free-tier selling points — keep catalogue + dashboard in sync.
 * Source of truth for feature facts: FEATURES.md (project root).
 */

export type ProIncludedIcon = "sly" | "video" | "report" | "questions" | "mock";

export const PRO_INCLUDED: {
  title: string;
  body: string;
  icon: ProIncludedIcon;
}[] = [
  {
    title: "Meet Sly",
    body: "Your AI tutor, on call — exam-focused answers that get you to a pass.",
    icon: "sly",
  },
  {
    title: "800+ questions",
    body: "Unlock the full bank — every extra quiz set across all 24 LOs.",
    icon: "questions",
  },
  {
    title: "AI-marked written answers",
    body: "Every short and long answer graded. No self-scoring.",
    icon: "mock",
  },
  {
    title: "End-of-course report",
    body: "Your weak spots, spelled out before exam day.",
    icon: "report",
  },
  {
    title: "Video + audio per LO",
    body: "A video and audio recap for every single learning objective.",
    icon: "video",
  },
  {
    title: "Real exam conditions",
    body: "Timed sit, scheduled break — the works.",
    icon: "mock",
  },
];

/** Compact free-tier stamps for the courses catalogue PMQ card. */
export const PMQ_TICKET_SELL_POINTS = [
  "Streaks + XP that pull you back every day",
  "24 LOs, full syllabus, nothing skipped",
  "~280 quizzes, answer wrong, know why instantly",
  "Full 40-question mock exam included",
  "Exam command words, decoded",
  "Misconceptions busted before they cost you marks",
] as const;

/** Compact Pro unlock lines — nest under free on the course card. */
export const PMQ_PRO_SELL_POINTS = [
  "Meet Sly — your AI tutor, on call",
  "800+ questions total — unlock the full bank",
  "Every written answer, AI-marked. No self-scoring",
  "End-of-course report: your weak spots, before exam day",
  "Video + audio recap, every single LO",
  "Real exam conditions — timed, breaks, the works",
] as const;

/** Three capability beats under the Sly product window (not a uniform card grid). */
export const SLY_SHOWCASE_BEATS = [
  {
    label: "Finds weak spots",
    detail: "Reads how you struggle, then points at the topic that needs work.",
  },
  {
    label: "Coaches exam-style",
    detail: "APM PMQ framing — not generic chat, exam-focused every step.",
  },
  {
    label: "Stays on this topic",
    detail: "Scoped to the lesson in front of you, so revision stays sharp.",
  },
] as const;
