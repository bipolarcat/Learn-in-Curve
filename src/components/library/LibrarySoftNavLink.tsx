"use client";

import { useTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { isSoftNavClick } from "@/lib/soft-nav-back";

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
 * Soft-nav link for library hub / article chrome. Real anchor for crawlers
 * and new-tab clicks; spinner replaces the label while routing.
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

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
      aria-label={pending ? busyLabel : undefined}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${pending ? "cursor-wait opacity-80" : ""}`.trim()}
      onClick={onClick}
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
    </Link>
  );
}
