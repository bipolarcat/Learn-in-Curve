"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  label?: string;
  isSignedIn: boolean;
  autoStart?: boolean;
  className?: string;
};

export function PfqCheckoutButton({
  label = `Get PFQ in 2 Days — ${formatPfqPriceGbp()}`,
  isSignedIn,
  autoStart = false,
  className = "",
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const autoStarted = useRef(false);

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
      const result = await createPfqCheckout();
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
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        className={`${stampCtaPrimary} ${className} disabled:opacity-60`}
        disabled={pending}
        aria-busy={pending}
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
