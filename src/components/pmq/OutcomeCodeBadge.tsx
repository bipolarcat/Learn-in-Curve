import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

/** Orange squarish outcome code, e.g. 1A. Decorative: pair with sr-only text. */
export function OutcomeCodeBadge({
  code,
  filled = false,
  className,
}: {
  code: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative isolate inline-flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-[0.25rem] px-1 font-body text-[11px] font-semibold tabular-nums tracking-tight ring-2 ring-inset ring-orange",
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-orange transition-transform duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0",
          filled ? "scale-100" : "scale-0",
        )}
      />
      <span
        className={cn(
          "relative z-10 transition-colors duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0",
          filled ? "text-paper" : "text-orange",
        )}
      >
        {formatOutcomeBadge(code)}
      </span>
    </span>
  );
}
