"use client";

import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import {
  InsightsDisclosureList,
  InsightsExpand,
  InsightsLockedChip,
} from "@/components/pmq/InsightsDisclosure";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";

/**
 * PFQ Learn body: key takeaway always visible; deeper explanation behind the
 * shared Insights chip (lightbulb, chevron flip, underline→rail) as PMQ.
 *
 * When `insightsLocked`, teaching text was stripped server-side — same Insights
 * label with a Pro badge that includes the padlock. Tap → Pro unlock toast.
 */
export function PfqTakeawayBody({
  block,
  insightsLocked = false,
}: {
  block: CoreContentBlockType;
  insightsLocked?: boolean;
  /** Kept for call-site compat; locked chip does not checkout. */
  isSignedIn?: boolean;
  objectiveNumber?: number;
}) {
  const takeaway = block.key_takeaway?.trim() ?? "";
  const body = block.body_markdown?.trim() ?? "";
  const tips = block.exam_tips ?? [];
  const showInsights = Boolean(body) || insightsLocked;

  if (!takeaway && !showInsights) return null;

  return (
    <div className="min-w-0">
      {takeaway ? (
        <p className="m-0 font-body text-[16px] leading-relaxed text-ink">
          {takeaway}
        </p>
      ) : null}

      {insightsLocked ? (
        <InsightsLockedChip className={takeaway ? "mt-2" : "mt-0.5"} />
      ) : showInsights ? (
        <InsightsExpand className={takeaway ? "mt-2" : "mt-0.5"}>
          <div className="pmq-markdown pmq-markdown--learn-core min-w-0 max-w-full [&_.pmq-markdown]:mt-0">
            <MarkdownBlock content={body} />
          </div>
          {tips.length > 0 ? (
            <div className="mt-2">
              <InsightsDisclosureList tips={tips} />
            </div>
          ) : null}
        </InsightsExpand>
      ) : null}
    </div>
  );
}
