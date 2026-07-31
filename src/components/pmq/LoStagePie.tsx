"use client";

type LoStagePieProps = {
  /** Stages reached (0…total). */
  reached: number;
  total: number;
  /** Accessible label base, e.g. "LO 3". */
  label?: string;
  className?: string;
};

/**
 * Tiny filled pie for LO pathway progress — SaaS-quiet, orange fill on ink track.
 */
export function LoStagePie({
  reached,
  total,
  label = "Progress",
  className = "",
}: LoStagePieProps) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.max(0, Math.min(reached, safeTotal));
  const pct = (clamped / safeTotal) * 100;

  return (
    <span
      className={`relative inline-flex size-3.5 shrink-0 rounded-full ${className}`}
      role="img"
      aria-label={`${label}: ${clamped} of ${safeTotal} stages`}
      style={{
        background:
          pct <= 0
            ? "transparent"
            : pct >= 100
              ? "var(--orange)"
              : `conic-gradient(var(--orange) ${pct}%, transparent 0)`,
        boxShadow:
          pct <= 0
            ? "inset 0 0 0 1.5px rgb(var(--ink-rgb) / 0.18)"
            : "inset 0 0 0 1.5px rgb(var(--ink-rgb) / 0.1)",
      }}
    />
  );
}
