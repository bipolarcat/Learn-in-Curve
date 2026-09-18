"use client";

import { useTransition, type MouseEvent, type ReactNode } from "react";
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
  /** Visible label. Prefer a string; use a node for accents (e.g. bold exam code). */
  label?: ReactNode;
  /** Plain label for analytics / aria when `label` is a React node. */
  analyticsLabel?: string;
  /** Destination path — defaults to legacy `/free-mock-exam` (301 → APM PMQ). */
  href?: string;
  /** Analytics `location` — defaults to hero. */
  location?: string;
  /** Right arrow after the label (library / page CTAs). */
  showArrow?: boolean;
  /** Soft-nav `?from=` so free-mock can show a contextual back control. */
  from?: SoftNavFrom;
};

/** Soft-nav to a free-mock exam with ellipsis pending state. */
export function FreeMockExamLink({
  className,
  label = "Free PMQ mock exam",
  analyticsLabel,
  href: hrefProp = "/free-mock-exam",
  location = "hero",
  showArrow = false,
  from,
}: FreeMockExamLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = from ? withSoftNavFrom(hrefProp, from) : hrefProp;
  const plainLabel =
    analyticsLabel ?? (typeof label === "string" ? label : "Free mock exam");

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({
      variant: plainLabel,
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
      aria-busy={pending || undefined}
      aria-label={pending ? `Opening ${plainLabel}` : plainLabel}
      tabIndex={pending ? -1 : undefined}
      className={`${className ?? ""} ${pending ? "pointer-events-none opacity-80" : ""}`.trim()}
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
        <span className="relative z-[1] inline-flex items-center gap-1.5" aria-hidden>
          <span className="inline">{label}</span>
          {showArrow ? <CtaArrow /> : null}
        </span>
      )}
    </Link>
  );
}
