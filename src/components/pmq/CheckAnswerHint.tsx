"use client";

import { showToast } from "@/components/ui/toast";

export const CHECK_ANSWER_MCQ_COPY =
  "Choose an answer before you can check it.";

export const CHECK_ANSWER_DROPDOWN_COPY =
  "Fill every blank before you can check the answer.";

/** Toast when Check answer is pressed with nothing (or incomplete) selected. */
export function showCheckAnswerHint(kind: "mcq" | "dropdown") {
  showToast({
    message:
      kind === "dropdown" ? CHECK_ANSWER_DROPDOWN_COPY : CHECK_ANSWER_MCQ_COPY,
    variant: "warning",
    duration: 3200,
    position: "bottom-center",
  });
}
