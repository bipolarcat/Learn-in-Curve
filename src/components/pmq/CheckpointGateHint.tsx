"use client";

import { showToast } from "@/components/ui/toast";

export const CHECKPOINT_GATE_COPY =
  "Tick off all the checkpoints to complete this learning objective.";

/** Short LIC toast for gated Continue / Next LO. */
export function showCheckpointGateHint(
  position: "top-right" | "bottom-center" = "bottom-center",
) {
  showToast({
    message: CHECKPOINT_GATE_COPY,
    variant: "warning",
    duration: 2800,
    position,
  });
}
