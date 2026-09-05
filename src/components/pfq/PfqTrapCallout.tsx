import Link from "next/link";
import type { PfqTrapCalloutContent } from "@/lib/pfq/trap-callout";

type Props = {
  callout: PfqTrapCalloutContent;
};

/**
 * Inline corrective feedback after a wrong answer on a trap-tagged question.
 * One callout only — never stack.
 */
export function PfqTrapCallout({ callout }: Props) {
  return (
    <aside
      className="mt-4 rounded-xl border border-orange/25 bg-orange/[0.06] px-4 py-3 dark:border-orange/30 dark:bg-orange/[0.1]"
      aria-label="Trap tip"
    >
      <p className="m-0 font-body text-[12px] font-semibold tracking-tight text-orange">
        {callout.title}
      </p>
      <p className="mt-1.5 m-0 font-body text-[14px] font-normal leading-[1.65] text-pretty text-ink/90">
        {callout.body}
      </p>
      <p className="mt-2 m-0">
        <Link
          href={callout.href}
          className="font-body text-[13px] font-semibold text-orange underline-offset-2 hover:underline"
        >
          More on this trap
        </Link>
      </p>
    </aside>
  );
}
