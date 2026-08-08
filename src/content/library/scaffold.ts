import type { LibraryPage } from "./types";
import { TODO_COPY } from "./types";

const faq = (question: string): LibraryPage["faqs"][number] => ({
  question,
  answer: TODO_COPY,
});

/**
 * Scaffold page factory — structure + FAQ questions are intentional;
 * prose fields stay on TODO_COPY until Sim/Claude supply voice copy.
 */
export function scaffoldLibraryPage(
  partial: Omit<LibraryPage, "answerFirst" | "body" | "status" | "updatedAt"> & {
    faqs: LibraryPage["faqs"];
    status?: LibraryPage["status"];
    updatedAt?: string;
    answerFirst?: string;
    body?: string;
  },
): LibraryPage {
  return {
    ...partial,
    answerFirst: partial.answerFirst ?? TODO_COPY,
    body: partial.body ?? TODO_COPY,
    status: partial.status ?? "draft",
    updatedAt: partial.updatedAt ?? "2026-08-08",
  };
}

export { faq, TODO_COPY };
