"use client";

import { useState } from "react";
import { NotifyDialog } from "@/components/NotifyDialog";
import { getPmqPlan, PMQ_AI_PRO_NOTIFY_KEY } from "@/lib/pmq/plans";
import styles from "./PmqPlanCards.module.css";

/**
 * The AI Pro Bundle waitlist control.
 *
 * Extracted from the pricing card so the guest Sly panel can show the identical
 * button when the free trial runs out, rather than a second, differently-worded
 * CTA for the same non-purchasable thing. The label comes from
 * `PMQ_PLANS.ai_pro.ctaLabel`, so both sites move together if it ever changes.
 *
 * AI Pro is `status: "waitlist"` in plans.ts — there is no checkout to send
 * anyone to, which is exactly why this is a waitlist capture and not a buy
 * button. Anything that offers to sell it would be advertising something the
 * user cannot actually buy.
 */
export function JoinWaitlistButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const label = getPmqPlan("ai_pro").ctaLabel;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? `${styles.ctaBtn} ${styles.ctaSecondary}`}
      >
        {label}
      </button>

      <NotifyDialog
        open={open}
        onClose={() => setOpen(false)}
        notifyKey={PMQ_AI_PRO_NOTIFY_KEY}
        subjectLabel="AI Pro Bundle"
        courseCopy="the AI Pro Bundle"
      />
    </>
  );
}

/** The pricing card's own chrome, for callers that want to match it exactly. */
export const joinWaitlistButtonClass = `${styles.ctaBtn} ${styles.ctaSecondary}`;
