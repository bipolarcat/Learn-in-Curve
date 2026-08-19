import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

/** Outline outcome code, e.g. 1A. Decorative: pair with sr-only text. */
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
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-[0.25rem] border-2 border-orange bg-transparent px-1 font-body text-[11px] font-semibold leading-none tabular-nums tracking-tight text-orange",
        className,
      )}
      aria-hidden
    >
      {formatOutcomeBadge(code)}
    </span>
  );
}
