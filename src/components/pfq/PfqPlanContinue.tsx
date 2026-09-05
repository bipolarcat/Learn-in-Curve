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

type PfqPlanContinueProps = {
  nextObjective: number | null;
  started: boolean;
};

/**
 * Title-bar Continue / Start / Sit mock — same dialect as PmqPlanContinue.
 */
export function PfqPlanContinue({
  nextObjective,
  started,
}: PfqPlanContinueProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const href =
    nextObjective != null
      ? `${PFQ_LEARN_HREF}/${nextObjective}`
      : PFQ_MOCK_HREF;
  const label =
    nextObjective != null ? (started ? "Continue" : "Start") : "Sit mock";

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? `Opening ${label}` : label}
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
