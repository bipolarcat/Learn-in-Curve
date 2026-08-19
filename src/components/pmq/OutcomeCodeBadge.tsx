import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

/** Teal outline outcome code, e.g. 1A. Decorative: pair with sr-only text. */
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
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[0.2rem] border-2 border-teal bg-transparent px-0.5 font-body text-[10px] font-semibold leading-none tabular-nums tracking-tight text-teal",
        className,
      )}
      aria-hidden
    >
      {formatOutcomeBadge(code)}
    </span>
  );
}
