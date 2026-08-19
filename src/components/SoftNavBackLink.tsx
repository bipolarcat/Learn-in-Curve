"use client";

import { useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { isSoftNavClick } from "@/lib/soft-nav-back";

type SoftNavBackLinkProps = {
  href: string;
  label: string;
  busyLabel: string;
  className?: string;
};

/**
 * Soft-nav back control. Same language as LO OverviewBackButton /
 * PricingBackLink (← + ring spinner while routing), as a real anchor.
 */
export function SoftNavBackLink({
  href,
  label,
  busyLabel,
  className = "",
}: SoftNavBackLinkProps) {
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
      className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-0.5 font-body text-[12px] font-semibold text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:text-[13px] ${pending ? "cursor-wait opacity-80" : ""} ${className}`.trim()}
      onClick={onClick}
    >
      {pending ? (
        <Spinner variant="ring" size={14} className="text-orange" aria-hidden />
      ) : (
        <>
          <span className="text-[0.95em]" aria-hidden>
            ←
          </span>
          {label}
        </>
      )}
    </Link>
  );
}
