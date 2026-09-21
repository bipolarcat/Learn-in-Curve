"use client";

import { LightbulbIcon } from "@animateicons/react/lucide/lightbulb-icon";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import {
  InsightsDisclosureList,
  InsightsExpand,
} from "@/components/pmq/InsightsDisclosure";
import { ProBadge } from "@/components/pmq/tier-badge";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { cn } from "@/lib/utils";

/**
 * PFQ Learn body: key takeaway always visible; deeper explanation behind the
 * shared Insights chip (lightbulb, chevron flip, underline→rail) as PMQ.
 *
 * When `insightsLocked`, teaching text was stripped server-side — same Insights
 * label with a Pro badge that includes the padlock. No expand.
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
        <p
          className={cn(
            "not-prose m-0 inline-flex items-center gap-1 font-body text-[12.5px] font-medium leading-none tracking-tight text-ink/45",
            takeaway ? "mt-2" : "mt-0.5",
          )}
          aria-label="Insights locked — Pro"
        >
          <LightbulbIcon
            size={14}
            duration={0.85}
            isAnimated={false}
            className="-mr-px shrink-0 text-current"
            aria-hidden
          />
          <span>Insights</span>
          <ProBadge locked />
        </p>
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
