"use client";

import {
  useEffect,
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import {
  type SoftNavFrom,
  isSoftNavClick,
  withSoftNavFrom,
} from "@/lib/soft-nav-back";
import { trackCtaClicked } from "@/lib/analytics/events";

type PmqStartLinkProps = {
  isSignedIn: boolean;
  className?: string;
  children: ReactNode;
  /** When false, hides the trailing CTA arrow. Default true. */
  showArrow?: boolean;
  /**
   * Where “Back …” should return from the preview signup card.
   * Omitted → no back control on the destination.
   */
  from?: SoftNavFrom;
  /** PostHog `cta_clicked.location` — omit to skip tracking. */
  analyticsLocation?: string;
  /** PostHog `cta_clicked.variant` — defaults to a stringified children label. */
  analyticsVariant?: string;
};

const GUEST_PATH = `/courses/${PMQ_SLUG}/preview`;
const SIGNED_IN_PATH = "/dashboard";

/**
 * Primary free CTA — same destination as Quiz “Enrol to PMQ for free”.
 * Guest → PMQ preview sign-up card (form only).
 * Signed-in → dashboard.
 */
export function PmqStartLink({
  isSignedIn,
  className,
  children,
  showArrow = true,
  from,
  analyticsLocation,
  analyticsVariant,
}: PmqStartLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const guestHref = from ? withSoftNavFrom(GUEST_PATH, from) : GUEST_PATH;
  const [href, setHref] = useState(isSignedIn ? SIGNED_IN_PATH : guestHref);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setHref(user ? SIGNED_IN_PATH : guestHref);
    });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, guestHref]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (analyticsLocation) {
      const variant =
        analyticsVariant ??
        (typeof children === "string" ? children : "pmq_start");
      trackCtaClicked({ variant, location: analyticsLocation });
    }
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
      aria-label={pending ? "Opening course" : undefined}
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
          {children}
          {showArrow ? <CtaArrow /> : null}
        </>
      )}
    </Link>
  );
}
