/**
 * /library hub content model.
 * Adding page #40 = drop one file in pages/ and register it in index.ts.
 */

export type LibraryGroup = "exam-prep" | "choosing" | "syllabus";

export type LibraryFaq = {
  question: string;
  answer: string;
};

/**
 * External citation for a factual claim in the body.
 * Only primary sources: the awarding body's own page, never a competitor's
 * blog. Every URL here was checked to resolve before it was added, and any
 * new one must be too: a dead citation is worse than none.
 */
export type LibrarySource = {
  label: string;
  url: string;
  /** Who publishes it, shown so the reader can judge it at a glance. */
  publisher: string;
};

export type LibraryPage = {
  slug: string;
  /** Visible H1 */
  title: string;
  metaTitle: string;
  metaDescription: string;
  group: LibraryGroup;
  /** ≤40 words. Direct answer — first thing after H1 for AI extraction. */
  answerFirst: string;
  /** Markdown body, target 600–900 words when copy lands. */
  body: string;
  faqs: LibraryFaq[];
  /** Sibling slugs for the related-links block. Omit or leave empty for none. */
  related?: string[];
  status: "draft" | "published";
  /** ISO date — Article dateModified freshness signal. */
  updatedAt: string;
  /** Primary sources backing the factual claims. Omit when none apply. */
  sources?: LibrarySource[];
};

export const LIBRARY_GROUP_LABELS: Record<LibraryGroup, string> = {
  "exam-prep": "Exam Guides",
  choosing: "Comparisons",
  syllabus: "PMQ Syllabus Topics",
};

/** Placeholder Sim/Claude replace before flipping status to published. */
export const TODO_COPY =
  "TODO_COPY — see VOICE_GUIDE.md. Do not ship.";

export function pageHasTodoCopy(page: LibraryPage): boolean {
  if (page.answerFirst.includes("TODO_COPY")) return true;
  if (page.body.includes("TODO_COPY")) return true;
  if (page.metaTitle.includes("TODO_COPY")) return true;
  if (page.metaDescription.includes("TODO_COPY")) return true;
  return page.faqs.some(
    (f) => f.answer.includes("TODO_COPY") || f.question.includes("TODO_COPY"),
  );
}

/** Indexable only when published and free of placeholder copy. */
export function isLibraryPageIndexable(page: LibraryPage): boolean {
  return page.status === "published" && !pageHasTodoCopy(page);
}
