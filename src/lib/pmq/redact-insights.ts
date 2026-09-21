import type { LessonBody, LoActivity, WorkedExampleCard } from "@/types/pmq";
import {
  canAccessPmqInsights,
  canAccessRecallActivities,
  type PmqTier,
} from "@/lib/pmq/tiers";

export type PmqRedactedLessonBody = {
  body: LessonBody;
  /** True when exam-tip text was stripped for this viewer. */
  insightsLocked: boolean;
  /** True when recall activity payloads were stripped for this viewer. */
  activitiesLocked: boolean;
};

/** Keep chrome (id/type/heading/title) so locked icons still render. */
function redactActivity(activity: LoActivity): LoActivity {
  if (activity.type === "pairup") {
    return { ...activity, pairs: [] };
  }
  if (activity.type === "lineup") {
    return { ...activity, items: [] };
  }
  return { ...activity, buckets: [], items: [] };
}

function redactWorkedExample(example: WorkedExampleCard): WorkedExampleCard {
  return {
    ...example,
    situation: "",
    ask: "",
    answer: "",
  };
}

/**
 * Strip paid Learn Insights + recall activity payloads on the SERVER before
 * the LO page reaches the client.
 *
 * Same reason as `redactPfqInsights`: a Next.js server component serialises
 * whatever it passes into the client payload. Rendering tip/activity copy and
 * merely not displaying it would ship Pro content in the RSC payload.
 *
 * Tip / activity shells stay so locked chrome can sit where the real controls
 * would have been.
 *
 * LO1 is never redacted (see PMQ_FREE_INSIGHTS_LO).
 */
export function redactPmqInsights(
  body: LessonBody,
  tier: PmqTier,
  loNumber: number,
): PmqRedactedLessonBody {
  const insightsLocked = !canAccessPmqInsights(tier, loNumber);
  const activitiesLocked = !canAccessRecallActivities(tier, loNumber);

  if (!insightsLocked && !activitiesLocked) {
    return { body, insightsLocked: false, activitiesLocked: false };
  }

  return {
    insightsLocked,
    activitiesLocked,
    body: {
      ...body,
      core_content: body.core_content.map((block) => ({
        ...block,
        exam_tips: insightsLocked
          ? (block.exam_tips ?? []).map((tip) => ({ ...tip, tip: "" }))
          : block.exam_tips,
        activities: activitiesLocked
          ? (block.activities ?? []).map(redactActivity)
          : block.activities,
        worked_examples: activitiesLocked
          ? (block.worked_examples ?? []).map(redactWorkedExample)
          : block.worked_examples,
      })),
    },
  };
}
