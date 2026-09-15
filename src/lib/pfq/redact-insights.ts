import type { PfqObjectiveLesson } from "@/lib/pfq/content";
import { canAccessPfqInsights, type PfqTier } from "@/lib/pfq/tiers";

export type PfqRedactedLesson = {
  lesson: PfqObjectiveLesson;
  /** True when the teaching text was stripped for this viewer. */
  insightsLocked: boolean;
};

/**
 * Strip paid lesson insights on the SERVER before the lesson reaches the client.
 *
 * Why this exists rather than a CSS or component-level hide: a Next.js server
 * component serialises whatever it passes into the client payload. Rendering
 * the full `body_markdown` and merely not displaying it would ship the entire
 * paid course inside the page's own RSC payload, readable with view-source. The
 * paywall has to remove the words, not hide them.
 *
 * What survives: everything except the teaching text. Learning outcomes, key
 * takeaways, key definitions, misconceptions, memory aids, progress
 * checkpoints, where-this-fits. Learn chrome stays identical to Pro — the
 * Insights expandable still renders, but opens to a Pro upsell.
 *
 * Objective 1 is never redacted for anyone (see PFQ_FREE_INSIGHTS_OBJECTIVE).
 */
export function redactPfqInsights(
  lesson: PfqObjectiveLesson,
  tier: PfqTier,
): PfqRedactedLesson {
  if (canAccessPfqInsights(tier, lesson.objective_number)) {
    return { lesson, insightsLocked: false };
  }

  return {
    insightsLocked: true,
    lesson: {
      ...lesson,
      core_content: lesson.core_content.map((block) => ({
        ...block,
        // Empty, not a teaser slice. A "first paragraph" preview would put a
        // slice of paid content in the payload on every locked objective, and
        // the free taster is already objective 1 in full.
        body_markdown: "",
      })),
    },
  };
}
