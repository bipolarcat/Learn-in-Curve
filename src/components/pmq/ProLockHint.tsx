"use client";

import { showToast } from "@/components/ui/toast";
import { ProBadge } from "@/components/pmq/tier-badge";

const INSIGHTS_COPY = "Unlock insights with the Pro bundle.";
const RECALL_COPY = "Unlock recall activities with the Pro bundle.";

/**
 * Short LIC toast when Starter taps locked Insights or Pair/Group/Line icons.
 * Pro badge leads — same shell as practice Generate hints.
 */
export function showProLockHint(kind: "insights" | "recall") {
  showToast({
    message: kind === "insights" ? INSIGHTS_COPY : RECALL_COPY,
    leading: <ProBadge />,
    duration: 2800,
    position: "top-right",
  });
}
