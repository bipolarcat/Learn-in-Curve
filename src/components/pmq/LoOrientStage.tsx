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
import {
  OutcomeCodeBadge,
  type OutcomeCodeBadgeVariant,
} from "@/components/pmq/OutcomeCodeBadge";

type LoOrientStageProps = {
  context: string;
  outcomes: string[];
  /** Lexicon on Orient for every LO (Outcomes → Context → Definitions). */
  definitions?: KeyDefinition[];
  /** Ink-stamp badges (default from LoStudyJourney). */
  badgeVariant?: OutcomeCodeBadgeVariant;
  /**
   * When set, outcome badges jump into Learn at that sub-outcome
   * (skips Continue to Learn).
   */
  onJumpToOutcome?: (code: string) => void;
  /** Quiet line under “Learning outcomes” (default: PMQ handbook). */
  outcomesSubtitle?: string;
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

/** Parse "1a) …" / "1A. …" / "4.10) …" into a display code + body. */
function splitOutcome(raw: string): { code: string | null; text: string } {
  const trimmed = raw.trim();
  const letter = /^(\d+[a-z])[).:\-\u2013\u2014]\s*(.+)$/i.exec(trimmed);
  if (letter) {
    return {
      code: letter[1]!.toLowerCase(),
      text: letter[2]!.trim(),
    };
  }
  const dotted = /^(\d+\.\d+)\s*[).:\-\u2013\u2014]\s*(.+)$/.exec(trimmed);
  if (dotted) {
    return {
      code: dotted[1]!,
      text: dotted[2]!.trim(),
    };
  }
  return { code: null, text: trimmed };
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

/** Quiet line under an Orient card title (e.g. handbook mapping). */
const subtitleClass =
  "mt-0.5 font-body text-[13px] font-normal leading-snug tracking-tight text-ink/65";

/** Icon + heading row; body can sit full-bleed under the title. */
function OrientCard({
  id,
  icon,
  title,
  subtitle,
  children,
  className = "",
  /** When true, body starts at the card’s left edge (no icon-column indent). */
  flushBody = false,
  /** Tighter space under the heading (e.g. Key definitions). */
  tightBody = false,
}: {
  id: string;
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  flushBody?: boolean;
  tightBody?: boolean;
}) {
  const bodyOffset = tightBody ? "mt-0.5" : "mt-1.5";

  return (
    <section
      className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5 ${className}`}
      aria-labelledby={id}
    >
      <div className={`${orientGutter} items-start`}>
        <IconCell>
          <PathwayGlyph icon={icon} />
        </IconCell>
        <div className="min-w-0">
          <h2 id={id} className={headingClass}>
            {title}
          </h2>
          {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
        </div>
      </div>
      {flushBody ? (
        <div className={`${bodyOffset} w-full min-w-0`}>{children}</div>
      ) : (
        <div className={`${orientGutter} ${bodyOffset}`}>
          <span aria-hidden className="block" />
          <div className="flex min-w-0 flex-col">{children}</div>
        </div>
      )}
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
  badgeVariant = "stamp",
  onJumpToOutcome,
  outcomesSubtitle = "Mapped to the APM PMQ Handbook",
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
          <div className={`${orientGutter} items-start`}>
            <IconCell>
              <PathwayGlyph icon={ListChecks} />
            </IconCell>
            <div className="min-w-0">
              <h2 id="lo-orient-outcomes" className={headingClass}>
                Learning outcomes
              </h2>
              <p className={subtitleClass}>
                {outcomesSubtitle}
              </p>
            </div>
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
                      onJumpToOutcome ? (
                        <button
                          type="button"
                          onClick={() => onJumpToOutcome(code)}
                          aria-label={`Open ${code.toUpperCase()} in Learn`}
                          className="rounded-[0.25rem] transition-transform duration-150 ease-[var(--ease-out-quint)] hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.96]"
                        >
                          <OutcomeCodeBadge code={code} variant={badgeVariant} />
                        </button>
                      ) : (
                        <OutcomeCodeBadge
                          code={code}
                          variant={badgeVariant}
                        />
                      )
                    ) : null}
                  </IconCell>
                  <p className={`${bodyClass} m-0`}>
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
        <OrientCard
          id="lo-orient-context"
          icon={Compass}
          title="Context"
          subtitle="Put it into perspective"
          flushBody
        >
          <p className={bodyClass}>{contextText}</p>
        </OrientCard>
      ) : null}

      {hasDefinitions ? (
        <OrientCard
          id="lo-orient-definitions"
          icon={BookOpen}
          title="Key definitions"
          subtitle="Reveal a term to see its Plain English and APM definitions."
          className="overflow-visible"
        >
          <div className="w-full min-w-0 max-w-full">
            <DefinitionsReveal definitions={definitions} showLead={false} />
          </div>
        </OrientCard>
      ) : null}
    </div>
  );
}
