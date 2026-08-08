"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import {
  type SoftNavFrom,
  withSoftNavFrom,
} from "@/lib/soft-nav-back";

type FreeMockExamLinkProps = {
  className?: string;
  label?: string;
  /** Analytics `location` — defaults to hero. */
  location?: string;
  /** Right arrow after the label (library / page CTAs). */
  showArrow?: boolean;
  /** Soft-nav `?from=` so free-mock can show a contextual back control. */
  from?: SoftNavFrom;
};

/** Soft-nav to `/free-mock-exam` with ellipsis pending state. */
export function FreeMockExamLink({
  className,
  label = "Free PMQ mock exam",
  location = "hero",
  showArrow = false,
  from,
}: FreeMockExamLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = from ? withSoftNavFrom("/free-mock-exam", from) : "/free-mock-exam";

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening free mock exam" : label}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-80`}
      onClick={() => {
        trackCtaClicked({
          variant: label,
          location,
        });
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {pending ? (
        <Spinner
          variant="ellipsis"
          size={14}
          className="text-current"
          aria-hidden
        />
      ) : (
        <>
          {label}
          {showArrow ? <CtaArrow /> : null}
        </>
      )}
    </button>
  );
}
