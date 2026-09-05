"use client";

import { BookOpen, Layers, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  CoreContentBlock as CoreContentBlockType,
  KeyDefinition,
} from "@/types/pmq";
import { DefinitionsReveal } from "@/components/pmq/DefinitionsReveal";
import { Lo1CoreContentStudy } from "@/components/pmq/Lo1CoreContentStudy";
import { CoreContentBlock } from "@/components/pmq/CoreContentBlock";
import { OutcomeCodeBadge } from "@/components/pmq/OutcomeCodeBadge";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";

type LoLearnStageProps = {
  loNumber: number;
  definitions: KeyDefinition[];
  coreContent: CoreContentBlockType[];
};

/** Same type for card titles and outcome codes (2a) / titles). */
const headingClass =
  "w-full min-w-0 font-body text-lg font-semibold leading-snug tracking-tight text-ink";

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
      <h2 id={id} className={`min-w-0 flex-1 ${headingClass}`}>
        {children}
      </h2>
    </div>
  );
}

/**
 * Learn — LO1: notebook single-scroll core (definitions live on Orient).
 * Other LOs: definitions plates + stacked core blocks.
 */
export function LoLearnStage({
  loNumber,
  definitions,
  coreContent,
}: LoLearnStageProps) {
  if (loNumber === 1) {
    return (
      <div className="lo-learn-stage min-w-0" aria-label="Learn">
        {coreContent.length > 0 ? (
          <Lo1CoreContentStudy blocks={coreContent} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="lo-learn-stage flex min-w-0 flex-col gap-3 sm:gap-3.5"
      aria-label="Learn"
    >
      {definitions.length > 0 ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-visible p-4 sm:p-5`}
          style={{ ["--i" as string]: 0 }}
          aria-labelledby="lo-learn-definitions"
        >
          <SectionTitle id="lo-learn-definitions" icon={BookOpen}>
            Key definitions
          </SectionTitle>
          <div className="mt-1.5 w-full min-w-0 max-w-full">
            <DefinitionsReveal definitions={definitions} />
          </div>
        </section>
      ) : null}

      {coreContent.length > 0 ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-x-clip p-4 sm:p-5`}
          style={{ ["--i" as string]: 1 }}
          aria-labelledby="lo-learn-core"
        >
          <SectionTitle id="lo-learn-core" icon={Layers}>
            Core content
          </SectionTitle>

          <div className="mt-1.5 grid w-full min-w-0 max-w-full gap-0 divide-y divide-black/[0.05] dark:divide-white/[0.08]">
            {coreContent.map((block, index) => {
              const code = block.outcome_code.toLowerCase();
              return (
                <article
                  key={block.outcome_code}
                  className={`${motion.outcome} min-w-0 py-3 first:pt-2 last:pb-0 sm:py-3.5`}
                  style={{ ["--i" as string]: index }}
                >
                  <h3
                    className={`flex min-w-0 items-start gap-2.5 ${headingClass}`}
                  >
                    <OutcomeCodeBadge code={code} className="mt-0.5" />
                    <span className="min-w-0 flex-1">
                      <span className="sr-only">{code}: </span>
                      {block.outcome_title}
                    </span>
                  </h3>
                  <div className="mt-2 w-full min-w-0 max-w-full [&_.pmq-markdown]:mt-0 [&_.pmq-markdown]:w-full [&_.pmq-markdown_p]:w-full [&_.pmq-markdown_ul]:w-full [&_.pmq-markdown_ol]:w-full">
                    <CoreContentBlock block={block} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
