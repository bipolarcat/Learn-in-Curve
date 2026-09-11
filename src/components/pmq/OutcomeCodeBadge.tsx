import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

export type OutcomeCodeBadgeVariant = "outline" | "stamp";

/**
 * Outcome code mark, e.g. 1A / 18A. One square size for every LO.
 * Decorative: pair with sr-only text.
 *
 * - `outline` — teal border, transparent fill
 * - `stamp` — filled teal ink stamp, cream type (default on PMQ LOs)
 */
export function OutcomeCodeBadge({
  code,
  variant = "outline",
  className,
}: {
  code: string;
  variant?: OutcomeCodeBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-[0.2rem] font-body text-[11px] font-extrabold leading-none tabular-nums tracking-[-0.02em]",
        variant === "stamp"
          ? "border border-teal bg-teal text-cream"
          : "border-2 border-teal bg-transparent text-teal",
        className,
      )}
      aria-hidden
    >
      {formatOutcomeBadge(code)}
    </span>
  );
}
