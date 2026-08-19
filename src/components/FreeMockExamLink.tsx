"use client";

import { useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import {
  type SoftNavFrom,
  isSoftNavClick,
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

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({
      variant: label,
      location,
    });
    if (!isSoftNavClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      aria-busy={pending}
      aria-disabled={pending || undefined}
      aria-label={pending ? "Opening free mock exam" : undefined}
      className={`${className ?? ""} ${pending ? "cursor-wait opacity-80" : ""}`.trim()}
      onClick={onClick}
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
    </Link>
  );
}
