"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_MS = 60_000;

type AuthCheckInboxProps = {
  email: string;
  /** saas = quiet auth chrome; default = ticket/body chrome */
  variant?: "default" | "saas";
  onUseDifferentEmail: () => void;
};

type FooterMode = "actions" | "cooldown" | "failed";

function storageKey(email: string) {
  return `lic_resend_until:${email.trim().toLowerCase()}`;
}

function readUntil(email: string): number | null {
  try {
    const raw = sessionStorage.getItem(storageKey(email));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeUntil(email: string, until: number) {
  try {
    sessionStorage.setItem(storageKey(email), String(until));
  } catch {
    // Private mode / blocked storage — in-memory countdown still works this session.
  }
}

function clearUntil(email: string) {
  try {
    sessionStorage.removeItem(storageKey(email));
  } catch {
    /* ignore */
  }
}

function secondsRemaining(email: string): number {
  const until = readUntil(email);
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function MailGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      aria-hidden
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Quiet post–sign-up confirmation card. Replaces the auth form when
 * Supabase returns no session (confirm-email on).
 */
export function AuthCheckInbox({
  email,
  variant = "saas",
  onUseDifferentEmail,
}: AuthCheckInboxProps) {
  const supabase = createClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const [footerMode, setFooterMode] = useState<FooterMode>("actions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resending, setResending] = useState(false);

  // Restore refresh-proof cooldown from sessionStorage.
  useEffect(() => {
    const left = secondsRemaining(email);
    if (left > 0) {
      setFooterMode("cooldown");
      setSecondsLeft(left);
    }
  }, [email]);

  // Tick countdown while cooling down (or after a failed send that still holds the lock).
  useEffect(() => {
    if (footerMode !== "cooldown" && footerMode !== "failed") return;

    const id = window.setInterval(() => {
      const left = secondsRemaining(email);
      if (left <= 0) {
        clearUntil(email);
        setSecondsLeft(0);
        setFooterMode("actions");
        return;
      }
      setSecondsLeft(left);
    }, 250);

    return () => window.clearInterval(id);
  }, [footerMode, email]);

  // Move focus onto the card when it replaces the form.
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  async function handleResend() {
    if (resending) return;

    const existing = secondsRemaining(email);
    if (existing > 0) {
      setFooterMode("cooldown");
      setSecondsLeft(existing);
      return;
    }

    // Enter cooldown before the network call — defence against email bombing.
    const until = Date.now() + COOLDOWN_MS;
    writeUntil(email, until);
    setFooterMode("cooldown");
    setSecondsLeft(60);
    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        // Stay throttled; swap copy to the quiet failure line.
        setFooterMode("failed");
      }
    } catch {
      setFooterMode("failed");
    } finally {
      setResending(false);
    }
  }

  const saas = variant === "saas";
  const linkBtn =
    "bg-transparent p-0 font-inherit underline decoration-ink/20 underline-offset-[0.15em] transition-colors duration-150 ease-[var(--ease-out-quint)] hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60";

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      className={`outline-none ${saas ? "w-full" : "w-full max-w-md"}`}
    >
      <div
        className={`flex flex-col items-center text-center ${saas ? "px-0.5 py-1" : "px-1 py-2"}`}
      >
        <div
          role="status"
          aria-live="polite"
          className="flex w-full flex-col items-center"
        >
          <div
            className="mb-3.5 flex size-[34px] items-center justify-center rounded-[9px] text-[#D5501F]"
            style={{ background: "rgba(213, 80, 31, 0.10)" }}
            aria-hidden
          >
            <MailGlyph />
          </div>

          <h2
            className={`m-0 text-ink ${saas ? "text-[16px] font-medium" : "font-body text-[16px] font-medium"}`}
          >
            Check your inbox
          </h2>

          <p
            className={`mt-1.5 m-0 max-w-[32ch] text-[13px] leading-snug text-ink/60 text-pretty ${saas ? "" : "font-body"}`}
          >
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-ink [overflow-wrap:anywhere]">
              {email}
            </span>
          </p>
        </div>

        <div
          className={`my-4 h-px w-full ${saas ? "bg-ink/[0.08]" : "bg-ink/10"}`}
          aria-hidden
        />

        {footerMode === "cooldown" ? (
          <p
            className={`m-0 text-[12px] text-ink/45 ${saas ? "" : "font-body"}`}
            aria-hidden
          >
            Sent — you can resend in{" "}
            <span className="tabular-nums">{secondsLeft}s</span>
          </p>
        ) : footerMode === "failed" ? (
          <p
            className={`m-0 text-[12px] text-ink/55 ${saas ? "" : "font-body"}`}
            role="status"
          >
            Couldn&apos;t resend. Try again in a moment.
          </p>
        ) : (
          <p className={`m-0 text-[12px] text-ink/45 ${saas ? "" : "font-body"}`}>
            Not there? Check spam, or{" "}
            <button
              type="button"
              className={`${linkBtn} text-orange`}
              onClick={handleResend}
              disabled={resending}
              aria-label="Resend confirmation email"
            >
              resend
            </button>
            {" · "}
            <button
              type="button"
              className={`${linkBtn} text-ink/55`}
              onClick={onUseDifferentEmail}
            >
              use a different email
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
