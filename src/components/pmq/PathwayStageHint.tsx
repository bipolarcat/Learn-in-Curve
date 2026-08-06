"use client";

import { showToast } from "@/components/ui/toast";

export const PATHWAY_STAGE_HINT_COPY =
  "Use Next to move on to the next learning stage.";

/** Toast when a learner taps a pathway stage they haven’t reached yet. */
export function showPathwayStageHint(
  position: "top-right" | "bottom-center" = "top-right",
) {
  showToast({
    message: PATHWAY_STAGE_HINT_COPY,
    variant: "warning",
    duration: 3200,
    position,
  });
}
