/** Client-safe PFQ lesson URL helpers (no fs). */

export function pfqLessonHref(objective: number, outcomeCode?: string): string {
  const base = `/pfq/learn/${objective}`;
  return outcomeCode ? `${base}#${outcomeCode}` : base;
}
