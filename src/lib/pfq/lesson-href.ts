/** Client-safe PFQ lesson URL helpers (no fs). */

import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";

export function pfqLessonHref(objective: number, outcomeCode?: string): string {
  const base = `${PFQ_LEARN_HREF}/${objective}`;
  return outcomeCode ? `${base}#${outcomeCode}` : base;
}
