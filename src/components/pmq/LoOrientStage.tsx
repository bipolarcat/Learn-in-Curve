import {
  BookOpen,
  Compass,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { KeyDefinition } from "@/types/pmq";
import { DefinitionsReveal } from "@/components/pmq/DefinitionsReveal";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";
import { OutcomeCodeBadge } from "@/components/pmq/OutcomeCodeBadge";

type LoOrientStageProps = {
  context: string;
  outcomes: string[];
  /** Lexicon on Orient for every LO (Outcomes → Context → Definitions). */
  definitions?: KeyDefinition[];
};

/** Shared type — headings, body, and outcome codes all Figtree at these sizes. */
const headingClass =
  "min-w-0 w-full text-left font-body text-lg font-semibold leading-none tracking-tight text-balance text-ink";
/** Shared body — Context prose and outcome lines use the exact same size. */
const bodyClass =
  "w-full min-w-0 text-left font-body text-[15px] font-normal leading-[1.65] text-pretty text-ink/85";

/**
 * Shared 2-col track: col 1 = pathway icon / 1A–1C badges (centred),
 * col 2 = “Learning outcomes” heading + “Understand…” body copy.
 */
const orientGutter =
  "grid w-full min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-1.5 sm:gap-x-2";

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

function IconCell({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center justify-center self-start">
      {children}
    </span>
  );
}

/** Icon + copy column (Context / Key definitions). */
function OrientCard({
  id,
  icon,
  title,
  children,
  className = "",
}: {
  id: string;
  icon: LucideIcon;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5 ${className}`}
      aria-labelledby={id}
    >
      <div className={`${orientGutter} items-center`}>
        <IconCell>
          <PathwayGlyph icon={icon} />
        </IconCell>
        <h2 id={id} className={headingClass}>
          {title}
        </h2>
      </div>
      <div className={`${orientGutter} mt-1.5`}>
        <span aria-hidden className="block" />
        <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
      </div>
    </section>
  );
}

/**
 * Orient — Learning outcomes, Context, then Key definitions as opaque cards.
 *
 * Learning outcomes: ListChecks + 1A/1B/1C stack in the icon column;
 * heading + outcome sentences stack in the text column.
 */
export function LoOrientStage({
  context,
  outcomes,
  definitions = [],
}: LoOrientStageProps) {
  const contextText = context.trim();
  const hasContext = contextText.length > 0;
  const hasOutcomes = outcomes.length > 0;
  const hasDefinitions = definitions.length > 0;

  if (!hasContext && !hasOutcomes && !hasDefinitions) {
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
      {hasOutcomes ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
          aria-labelledby="lo-orient-outcomes"
        >
          <div className={`${orientGutter} items-center`}>
            <IconCell>
              <PathwayGlyph icon={ListChecks} />
            </IconCell>
            <h2 id="lo-orient-outcomes" className={headingClass}>
              Learning outcomes
            </h2>
          </div>

          <ul className="mt-1.5 w-full min-w-0 list-none">
            {outcomes.map((outcome, index) => {
              const { code, text } = splitOutcome(outcome);
              return (
                <li
                  key={`${code ?? "o"}-${index}-${text.slice(0, 24)}`}
                  className={`${orientGutter} ${motion.outcome} border-t border-black/[0.05] py-2 first:border-t-0 first:pt-0 last:pb-0 dark:border-white/[0.08]`}
                  style={{ ["--i" as string]: index }}
                >
                  <IconCell>
                    {code ? (
                      <OutcomeCodeBadge code={code} className="mt-0.5" />
                    ) : null}
                  </IconCell>
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

      {hasContext ? (
        <OrientCard id="lo-orient-context" icon={Compass} title="Context">
          <p className={bodyClass}>{contextText}</p>
        </OrientCard>
      ) : null}

      {hasDefinitions ? (
        <OrientCard
          id="lo-orient-definitions"
          icon={BookOpen}
          title="Key definitions"
          className="overflow-visible"
        >
          <div className="w-full min-w-0 max-w-full">
            <DefinitionsReveal definitions={definitions} />
          </div>
        </OrientCard>
      ) : null}
    </div>
  );
}
