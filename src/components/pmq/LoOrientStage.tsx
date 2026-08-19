import {
  Compass,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";
import { OutcomeCodeBadge } from "@/components/pmq/OutcomeCodeBadge";

type LoOrientStageProps = {
  context: string;
  outcomes: string[];
};

/** Shared type — headings, body, and outcome codes all Figtree at these sizes. */
const headingClass =
  "min-w-0 flex-1 font-body text-lg font-semibold leading-none tracking-tight text-balance text-ink";
/** Shared body — Context prose and outcome lines use the exact same size. */
const bodyClass =
  "w-full min-w-0 font-body text-[15px] font-normal leading-[1.65] text-pretty text-ink/85";

/** Parse "1a) …" / "1A. …" into a display code + body. */
function splitOutcome(raw: string): { code: string | null; text: string } {
  const match = /^(\d+[a-z])[).:\-\u2013\u2014]\s*(.+)$/i.exec(raw.trim());
  if (!match) return { code: null, text: raw.trim() };
  return {
    code: match[1]!.toLowerCase(),
    text: match[2]!.trim(),
  };
}

function PathwayGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="size-7 shrink-0 text-orange sm:size-8"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function SectionTitle({
  id,
  icon,
  children,
}: {
  id: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
      <PathwayGlyph icon={icon} />
      <h2 id={id} className={headingClass}>
        {children}
      </h2>
    </div>
  );
}

/**
 * Orient — Context and Learning outcomes as separate opaque cards.
 * Body copy spans the full card width (same dialect as Learn / Apply).
 */
export function LoOrientStage({ context, outcomes }: LoOrientStageProps) {
  const contextText = context.trim();
  const hasContext = contextText.length > 0;
  const hasOutcomes = outcomes.length > 0;

  if (!hasContext && !hasOutcomes) {
    return (
      <div
        className={`${productSurfaceOpaque} ${motion.panel} lo-orient-stage p-4 sm:p-5`}
        aria-label="Orient"
      >
        <p className={bodyClass}>
          Orientation content for this learning objective isn&apos;t available
          yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="lo-orient-stage flex w-full min-w-0 flex-col gap-3 sm:gap-3.5"
      aria-label="Orient"
    >
      {hasContext ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
          aria-labelledby="lo-orient-context"
        >
          <SectionTitle id="lo-orient-context" icon={Compass}>
            Context
          </SectionTitle>
          <p className={`mt-1.5 ${bodyClass}`}>{contextText}</p>
        </section>
      ) : null}

      {hasOutcomes ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
          aria-labelledby="lo-orient-outcomes"
        >
          <SectionTitle id="lo-orient-outcomes" icon={ListChecks}>
            Learning outcomes
          </SectionTitle>

          <ul className="mt-1.5 w-full min-w-0 list-none divide-y divide-black/[0.05] dark:divide-white/[0.08]">
            {outcomes.map((outcome, index) => {
              const { code, text } = splitOutcome(outcome);
              return (
                <li
                  key={`${code ?? "o"}-${index}-${text.slice(0, 24)}`}
                  className={`${motion.outcome} flex w-full min-w-0 items-start gap-2.5 py-2 first:pt-0 last:pb-0`}
                  style={{ ["--i" as string]: index }}
                >
                  {code ? <OutcomeCodeBadge code={code} className="mt-0.5" /> : null}
                  <p className={bodyClass}>
                    {code ? <span className="sr-only">{code}: </span> : null}
                    {text}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
