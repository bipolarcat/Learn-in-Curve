import { cn } from "@/lib/utils";

export function formatOutcomeBadge(code: string): string {
  const match = /^(\d+)([a-z]+)$/i.exec(code.trim());
  if (!match) return code.replace(/\)\s*$/, "").toUpperCase();
  return `${match[1]}${match[2]!.toUpperCase()}`;
}

/** Teal outline outcome code, e.g. 1A / 18A. Always square. Decorative: pair with sr-only text. */
export function OutcomeCodeBadge({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const label = formatOutcomeBadge(code);
  // Two-digit LOs (13A, 18A) need a slightly larger square than 1A.
  const wide = label.length >= 3;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[0.2rem] border-2 border-teal bg-transparent font-body font-semibold leading-none tabular-nums tracking-tight text-teal",
        wide
          ? "size-7 text-[9px]"
          : "size-5 text-[10px]",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
