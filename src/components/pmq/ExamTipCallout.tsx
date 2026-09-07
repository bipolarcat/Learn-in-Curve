import { Lightbulb, TriangleAlert, Target, type LucideIcon } from "lucide-react";
import type { ExamTip } from "@/types/pmq";

/**
 * Exam coaching, visually separated from the study prose.
 *
 * The study text explains the syllabus; these say how the exam behaves. Keeping
 * them in one obvious shape means a learner can read the lesson without the exam
 * nagging, then sweep the callouts on their revision pass.
 */

type Tone = {
  icon: LucideIcon;
  rail: string;
  label: string;
};

const TONES: Record<string, Tone> = {
  "scenario trap": {
    icon: TriangleAlert,
    rail: "before:bg-rust",
    label: "text-rust",
  },
  "carry this in": {
    icon: Target,
    rail: "before:bg-teal",
    label: "text-teal",
  },
};

const DEFAULT_TONE: Tone = {
  icon: Lightbulb,
  rail: "before:bg-orange",
  label: "text-orange",
};

function toneFor(label: string): Tone {
  return TONES[label.trim().toLowerCase()] ?? DEFAULT_TONE;
}

export function ExamTipCallout({ tip }: { tip: ExamTip }) {
  const tone = toneFor(tip.label);
  const Icon = tone.icon;

  return (
    <aside
      className={`not-prose relative my-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-black/[0.08] bg-ink/[0.025] py-2.5 pl-4 pr-3.5 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-[''] dark:border-white/[0.12] dark:bg-white/[0.03] sm:py-3 sm:pl-[1.125rem] sm:pr-4 ${tone.rail}`}
    >
      <p
        className={`m-0 flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.08em] ${tone.label}`}
      >
        <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {tip.label}
      </p>
      <p className="mt-1 font-body text-[13.5px] leading-[1.6] text-pretty text-ink/85">
        {tip.tip}
      </p>
    </aside>
  );
}

export function ExamTipList({ tips }: { tips: ExamTip[] }) {
  if (tips.length === 0) return null;
  return (
    <>
      {tips.map((tip) => (
        <ExamTipCallout key={tip.id} tip={tip} />
      ))}
    </>
  );
}
