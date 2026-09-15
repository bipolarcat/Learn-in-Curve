"use client";

import { useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CtaArrowUpRight } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { isSoftNavClick, withSoftNavFrom } from "@/lib/soft-nav-back";
import { trackCtaClicked } from "@/lib/analytics/events";

type ExploreCoursesLinkProps = {
  className?: string;
  /** Visible label — defaults to sentence-case to match home hero mock. */
  label?: string;
  showArrow?: boolean;
};

const HREF = withSoftNavFrom("/courses", "home");

/** Hero / marketing soft-nav to `/courses` with ellipsis pending state. */
export function ExploreCoursesLink({
  className,
  label = "Explore courses",
  showArrow = true,
}: ExploreCoursesLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({
      variant: label,
      location: "hero",
    });
    if (!isSoftNavClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(HREF);
    });
  };

  return (
    <Link
      href={HREF}
      aria-busy={pending || undefined}
      aria-label={pending ? "Opening courses" : undefined}
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
        <>
          {label}
          {showArrow ? <CtaArrowUpRight /> : null}
        </>
      )}
    </Link>
  );
}
