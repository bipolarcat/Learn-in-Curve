import { Check } from "lucide-react";

type LoProgressRingProps = {
  attemptedCount: number;
  totalCount: number;
  quizCompleted?: boolean;
  /** LO marked complete — force olive ring + check cue. */
  sectionCompleted?: boolean;
};

export function LoProgressRing({
  attemptedCount,
  totalCount,
  quizCompleted = false,
  sectionCompleted = false,
}: LoProgressRingProps) {
  const done = sectionCompleted || quizCompleted;
  const percent =
    done || totalCount === 0
      ? 100
      : Math.round((attemptedCount / totalCount) * 100);

  const size = 52;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      className="relative shrink-0"
      role="img"
      aria-label={
        sectionCompleted
          ? "Learning objective complete"
          : `Quiz progress: ${percent}%`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ink/12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`motion-safe:transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            done ? "text-olive" : "text-gold"
          }`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-body text-[10px] font-bold ${
          sectionCompleted ? "text-olive" : "text-ink"
        }`}
      >
        {sectionCompleted ? (
          <Check className="size-3.5 text-olive" strokeWidth={2.75} aria-hidden />
        ) : (
          `${percent}%`
        )}
      </span>
    </div>
  );
}
