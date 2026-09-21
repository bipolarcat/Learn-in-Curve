"use client";

import { showToast } from "@/components/ui/toast";
import { ProBadge } from "@/components/pmq/tier-badge";

const INSIGHTS_COPY = "Unlock insights with the Pro bundle.";
const RECALL_COPY = "Unlock recall activities with the Pro bundle.";
const MOCK_COPY = "Unlock mock exams with the Pro bundle.";

/**
 * Short LIC toast when Starter taps locked Pro chrome (PMQ + PFQ).
 * Pro badge leads — same shell as practice Generate hints.
 */
export function showProLockHint(kind: "insights" | "recall" | "mock") {
  const message =
    kind === "insights"
      ? INSIGHTS_COPY
      : kind === "recall"
        ? RECALL_COPY
        : MOCK_COPY;
  showToast({
    message,
    leading: <ProBadge />,
    duration: 2800,
    position: "top-right",
  });
}
