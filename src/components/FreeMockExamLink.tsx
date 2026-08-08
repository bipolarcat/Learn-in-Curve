"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";

type FreeMockExamLinkProps = {
  className?: string;
  label?: string;
  /** Analytics `location` — defaults to hero. */
  location?: string;
};

/** Soft-nav to `/free-mock-exam` with ellipsis pending state. */
export function FreeMockExamLink({
  className,
  label = "Free PMQ mock exam",
  location = "hero",
}: FreeMockExamLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
        label
      )}
    </button>
  );
}
