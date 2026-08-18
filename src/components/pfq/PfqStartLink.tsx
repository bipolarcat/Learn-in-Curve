"use client";

import {
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import {
  type SoftNavFrom,
  withSoftNavFrom,
} from "@/lib/soft-nav-back";
import { trackCtaClicked } from "@/lib/analytics/events";

type PfqStartLinkProps = {
  isSignedIn: boolean;
  className?: string;
  children: ReactNode;
  showArrow?: boolean;
  from?: SoftNavFrom;
  analyticsLocation?: string;
  analyticsVariant?: string;
};

const GUEST_PATH = "/pfq/preview";
const SIGNED_IN_PATH = "/dashboard";

/**
 * PFQ "Enrol for Free" — account creation only.
 * Guest → PFQ preview sign-up. Signed-in → dashboard.
 * Does not unlock the Pro-gated course.
 */
export function PfqStartLink({
  isSignedIn,
  className,
  children,
  showArrow = true,
  from,
  analyticsLocation,
  analyticsVariant,
}: PfqStartLinkProps) {
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

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening sign-up" : undefined}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-80`}
      onClick={() => {
        if (analyticsLocation) {
          const variant =
            analyticsVariant ??
            (typeof children === "string" ? children : "pfq_start");
          trackCtaClicked({ variant, location: analyticsLocation });
        }
        startTransition(() => {
          router.push(href);
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
          {children}
          {showArrow ? <CtaArrow /> : null}
        </>
      )}
    </button>
  );
}
