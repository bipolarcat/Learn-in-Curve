import type { LessonBody } from "@/types/pmq";
import {
  canAccessPmqInsights,
  type PmqTier,
} from "@/lib/pmq/tiers";

export type PmqRedactedLessonBody = {
  body: LessonBody;
  /** True when exam-tip text was stripped for this viewer. */
  insightsLocked: boolean;
};

/**
 * Strip paid Learn Insights on the SERVER before the LO page reaches the client.
 *
 * Same reason as `redactPfqInsights`: a Next.js server component serialises
 * whatever it passes into the client payload. Rendering tip copy and merely
 * not displaying it would ship Pro Insights in the RSC payload.
 *
 * Tip shells (id / heading / placement) stay so the locked Insights chip can
 * sit where the expandable would have been. Tip text is emptied.
 *
 * LO1 is never redacted (see PMQ_FREE_INSIGHTS_LO).
 */
export function redactPmqInsights(
  body: LessonBody,
  tier: PmqTier,
  loNumber: number,
): PmqRedactedLessonBody {
  if (canAccessPmqInsights(tier, loNumber)) {
    return { body, insightsLocked: false };
  }

  return {
    insightsLocked: true,
    body: {
      ...body,
      core_content: body.core_content.map((block) => ({
        ...block,
        exam_tips: (block.exam_tips ?? []).map((tip) => ({
          ...tip,
          tip: "",
        })),
      })),
    },
  };
}
