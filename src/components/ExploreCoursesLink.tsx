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
};

const HREF = withSoftNavFrom("/courses", "home");

/** Hero / marketing soft-nav to `/courses` with ellipsis pending state. */
export function ExploreCoursesLink({ className }: ExploreCoursesLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({
      variant: "Explore Courses",
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
      aria-busy={pending}
      aria-disabled={pending || undefined}
      aria-label={pending ? "Opening courses" : undefined}
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
          Explore Courses
          <CtaArrowUpRight />
        </>
      )}
    </Link>
  );
}
