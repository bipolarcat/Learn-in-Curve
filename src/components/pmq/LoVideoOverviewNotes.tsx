"use client";

import { useId, useState, type ReactNode } from "react";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";

type LoVideoOverviewNotesProps = {
  hasCaptions: boolean;
  transcript: string | null;
  onJumpToLearn?: () => void;
};

const ABOUT_COPY =
  "This video overview was AI-generated using NotebookLM, so it may contain inaccuracies or glitches. Spotted one? Write a quick line to us.";

const toggleClass =
  "inline-flex cursor-pointer items-center gap-1.5 py-0.5 font-body text-[12px] font-semibold text-ink/45 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-1";

const panelClass =
  "w-full font-body text-[13px] leading-relaxed text-pretty text-ink/55";

/**
 * Right-aligned Accessibility + About this overview toggles (same row).
 * Expanded body spans the full media width.
 */
export function LoVideoOverviewNotes({
  hasCaptions,
  transcript,
  onJumpToLearn,
}: LoVideoOverviewNotesProps) {
  const a11yId = useId();
  const aboutId = useId();
  const showA11y = !(hasCaptions && !transcript && !onJumpToLearn);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);


  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1">
        {showA11y ? (
          <Toggle
            id={a11yId}
            open={a11yOpen}
            onToggle={() => setA11yOpen((v) => !v)}
            label={hasCaptions || transcript ? "Transcript" : "Accessibility"}
          />
        ) : null}
        <Toggle
          id={aboutId}
          open={aboutOpen}
          onToggle={() => setAboutOpen((v) => !v)}
          label="About this overview"
        />
      </div>

      {showA11y && a11yOpen ? (
        <div id={a11yId} className={panelClass} role="region" aria-label="Accessibility">
          <A11yBody
            hasCaptions={hasCaptions}
            transcript={transcript}
            onJumpToLearn={onJumpToLearn}
          />
        </div>
      ) : null}

      {aboutOpen ? (
        <div
          id={aboutId}
          className={panelClass}
          role="region"
          aria-label="About this overview"
        >
          <p>
            {ABOUT_COPY}{" "}
            <SendFeedbackButton
              className="inline text-ink/55 underline underline-offset-2 transition-colors hover:text-ink/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              source="Video overview"
            />
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Toggle({
  id,
  open,
  onToggle,
  label,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={toggleClass}
      aria-expanded={open}
      aria-controls={id}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`text-[9px] transition-transform duration-150 ease-[var(--ease-out-quint)] ${
          open ? "rotate-180" : ""
        }`}
      >
        ▾
      </span>
    </button>
  );
}

function A11yBody({
  hasCaptions,
  transcript,
  onJumpToLearn,
}: {
  hasCaptions: boolean;
  transcript: string | null;
  onJumpToLearn?: () => void;
}): ReactNode {
  if (transcript) {
    return <p className="whitespace-pre-wrap text-justify">{transcript}</p>;
  }
  if (hasCaptions) {
    return (
      <p>
        Captions are available on the player (CC). Open the video controls to
        turn them on or off.
      </p>
    );
  }
  return (
    <p>
      Timed captions for this video aren&apos;t available yet. Meanwhile, use
      the Learn stage for the written explanations covering the same outcomes
      {onJumpToLearn ? (
        <>
          {" "}
          or{" "}
          <button
            type="button"
            onClick={onJumpToLearn}
            className="font-medium text-ink/60 underline underline-offset-2 hover:text-ink/80"
          >
            jump to Learn
          </button>
        </>
      ) : null}
      .
    </p>
  );
}
