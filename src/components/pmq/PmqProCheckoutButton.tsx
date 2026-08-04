"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { createAiTutorCheckout } from "@/lib/pmq/actions";
import { authHrefWithNext } from "@/lib/auth-next";
import { PMQ_PRICING_PRO_INTENT_HREF } from "@/lib/pmq/plans";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";

type PmqProCheckoutButtonProps = {
  label: string;
  className?: string;
  /** Where Stripe returns the buyer; defaults to the pricing page itself. */
  returnPath?: string;
  /** Guests are sent to sign-up first — checkout has no user to grant to. */
  isSignedIn: boolean;
  /** Set by the pricing page when the user has just returned with buy intent. */
  autoStart?: boolean;
};

/**
 * Pro Bundle checkout button.
 *
 * Deliberately NOT `AiTutorUpgradeCta`. That component returns `null` when
 * `AI_TUTOR_LAUNCHED` is false and hard-codes its own `btn btn-primary` chrome —
 * both wrong here. Pro is no longer "the AI tutor tier" (Sly moved to AI Pro), so
 * gating this CTA on the tutor flag would silently leave the Pro card with no way
 * to buy. The pricing page also needs stamp-CTA styling, not `btn`.
 *
 * Guests: `createAiTutorCheckout` returns `{ error: "Not signed in" }` and the
 * Stripe webhook grants entitlement on `metadata.user_id`, so a guest purchase
 * has no owner. Instead of surfacing that as an error at peak intent, route to
 * sign-up carrying `next=…?intent=pro`; the pricing page then passes `autoStart`
 * and checkout opens on its own. One extra step, no dead end.
 *
 * Still calls `createAiTutorCheckout` because that remains the only checkout
 * action and the underlying entitlement is still the single `ai_tutor` grant.
 * Renaming that action (and splitting the entitlement) is LIC-98.
 */
export function PmqProCheckoutButton({
  label,
  className = "",
  returnPath,
  isSignedIn,
  autoStart = false,
}: PmqProCheckoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // Guards double-submit: React 18 StrictMode mounts effects twice in dev, and
  // each run would create a second Stripe session.
  const startedRef = useRef(false);

  const openCheckout = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setError("");
    startTransition(async () => {
      const result = await createAiTutorCheckout({ returnPath });
      if ("error" in result && result.error) {
        startedRef.current = false;
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        posthog.capture("checkout_started", {
          product: "pmq_pro_bundle",
          entry_point: returnPath ?? "pricing_page",
        });
        window.location.href = result.url;
        return;
      }
      startedRef.current = false;
    });
  };

  const handleClick = () => {
    if (!isSignedIn) {
      router.push(
        authHrefWithNext("/auth/sign-up", PMQ_PRICING_PRO_INTENT_HREF),
      );
      return;
    }
    openCheckout();
  };

  useEffect(() => {
    if (autoStart && isSignedIn) openCheckout();
    // openCheckout is stable for this component's lifetime; the ref guards reruns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isSignedIn]);

  const busy = pending || (autoStart && isSignedIn && !error);

  return (
    <div className="grid w-full gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        aria-label={busy ? "Opening checkout" : label}
        className={`${className} disabled:cursor-wait disabled:opacity-90`}
      >
        {busy ? (
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
      {error ? (
        <p role="alert" className={fieldErrorHint}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
