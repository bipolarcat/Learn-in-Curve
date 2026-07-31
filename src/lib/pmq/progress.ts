import type { PmqSection } from "@/types/pmq";

/** First incomplete section in study order, or null when all are done. */
export function getNextIncompleteSection(
  sections: PmqSection[],
  completedSectionIds: string[],
): PmqSection | null {
  const done = new Set(completedSectionIds);
  const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);
  return sorted.find((section) => !done.has(section.id)) ?? null;
}
