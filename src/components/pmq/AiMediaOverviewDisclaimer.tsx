"use client";

import { useId, useState } from "react";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";

type AiMediaOverviewDisclaimerProps = {
  kind: "audio" | "video";
};

const COPY: Record<AiMediaOverviewDisclaimerProps["kind"], string> = {
  audio:
    "This audio overview was AI-generated using NotebookLM, so it may contain inaccuracies or glitches. Spotted one? Write a quick line to us.",
  video:
    "This video overview was AI-generated using NotebookLM, so it may contain inaccuracies or glitches. Spotted one? Write a quick line to us.",
};

/**
 * Quiet expandable note under LO Audio overview (video uses LoVideoOverviewNotes).
 * Toggle sits on the right; open copy spans full width and is justified.
 */
export function AiMediaOverviewDisclaimer({
  kind,
}: AiMediaOverviewDisclaimerProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const feedbackSource = kind === "audio" ? "Audio overview" : "Video overview";

  return (
    <div className="grid gap-1.5">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 py-0.5 font-body text-[12px] font-semibold text-ink/45 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-1"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>About this overview</span>
          <span
            aria-hidden
            className={`text-[9px] transition-transform duration-150 ease-[var(--ease-out-quint)] ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
      </div>
      {open ? (
        <div
          id={panelId}
          className="w-full font-body text-[13px] leading-relaxed text-pretty text-ink/55"
          role="region"
          aria-label="About this overview"
        >
          <p>
            {COPY[kind]}{" "}
            <SendFeedbackButton
              className="inline text-ink/55 underline underline-offset-2 transition-colors hover:text-ink/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              source={feedbackSource}
            />
          </p>
        </div>
      ) : null}
    </div>
  );
}
