"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createSlyTopUpCheckout } from "@/lib/pmq/actions";
import { formatGbp } from "@/lib/pmq/constants";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";
import {
  SLY_TOPUP_MIN_CENTS,
  SLY_TOPUP_PRESETS_CENTS,
  topUpCreditGbpCents,
} from "@/lib/tutor/constants";

type SlyTopUpDialogProps = {
  open: boolean;
  onClose: () => void;
  returnPath?: string;
};

export function SlyTopUpDialog({
  open,
  onClose,
  returnPath = "/dashboard",
}: SlyTopUpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const customId = useId();
  const [presetCents, setPresetCents] = useState<number | null>(
    SLY_TOPUP_PRESETS_CENTS[1],
  );
  const [customPounds, setCustomPounds] = useState("");
  const [customError, setCustomError] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const customCents = (() => {
    const n = Number.parseFloat(customPounds);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  })();

  const usingCustom = customPounds.trim() !== "";
  const amountCents = usingCustom ? customCents : presetCents;
  const validAmount =
    amountCents != null && amountCents >= SLY_TOPUP_MIN_CENTS;
  const creditCents = validAmount ? topUpCreditGbpCents(amountCents) : 0;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setCustomError("");
  }, [open]);

  const validateCustom = () => {
    if (!usingCustom) {
      setCustomError("");
      return true;
    }
    if (customCents == null || customCents < SLY_TOPUP_MIN_CENTS) {
      setCustomError("Enter at least £1");
      return false;
    }
    if (customCents > 50000) {
      setCustomError("Maximum is £500");
      return false;
    }
    setCustomError("");
    return true;
  };

  const handlePay = () => {
    setError("");
    if (usingCustom && !validateCustom()) return;
    if (!validAmount || amountCents == null) {
      setError("Choose an amount");
      return;
    }
    startTransition(async () => {
      const result = await createSlyTopUpCheckout({
        amountCents,
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

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,24rem)] max-w-[calc(100vw-1.5rem)] rounded-2xl border-[2.5px] border-ink bg-paper p-0 text-ink shadow-stickerMd backdrop:bg-ink/45 open:flex open:flex-col"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-display text-xl font-bold tracking-[-0.02em] text-balance"
            >
              Top up Sly
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-ink/70">
              Add fair-usage credit anytime. 70% goes to your metre.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border-2 border-ink/20 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-ink/60 transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            aria-label="Close"
          >
            Esc
          </button>
        </div>

        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="Preset amounts"
        >
          {SLY_TOPUP_PRESETS_CENTS.map((cents) => {
            const selected = !usingCustom && presetCents === cents;
            return (
              <button
                key={cents}
                type="button"
                onClick={() => {
                  setPresetCents(cents);
                  setCustomPounds("");
                  setCustomError("");
                }}
                className={`min-h-11 rounded-xl border-[2.5px] border-ink font-body text-xs font-bold uppercase tracking-[0.06em] transition-[background-color,color] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                  selected
                    ? "bg-orange text-paper"
                    : "bg-cream/60 text-ink hover:bg-cream"
                }`}
                aria-pressed={selected}
              >
                {formatGbp(cents)}
              </button>
            );
          })}
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor={customId}
            className="font-body text-[10px] font-bold uppercase tracking-[0.05em] text-ink/55"
          >
            Custom amount
          </label>
          <div className="flex items-center gap-2 rounded-xl border-[2.5px] border-ink bg-cream/40 px-3 py-2 focus-within:ring-2 focus-within:ring-orange focus-within:ring-offset-2 focus-within:ring-offset-paper">
            <span className="font-body text-sm font-bold text-ink/60" aria-hidden>
              £
            </span>
            <input
              id={customId}
              type="number"
              inputMode="decimal"
              min={1}
              max={500}
              step="0.01"
              placeholder="e.g. 3.50"
              value={customPounds}
              onChange={(e) => {
                setCustomPounds(e.target.value);
                setCustomError("");
              }}
              onBlur={validateCustom}
              className="min-w-0 flex-1 bg-transparent font-display text-lg font-bold tabular-nums tracking-[-0.02em] text-ink outline-none placeholder:font-body placeholder:text-sm placeholder:font-normal placeholder:text-ink/35"
            />
          </div>
          {customError ? (
            <p className={fieldErrorHint} role="alert">
              {customError}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-ink/15 bg-cream/50 px-3.5 py-3">
          <p className="font-display text-lg font-bold tabular-nums tracking-[-0.02em] text-ink">
            {validAmount ? formatGbp(creditCents) : "—"}
            <span className="ml-1.5 font-body text-[10px] font-bold uppercase tracking-[0.05em] text-ink/50">
              to metre
            </span>
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink/60">
            You&apos;ll add{" "}
            {validAmount ? formatGbp(creditCents) : "credit"} to your
            fair-usage metre (70%). Includes a 30% platform fee.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={pending || !validAmount || !!customError}
          aria-busy={pending}
          aria-label={
            pending
              ? "Redirecting to checkout"
              : validAmount
                ? `Pay ${formatGbp(amountCents)}`
                : "Pay"
          }
          className="btn btn-primary !min-h-12 w-full !rounded-xl !text-[13px] !uppercase !tracking-[0.07em] font-body disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Spinner variant="bars" size={16} className="text-current" aria-hidden />
          ) : validAmount ? (
            `Pay ${formatGbp(amountCents)}`
          ) : (
            "Pay"
          )}
        </button>
        {error ? (
          <p className={fieldErrorHint} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </dialog>
  );
}
