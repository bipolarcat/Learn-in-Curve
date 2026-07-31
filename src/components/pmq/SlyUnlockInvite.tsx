"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createAiTutorCheckout } from "@/lib/pmq/actions";
import { AI_TUTOR_LAUNCHED, formatGbp } from "@/lib/pmq/constants";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";

type SlyUnlockInviteProps = {
  priceCents: number;
  loNumber?: number;
  returnPath?: string;
  /** Cap-hit vs soft tease while free messages remain. */
  urgency?: "soft" | "cap";
  /** full = ticket card; compact = one-line meta strip for chat chrome. */
  variant?: "full" | "compact";
  /** Shown in compact strip so free count isn't a second banner. */
  messagesRemaining?: number | null;
  className?: string;
};

/**
 * Desire-led unlock invite for Sly — ticket stub + quiet price, not a feature dump.
 * Used inside the AI tutor panel (and as AiTutorUpgradeCta's full variant).
 */
export function SlyUnlockInvite({
  priceCents,
  loNumber = 1,
  returnPath,
  urgency = "soft",
  variant = "full",
  messagesRemaining = null,
  className = "",
}: SlyUnlockInviteProps) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const priceLabel = formatGbp(priceCents);

  if (!AI_TUTOR_LAUNCHED) return null;

  const handleUnlock = () => {
    setError("");
    startTransition(async () => {
      const result = await createAiTutorCheckout({
        loNumber,
        returnPath,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  };

  if (variant === "compact") {
    const softCopy =
      messagesRemaining != null
        ? `${messagesRemaining} free message${messagesRemaining === 1 ? "" : "s"} left`
        : "Try Sly free";

    return (
      <div
        className={`border-b border-ink/25 bg-sand px-3 py-1.5 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <p className="min-w-0 flex-1 text-[11.5px] leading-snug text-ink/80">
            {urgency === "cap"
              ? "Free messages used — unlock to keep chatting."
              : softCopy}
          </p>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={pending}
            aria-busy={pending}
            aria-label={pending ? "Opening checkout" : "Unlock"}
            className="btn btn-primary shrink-0 !min-h-11 !rounded-xl !px-2.5 !py-1 !text-[10px] !uppercase !tracking-[0.06em]"
          >
            {pending ? (
              <Spinner variant="bars" size={14} className="text-current" aria-hidden />
            ) : (
              "Unlock"
            )}
          </button>
        </div>
        {error ? (
          <p className={`mt-1 ${fieldErrorHint}`} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`sly-unlock-invite relative overflow-hidden rounded-2xl border-[2.5px] border-ink bg-cream shadow-stickerMd motion-safe:animate-[sly-invite-in_0.55s_var(--ease-out-quint)_both] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden"
        aria-hidden
      >
        <span className="sly-unlock-shimmer block h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      <div className="relative grid gap-4 p-5">
        <div className="flex items-start gap-3">
          <span
            className="relative inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-full border-[2.5px] border-ink bg-sand shadow-[3px_3px_0_var(--shadow-ink)]"
            aria-hidden
          >
            <Image
              src="/mascot/fox-face.svg"
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover object-top"
            />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.12em] text-teal">
              {urgency === "cap" ? "Free messages used" : "Sly's waiting"}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-balance text-ink">
              {urgency === "cap"
                ? "Keep the conversation going"
                : "A tutor who already knows your weak spots"}
            </h3>
          </div>
        </div>

        <p className="text-[14px] leading-relaxed text-pretty text-ink/80">
          {urgency === "cap"
            ? "Unlock Sly once for this course — £5 of fair-usage credit, then top up anytime. Chat, quiz sets, and the AI-graded mock when you're ready."
            : `He stays on this exam, reads your quiz mistakes, and explains the bit that actually tripped you up. ${priceLabel} unlock includes £5 of Sly usage — top up anytime.`}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-ink/25 pt-4">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.1em] text-ink/45">
              One-time
            </p>
            <p className="font-display text-3xl font-bold leading-none tracking-[-0.03em] text-ink">
              {priceLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={pending}
            aria-busy={pending}
            aria-label={pending ? "Opening checkout" : `Unlock Sly — ${priceLabel}`}
            className="btn btn-primary !min-h-12 !rounded-xl !px-5 !py-2.5 !text-[12px] !uppercase !tracking-[0.08em] motion-safe:animate-[sly-cta-breathe_2.8s_ease-in-out_infinite]"
          >
            {pending ? (
              <Spinner variant="bars" size={16} className="text-current" aria-hidden />
            ) : (
              `Unlock Sly — ${priceLabel}`
            )}
          </button>
        </div>

        {error ? (
          <p className={fieldErrorHint} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
