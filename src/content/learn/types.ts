/**
 * /learn hub content model.
 * Adding page #40 = drop one file in pages/ and register it in index.ts.
 */

export type LearnGroup = "exam-prep" | "choosing" | "syllabus";

export type LearnFaq = {
  question: string;
  answer: string;
};

export type LearnPage = {
  slug: string;
  /** Visible H1 */
  title: string;
  metaTitle: string;
  metaDescription: string;
  group: LearnGroup;
  /** ≤40 words. Direct answer — first thing after H1 for AI extraction. */
  answerFirst: string;
  /** Markdown body, target 600–900 words when copy lands. */
  body: string;
  faqs: LearnFaq[];
  /** LO numbers to pull ring-fenced sample questions from. */
  sampleQuestionLos: number[];
  /** Related page slugs for internal linking. */
  related: string[];
  status: "draft" | "published";
  /** ISO date — Article dateModified freshness signal. */
  updatedAt: string;
};

export const LEARN_GROUP_LABELS: Record<LearnGroup, string> = {
  "exam-prep": "Exam prep",
  choosing: "Choosing a qualification",
  syllabus: "Syllabus topics",
};

/** Placeholder Sim/Claude replace before flipping status to published. */
export const TODO_COPY =
  "TODO_COPY — see VOICE_GUIDE.md. Do not ship.";

export function pageHasTodoCopy(page: LearnPage): boolean {
  if (page.answerFirst.includes("TODO_COPY")) return true;
  if (page.body.includes("TODO_COPY")) return true;
  if (page.metaTitle.includes("TODO_COPY")) return true;
  if (page.metaDescription.includes("TODO_COPY")) return true;
  return page.faqs.some(
    (f) => f.answer.includes("TODO_COPY") || f.question.includes("TODO_COPY"),
  );
}

/** Indexable only when published and free of placeholder copy. */
export function isLearnPageIndexable(page: LearnPage): boolean {
  return page.status === "published" && !pageHasTodoCopy(page);
}
