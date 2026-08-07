"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CtaArrowUpRight } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { withSoftNavFrom } from "@/lib/soft-nav-back";
import { trackCtaClicked } from "@/lib/analytics/events";

type ExploreCoursesLinkProps = {
  className?: string;
};

/** Hero / marketing soft-nav to `/courses` with ellipsis pending state. */
export function ExploreCoursesLink({ className }: ExploreCoursesLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening courses" : "Explore Courses"}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-80`}
      onClick={() => {
        trackCtaClicked({
          variant: "Explore Courses",
          location: "hero",
        });
        startTransition(() => {
          router.push(withSoftNavFrom("/courses", "home"));
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
          Explore Courses
          <CtaArrowUpRight />
        </>
      )}
    </button>
  );
}
