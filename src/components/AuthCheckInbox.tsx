"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasConfirmedSession } from "@/lib/auth-actions";
import { DEFAULT_AUTH_NEXT_PATH, getSafeNextPath } from "@/lib/auth-next";
import { formActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";

const COOLDOWN_MS = 60_000;

type AuthCheckInboxProps = {
  email: string;
  /** saas = quiet auth chrome; default = ticket/body chrome */
  variant?: "default" | "saas";
  /** Where Continue lands once the emailed link has been clicked. */
  nextPath?: string;
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
  nextPath = DEFAULT_AUTH_NEXT_PATH,
  onUseDifferentEmail,
}: AuthCheckInboxProps) {
  const supabase = createClient();
  const cardRef = useRef<HTMLDivElement>(null);
  /** Guards overlapping session checks (focus events fire in bursts). */
  const checkingRef = useRef(false);
  const [footerMode, setFooterMode] = useState<FooterMode>("actions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resending, setResending] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [notConfirmedYet, setNotConfirmedYet] = useState(false);

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

  /**
   * Auto-resolve when this tab comes back into focus.
   *
   * The confirmation link opens elsewhere, so the moment this tab becomes
   * visible again is the moment the session most likely exists. Checking then
   * means the common path needs no button press at all, and Continue stays as
   * the explicit fallback. Silent by design: a failed check here must not
   * flash "that link hasn't been opened yet" at someone who simply alt-tabbed.
   */
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      void goIfConfirmed({ silent: true });
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // goIfConfirmed only closes over nextPath and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPath]);

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

  /**
   * The user confirms in their mail client, comes back to this tab, and has
   * nowhere to go: the card is terminal. Continue is the way out.
   *
   * This asks the SERVER whether a session exists, via hasConfirmedSession().
   * It used to call `supabase.auth.getSession()` on this tab's browser client
   * and that reported "not confirmed" for users who were provably signed in,
   * because the emailed link opens a separate tab and /auth/confirm writes the
   * auth cookies server-side. This tab never hears about it: the session lives
   * in cookies, not localStorage, so no cross-tab `storage` event fires. See
   * src/lib/auth-actions.ts.
   *
   * On success this is a FULL navigation, not router.push. The destination is
   * server-rendered and gated, so it has to re-read the cookie jar on the
   * server; a soft client-side nav would carry this tab's stale auth state.
   */
  async function goIfConfirmed({ silent }: { silent: boolean }) {
    if (checkingRef.current) return;
    checkingRef.current = true;

    if (!silent) {
      setContinuing(true);
      setNotConfirmedYet(false);
    }

    try {
      const confirmed = await hasConfirmedSession();

      if (confirmed) {
        // Leave the spinner up: the page is being replaced.
        window.location.assign(getSafeNextPath(nextPath));
        return;
      }

      if (!silent) {
        setNotConfirmedYet(true);
        setContinuing(false);
      }
    } catch {
      if (!silent) {
        setNotConfirmedYet(true);
        setContinuing(false);
      }
    } finally {
      checkingRef.current = false;
    }
  }

  async function handleContinue() {
    if (continuing) return;
    await goIfConfirmed({ silent: false });
  }

  const saas = variant === "saas";
  const linkBtn =
    "bg-transparent p-0 font-inherit underline decoration-ink/20 underline-offset-[0.15em] transition-colors duration-150 ease-[var(--ease-out-quint)] hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:opacity-60";

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

        <button
          type="button"
          onClick={handleContinue}
          disabled={continuing}
          aria-busy={continuing}
          aria-label={
            continuing ? "Checking confirmation" : "Continue after confirming"
          }
          className={`${formActionPrimary} mt-4 w-full disabled:opacity-60`}
        >
          {continuing ? (
            <Spinner
              variant="bars"
              size={16}
              className="text-current"
              aria-hidden
            />
          ) : (
            "Continue"
          )}
        </button>

        <p
          className={`m-0 mt-2 max-w-[32ch] text-[12px] leading-snug text-ink/45 text-pretty ${saas ? "" : "font-body"}`}
          role={notConfirmedYet ? "status" : undefined}
        >
          {notConfirmedYet
            ? "That link hasn't been opened yet — confirm from your email, then press Continue."
            : "Already confirmed in another tab? Press Continue."}
        </p>

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
