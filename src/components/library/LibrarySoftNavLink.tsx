"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

type LibrarySoftNavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  busyLabel: string;
  /** Ring for text links; ellipsis for stamp CTAs. */
  spinner?: "ring" | "ellipsis";
  spinnerClassName?: string;
  spinnerSize?: number;
};

/**
 * Soft-nav link for library hub / article chrome — spinner replaces label while routing.
 */
export function LibrarySoftNavLink({
  href,
  children,
  className = "",
  busyLabel,
  spinner = "ring",
  spinnerClassName = "text-orange",
  spinnerSize = 14,
}: LibrarySoftNavLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? busyLabel : undefined}
      className={`${className} disabled:cursor-wait disabled:opacity-80`.trim()}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {pending ? (
        <Spinner
          variant={spinner}
          size={spinnerSize}
          className={spinnerClassName}
          aria-hidden
        />
      ) : (
        children
      )}
    </button>
  );
}
