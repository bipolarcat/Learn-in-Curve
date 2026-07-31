import {
  Brain,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { MemoryAid, Misconception } from "@/types/pmq";
import { MisconceptionsList } from "@/components/pmq/MisconceptionsList";
import { MemoryAidsList } from "@/components/pmq/MemoryAidsList";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";

type LoApplyStageProps = {
  misconceptions: Misconception[];
  memoryAids: MemoryAid[];
};

const headingClass =
  "min-w-0 flex-1 font-body text-lg font-semibold leading-snug tracking-tight text-ink";
const bodyClass =
  "w-full min-w-0 font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";

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
 * Apply — Misconceptions + Memory aids as open opaque cards.
 * Worked example intentionally omitted from the pathway UI.
 */
export function LoApplyStage({
  misconceptions,
  memoryAids,
}: LoApplyStageProps) {
  const hasMisconceptions = misconceptions.length > 0;
  const hasMemoryAids = memoryAids.length > 0;

  if (!hasMisconceptions && !hasMemoryAids) {
    return (
      <div
        className={`${productSurfaceOpaque} ${motion.panel} lo-apply-stage p-4 sm:p-5`}
        aria-label="Apply"
      >
        <p className={bodyClass}>
          Apply content for this learning objective isn&apos;t available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="lo-apply-stage flex min-w-0 flex-col gap-3 sm:gap-3.5"
      aria-label="Apply"
    >
      {hasMisconceptions ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-x-clip p-4 sm:p-5`}
          style={{ ["--i" as string]: 0 }}
          aria-labelledby="lo-apply-misconceptions"
        >
          <SectionTitle id="lo-apply-misconceptions" icon={CircleAlert}>
            Common misconceptions
          </SectionTitle>
          <div className="mt-3 w-full min-w-0 sm:mt-3.5">
            <MisconceptionsList items={misconceptions} />
          </div>
        </section>
      ) : null}

      {hasMemoryAids ? (
        <section
          className={`${productSurfaceOpaque} ${motion.panel} min-w-0 overflow-x-clip p-4 sm:p-5`}
          style={{ ["--i" as string]: 1 }}
          aria-labelledby="lo-apply-memory"
        >
          <SectionTitle id="lo-apply-memory" icon={Brain}>
            Memory aids
          </SectionTitle>
          <div className="mt-3 w-full min-w-0 sm:mt-3.5">
            <MemoryAidsList items={memoryAids} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
