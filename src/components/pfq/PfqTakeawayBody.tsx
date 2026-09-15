"use client";

import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import {
  InsightsDisclosureList,
  InsightsExpand,
} from "@/components/pmq/InsightsDisclosure";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";

/**
 * PFQ Learn body: key takeaway always visible; deeper explanation behind the
 * shared Insights chip (lightbulb, chevron flip, underline→rail) as PMQ.
 */
export function PfqTakeawayBody({
  block,
}: {
  block: CoreContentBlockType;
}) {
  const takeaway = block.key_takeaway?.trim() ?? "";
  const body = block.body_markdown?.trim() ?? "";
  const tips = block.exam_tips ?? [];

  if (!takeaway && !body) return null;

  return (
    <div className="min-w-0">
      {takeaway ? (
        <p className="m-0 font-body text-[16px] leading-relaxed text-ink">
          {takeaway}
        </p>
      ) : null}

      {body ? (
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
