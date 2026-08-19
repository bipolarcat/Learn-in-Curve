import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

/** Orange rounded-square outcome code, e.g. 1A. Decorative: pair with sr-only text. */
export function OutcomeCodeBadge({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-[0.25rem] border-[1.5px] border-orange px-1 font-body text-[11px] font-semibold tabular-nums tracking-tight text-orange",
        className,
      )}
      aria-hidden
    >
      {formatOutcomeBadge(code)}
    </span>
  );
}
