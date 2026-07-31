"use client";

import { showToast } from "@/components/ui/toast";
import { AiProBadge, ProBadge } from "@/components/pmq/tier-badge";

const PRO_GENERATE_COPY = "Generate quiz sets with the Pro Bundle";
const AI_PRO_GENERATE_COPY = "Quiz sets 6–8 come with the AI Pro Bundle.";

/**
 * Short LIC toast for Generate when the next set needs Pro or AI Pro.
 * Same motion/shell as checkpoint Next LO gate (`showToast`).
 */
export function showPracticeGenerateHint(kind: "pro" | "ai_pro") {
  showToast({
    message: kind === "ai_pro" ? AI_PRO_GENERATE_COPY : PRO_GENERATE_COPY,
    leading: kind === "ai_pro" ? <AiProBadge /> : <ProBadge />,
    duration: 2800,
    position: "top-right",
  });
}
