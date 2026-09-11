"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PmqSection } from "@/types/pmq";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { pmqLoHref, pmqMockHref } from "@/lib/pmq/constants";
import { getNextIncompleteSection } from "@/lib/pmq/progress";

type PmqPlanContinueProps = {
  sections: PmqSection[];
  completedSectionIds: string[];
  /**
   * Pathway stages reached per section (0…LO_STAGE_COUNT). Orient alone
   * counts as started — Continue, not Start.
   */
  stageReachedBySectionId?: Record<string, number>;
};

/**
 * Title-bar Continue / Start / Open Mock — body type; bars spinner while soft-nav is pending.
 */
export function PmqPlanContinue({
  sections,
  completedSectionIds,
  stageReachedBySectionId = {},
}: PmqPlanContinueProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (sections.length === 0) return null;

  const next = getNextIncompleteSection(sections, completedSectionIds);
  const nextPathwayStarted = next
    ? (stageReachedBySectionId[next.id] ?? 0) > 0
    : false;
  const anyPathwayStarted = Object.values(stageReachedBySectionId).some(
    (n) => n > 0,
  );
  const started =
    completedSectionIds.length > 0 || nextPathwayStarted || anyPathwayStarted;
  const href = next ? pmqLoHref(next.order_index) : pmqMockHref("lite", 1);
  const label = next ? (started ? "Continue" : "Start") : "Open Mock";

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? `Opening ${label}` : label}
      title={next?.title}
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
