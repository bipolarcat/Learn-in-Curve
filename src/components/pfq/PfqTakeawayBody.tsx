"use client";

import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { ExamTipList } from "@/components/pmq/ExamTipCallout";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";

/**
 * PFQ Learn body: key takeaway always visible; wider explanation under
 * "Understand it". Used inside Lo1CoreContentStudy chrome.
 */
export function PfqTakeawayBody({
  block,
}: {
  block: CoreContentBlockType;
}) {
  const takeaway = block.key_takeaway?.trim() ?? "";
  const body = block.body_markdown?.trim() ?? "";
  const tips = block.exam_tips ?? [];

  return (
    <div className="min-w-0">
      {takeaway ? (
        <div className="rounded-lg border border-black/[0.10] bg-black/[0.02] p-4 dark:border-white/[0.14] dark:bg-white/[0.04]">
          <p className="m-0 mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/60">
            Key takeaway
          </p>
          <p className="m-0 font-body text-[16px] leading-relaxed text-ink">
            {takeaway}
          </p>
        </div>
      ) : null}

      {body ? (
        <details className={`group ${takeaway ? "mt-3" : ""}`}>
          <summary className="cursor-pointer list-none font-body text-[13px] font-semibold text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Understand it</span>
            <span className="hidden group-open:inline">Hide</span>
          </summary>
          <div className="pmq-markdown pmq-markdown--learn-core mt-3 min-w-0 max-w-full [&_.pmq-markdown]:mt-0">
            <MarkdownBlock content={body} />
          </div>
          {tips.length > 0 ? (
            <div className="mt-4">
              <ExamTipList tips={tips} />
            </div>
          ) : null}
        </details>
      ) : null}
    </div>
  );
}
