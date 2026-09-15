"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createPfqCheckout } from "@/lib/pfq/checkout";
import { authHrefWithNext } from "@/lib/auth-next";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_PRICING_PRO_INTENT_HREF,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";
import { stampCtaPrimary } from "@/components/stamp-chip";

type Props = {
  label?: ReactNode;
  /** Accessible name when `label` is not a plain string. */
  ariaLabel?: string;
  isSignedIn: boolean;
  autoStart?: boolean;
  /** Compact row layout (dashboard footer) — wrapper does not stretch full width. */
  inline?: boolean;
  /**
   * Stripe Back / cancel (and success) return path. Defaults to pricing.
   * Dashboard passes `/dashboard`; pricing leaves default; Learn/mock pass self.
   */
  returnPath?: string;
  className?: string;
};

export function PfqCheckoutButton({
  label = `Get PFQ in 2 Days — ${formatPfqPriceGbp()}`,
  ariaLabel,
  isSignedIn,
  autoStart = false,
  inline = false,
  returnPath,
  className,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const autoStarted = useRef(false);
  const defaultAria =
    typeof label === "string"
      ? label
      : `Get PFQ in 2 Days — ${formatPfqPriceGbp()}`;

  function startCheckout() {
    setError("");
    if (!isSignedIn) {
      router.push(authHrefWithNext("/auth/sign-up", PFQ_PRICING_PRO_INTENT_HREF));
      return;
    }
    if (!PFQ_CHECKOUT_ENABLED) {
      setError(
        "Checkout is built but not live yet — waiting on review of the cancellation-waiver wording before real charges.",
      );
      return;
    }
    startTransition(async () => {
      const result = await createPfqCheckout({ returnPath });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  useEffect(() => {
    if (!autoStart || autoStarted.current || !isSignedIn) return;
    autoStarted.current = true;
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isSignedIn]);

  return (
    <div className={inline ? "inline-grid max-w-full gap-1.5" : "grid w-full gap-1.5"}>
      <button
        type="button"
        className={`${className ?? stampCtaPrimary} disabled:cursor-wait disabled:opacity-90`}
        disabled={pending}
        aria-busy={pending}
        aria-label={pending ? "Opening checkout" : (ariaLabel ?? defaultAria)}
        onClick={startCheckout}
      >
        {pending ? (
          <Spinner variant="bars" size={16} className="text-current" />
        ) : (
          label
        )}
      </button>
      {error ? (
        <p className={fieldErrorHint} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
