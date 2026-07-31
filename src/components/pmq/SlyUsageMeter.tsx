"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FairUsageSummary } from "@/lib/tutor/fair-usage";

type SlyUsageMeterProps = {
  usage: FairUsageSummary;
  /** Omitted in compact header variant — no top-up control shown. */
  onTopUp?: () => void;
  topUpSuccess?: boolean;
  /**
   * `header` = whisper inline bar for the AI tutor panel chrome.
   * `card` = compact interactive strip for the dashboard course card.
   */
  variant?: "default" | "header" | "card";
  className?: string;
};

/**
 * Shared fair-usage meter — dashboard course card and AI tutor panel header.
 */
export function SlyUsageMeter({
  usage,
  onTopUp,
  topUpSuccess = false,
  variant = "default",
  className = "",
}: SlyUsageMeterProps) {
  // Header/card metres stay painted — no entrance animation (avoids flicker).
  const [filled, setFilled] = useState(variant !== "default");
  const pct = Math.round(usage.remainingPercent);
  const usedPct = Math.min(100, Math.round(usage.percentUsed));
  const tone = usage.exceeded
    ? "rust"
    : usage.remainingPercent <= 20
      ? "orange"
      : "olive";

  useEffect(() => {
    if (variant !== "default") return;
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, [variant]);

  const fillClass =
    tone === "rust"
      ? "bg-rust"
      : tone === "orange"
        ? "bg-orange"
        : "bg-olive";

  const labelClass =
    tone === "rust"
      ? "text-rust"
      : tone === "orange"
        ? "text-orange"
        : "text-olive";

  const statusLabel = usage.exceeded
    ? "Sly fair-usage limit reached"
    : `Sly has ${pct}% of fair-usage budget remaining`;

  if (variant === "card") {
    const canTopUp = Boolean(onTopUp);
    return (
      <div className={`grid gap-1.5 ${className}`} role="status" aria-label={statusLabel}>
        {topUpSuccess ? (
          <p className="text-[10px] font-semibold text-olive">Top-up added</p>
        ) : null}
        <div className="flex items-center gap-2">
          <span
            className="relative inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-sand ring-1 ring-ink/10"
            aria-hidden
          >
            <Image
              src="/mascot/fox-face.svg"
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover object-top"
            />
          </span>

          <button
            type="button"
            disabled={!canTopUp}
            onClick={onTopUp}
            title={canTopUp ? "Top up fair-usage credit" : statusLabel}
            aria-label={
              canTopUp
                ? `${statusLabel}. Top up`
                : statusLabel
            }
            className="group relative flex min-h-6 min-w-0 flex-1 items-center gap-2 rounded-[0.25rem] px-0.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:enabled:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 focus-visible:ring-offset-paper disabled:cursor-default"
          >
            <div
              className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-[0.125rem] bg-ink/10 ring-1 ring-ink/5 transition-[box-shadow] duration-150 group-hover:enabled:ring-ink/15"
              aria-hidden
            >
              <div
                className={`h-full rounded-[0.125rem] ${fillClass} transition-[width] duration-500 ease-[var(--ease-out-quint)] motion-reduce:transition-none`}
                style={{
                  width: `${usage.exceeded ? 100 : usedPct}%`,
                }}
              />
            </div>
            <span
              className={`shrink-0 text-[11px] font-semibold tabular-nums tracking-tight ${labelClass}`}
            >
              {usage.exceeded ? "0%" : `${pct}%`}
            </span>
          </button>

          {canTopUp ? (
            <button
              type="button"
              onClick={onTopUp}
              className="inline-flex h-6 shrink-0 items-center justify-center rounded-[0.25rem] border border-ink/12 bg-paper px-1.5 text-[10px] font-semibold tracking-tight text-ink/70 transition-colors duration-150 hover:border-ink/20 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            >
              Top up
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === "header") {
    const headerPctClass = usage.exceeded
      ? "text-rust"
      : usage.remainingPercent <= 20
        ? "text-orange"
        : "text-paper/90";

    const headerFillClass = usage.exceeded ? "bg-rust" : "bg-orange";

    return (
      <div
        className={`flex min-w-[5.75rem] flex-col items-end gap-1 ${className}`}
        role="status"
        aria-label={statusLabel}
        title={statusLabel}
      >
        <span
          className={`text-[11px] font-semibold tabular-nums leading-none ${headerPctClass}`}
        >
          {usage.exceeded ? "0% left" : `${pct}% left`}
        </span>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-paper/30 ring-1 ring-paper/20"
          aria-hidden
        >
          <div
            className={`h-full rounded-full ${headerFillClass}`}
            style={{
              width: `${usage.exceeded ? 100 : usedPct}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5" role="status" aria-label={statusLabel}>
      {topUpSuccess ? (
        <p className="rounded-lg border border-olive/30 bg-olive/10 px-2.5 py-1.5 text-[11px] font-semibold text-olive">
          Top-up added to your metre
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <SlyAvatar />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ink">Sly</p>
            <p className="mt-0.5 text-[11px] text-ink/50">
              {usage.exceeded ? "Fair-usage limit reached" : "Fair-usage metre"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <p
            className={`text-lg font-bold leading-none tabular-nums tracking-[-0.02em] ${labelClass}`}
          >
            {usage.exceeded ? "0%" : `${pct}%`}
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-ink/45">
              left
            </span>
          </p>
          {onTopUp ? (
            <button
              type="button"
              onClick={onTopUp}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-ink/15 bg-paper px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Top up
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-ink/10"
        aria-hidden
      >
        <div
          className={`h-full rounded-full ${fillClass} transition-[width] duration-700 ease-[var(--ease-out-quint)] motion-reduce:transition-none`}
          style={{
            width: filled ? `${usage.exceeded ? 100 : usedPct}%` : "0%",
          }}
        />
      </div>
    </div>
  );
}

function SlyAvatar() {
  return (
    <span
      className="relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-sand ring-1 ring-ink/15"
      aria-hidden
    >
      <Image
        src="/mascot/fox-face.svg"
        alt=""
        width={32}
        height={32}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );
}
