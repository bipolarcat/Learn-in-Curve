"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";

type FreeMockExamLinkProps = {
  className?: string;
};

/** Hero soft-nav to `/free-mock-exam` — same pending pattern as Explore Courses. */
export function FreeMockExamLink({ className }: FreeMockExamLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening free mock exam" : "Free PMQ mock exam"}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-80`}
      onClick={() => {
        trackCtaClicked({
          variant: "Free PMQ mock exam",
          location: "hero",
        });
        startTransition(() => {
          router.push("/free-mock-exam");
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
        "Free PMQ mock exam"
      )}
    </button>
  );
}
