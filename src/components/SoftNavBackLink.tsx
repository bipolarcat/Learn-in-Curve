"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

type SoftNavBackLinkProps = {
  href: string;
  label: string;
  busyLabel: string;
  className?: string;
};

/**
 * Soft-nav back control — same language as LO OverviewBackButton /
 * PricingBackLink (← + ring spinner while routing).
 */
export function SoftNavBackLink({
  href,
  label,
  busyLabel,
  className = "",
}: SoftNavBackLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? busyLabel : label}
      className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-0.5 font-body text-[12px] font-semibold text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-wait disabled:opacity-80 sm:text-[13px] ${className}`.trim()}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
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
    </button>
  );
}
