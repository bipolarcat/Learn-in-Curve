"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import {
  PFQ_LEARN_HREF,
  PFQ_MOCK_HREF,
} from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { pfqSectionId } from "@/lib/pfq/section-ids";

type PfqPlanContinueProps = {
  nextObjective: number | null;
  completedObjectives?: number[];
  /**
   * Pathway stages reached per section (0…PFQ_STAGE_COUNT). Orient alone
   * counts as started — Continue, not Start.
   */
  stageReachedBySectionId?: Record<string, number>;
};

/**
 * Title-bar Continue / Start / Open Mock — same dialect as PmqPlanContinue.
 */
export function PfqPlanContinue({
  nextObjective,
  completedObjectives = [],
  stageReachedBySectionId = {},
}: PfqPlanContinueProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextSectionId =
    nextObjective != null ? pfqSectionId(nextObjective) : null;
  const nextPathwayStarted = nextSectionId
    ? (stageReachedBySectionId[nextSectionId] ?? 0) > 0
    : false;
  const anyPathwayStarted = Object.values(stageReachedBySectionId).some(
    (n) => n > 0,
  );
  const started =
    completedObjectives.length > 0 || nextPathwayStarted || anyPathwayStarted;

  const href =
    nextObjective != null
      ? `${PFQ_LEARN_HREF}/${nextObjective}`
      : PFQ_MOCK_HREF;
  const verb = started ? "Continue" : "Start";
  const label =
    nextObjective != null ? `${verb} · LO ${nextObjective}` : "Open Mock";
  const nextTitle =
    nextObjective != null
      ? PFQ_OBJECTIVES.find((o) => o.objective === nextObjective)?.title
      : undefined;

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? `Opening ${label}` : label}
      title={nextTitle}
      className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold disabled:cursor-wait disabled:opacity-70`}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {pending ? (
        <Spinner variant="bars" size={14} className="text-paper" aria-hidden />
      ) : (
        <>
          {label}
          <CtaArrow />
        </>
      )}
    </button>
  );
}
