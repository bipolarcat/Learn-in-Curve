"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CtaArrow,
  stampCtaPrimaryCompact,
} from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";

type NotifyDialogProps = {
  open: boolean;
  onClose: () => void;
  /**
   * Value stored in `newsletter_subscribers.course`. Any string up to 64 chars —
   * `/api/notify` doesn't validate against a fixed list, so this doubles as the
   * segment key when the list is exported.
   */
  notifyKey: string;
  /** Short name for aria labels, e.g. "PFQ in 2 Days" or "AI Pro Bundle". */
  subjectLabel: string;
  /** How the thing is referred to mid-sentence, e.g. "the AI Pro Bundle". */
  courseCopy: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Full landing mailbox mark (pole + ground + tipped flag). */
function NotifyMailboxMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      aria-hidden
    >
      <line
        x1="90"
        y1="360"
        x2="310"
        y2="360"
        stroke="#1B6560"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="185" y="260" width="30" height="100" rx="6" fill="#241A12" />
      <path
        d="M110,270 L110,190 A90,90 0 0 1 290,190 L290,270 Z"
        fill="#D5501F"
        stroke="#241A12"
        strokeWidth="14"
        strokeLinejoin="round"
      />
      <path
        d="M124,192 A78,78 0 0 1 162,108"
        fill="none"
        stroke="#241A12"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1="130"
        y1="228"
        x2="270"
        y2="228"
        stroke="#241A12"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <g transform="rotate(78 290 196)">
        <line
          x1="290"
          y1="196"
          x2="290"
          y2="156"
          stroke="#241A12"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <polygon
          points="290,156 322,144 322,182"
          fill="#1B6560"
          stroke="#241A12"
          strokeWidth="8"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function normalizeEmailClient(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Generic launch-waitlist dialog. Extracted from the PFQ-specific version so the
 * AI Pro Bundle card can reuse the same capture, endpoint and consent handling —
 * `PfqNotifyDialog` is now a thin wrapper around this.
 */
export function NotifyDialog({
  open,
  onClose,
  notifyKey,
  subjectLabel,
  courseCopy,
}: NotifyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleId = useId();
  const emailId = useId();
  const marketingId = useId();
  const errorId = useId();
  const successId = useId();
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [loggedEmail, setLoggedEmail] = useState("");
  const [loggedMarketing, setLoggedMarketing] = useState(false);

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
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }
    setEmail("");
    setMarketingConsent(false);
    setStatus("idle");
    setMessage("");
    setLoggedEmail("");
    setLoggedMarketing(false);
    // Focus email after paint so the dialog is open
    const t = window.setTimeout(() => emailRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    const normalized = normalizeEmailClient(email);
    if (!normalized) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          // `list` is the current field; a key from src/lib/notify/lists.ts.
          list: notifyKey,
          marketingConsent,
        }),
        signal: controller.signal,
      });

      let data: {
        error?: string;
        email?: string;
        alreadySubscribed?: boolean;
        marketingConsent?: boolean;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        if (!res.ok) {
          setStatus("error");
          setMessage("Couldn’t save your email. Try again.");
          return;
        }
      }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Couldn’t save your email. Try again.");
        emailRef.current?.focus();
        return;
      }

      const savedMarketing = data.marketingConsent === true;
      setLoggedEmail(data.email ?? normalized);
      setLoggedMarketing(savedMarketing);
      setStatus("success");
      setMessage(
        savedMarketing
          ? data.alreadySubscribed
            ? `You’re already on the list — we’ll email you about ${courseCopy} and send the occasional PM & AI update.`
            : `We’ll email you when ${courseCopy} launches, plus occasional PM & AI newsletters.`
          : data.alreadySubscribed
            ? `You’re already on the list — we’ll email you when ${courseCopy} launches.`
            : `We’ll email you when ${courseCopy} launches.`,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("error");
      setMessage(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "You’re offline. Check your connection and try again."
          : "Couldn’t save your email. Try again.",
      );
      emailRef.current?.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,32rem)] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-black/[0.08] bg-paper p-0 text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_18px_48px_rgb(var(--ink-rgb)_/_0.18)] backdrop:bg-ink/45 open:flex open:flex-col dark:border-white/[0.12]"
      aria-labelledby={status === "success" ? titleId : undefined}
      aria-label={
        status === "success" ? undefined : `Notify me about ${subjectLabel}`
      }
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        if (status === "submitting") return;
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && status !== "submitting") onClose();
      }}
    >
      <div className="relative px-5 pb-3.5 pt-2.5 sm:px-6 sm:pb-4 sm:pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={status === "submitting"}
          className="absolute right-2.5 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-xl text-ink/55 transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none sm:right-3 sm:top-2.5"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {status === "success" ? (
          <div
            id={successId}
            role="status"
            aria-live="polite"
            className="grid gap-4 pr-6"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <NotifyMailboxMark className="h-12 w-12 sm:h-14 sm:w-14" />
              <div className="min-w-0 max-w-full grid gap-1.5">
                <h2
                  id={titleId}
                  className="font-display text-lg font-bold tracking-[-0.03em] text-balance"
                >
                  You’re on the list
                </h2>
                <p className="font-body text-sm leading-relaxed text-ink">
                  <span className="font-semibold text-olive">Logged:</span>{" "}
                  <span className="break-all [overflow-wrap:anywhere]">
                    {loggedEmail}
                  </span>
                </p>
                {loggedMarketing ? (
                  <p className="font-body text-xs leading-relaxed text-ink/70">
                    Marketing emails: opted in
                  </p>
                ) : null}
                <p className="font-body text-xs leading-relaxed text-ink/65 text-pretty">
                  {message}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-4"
            noValidate
          >
            <div className="flex justify-center" aria-hidden>
              <NotifyMailboxMark className="h-12 w-12 sm:h-14 sm:w-14" />
            </div>

            <div
              className="grid min-w-0 items-center gap-x-2.5 gap-y-2"
              style={{
                gridTemplateColumns: "minmax(0, 1fr) auto",
              }}
            >
              <label className="sr-only" htmlFor={emailId}>
                Email address
              </label>
              <input
                ref={emailRef}
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => {
                  const next = e.target.value.slice(0, EMAIL_MAX);
                  setEmail(next);
                  if (status === "error") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="you@email.com"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="send"
                maxLength={EMAIL_MAX}
                required
                disabled={status === "submitting"}
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? errorId : undefined}
                className={`col-start-1 row-start-1 h-8 min-h-8 min-w-0 w-full rounded-xl border bg-cream/80 px-3 font-body text-sm leading-none text-ink placeholder:text-ink/45 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06)] transition-[border-color] duration-200 ease-[var(--ease-out-quint)] focus:outline-none focus:border-ink/15 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60 motion-reduce:transition-none ${
                  status === "error" ? "border-ink/25" : "border-ink/15"
                }`}
              />

              <button
                type="submit"
                disabled={status === "submitting"}
                aria-busy={status === "submitting"}
                aria-label={status === "submitting" ? "Saving" : "Notify me"}
                className={`${stampCtaPrimaryCompact} col-start-2 row-start-1 !h-8 min-w-0 shrink-0 justify-center self-center disabled:opacity-60`}
              >
                {status === "submitting" ? (
                  <Spinner variant="bars" size={14} className="text-current" aria-hidden />
                ) : (
                  <>
                    Notify me
                    <CtaArrow />
                  </>
                )}
              </button>

              <label
                htmlFor={marketingId}
                className="col-start-1 col-end-3 row-start-2 flex max-w-full cursor-pointer items-start gap-2 text-left"
              >
                <input
                  id={marketingId}
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  disabled={status === "submitting"}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-ink/30 text-orange accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
                />
                <span className="min-w-0 font-body text-[11px] leading-snug text-ink/75 text-pretty">
                  Also send me newsletters about project management and AI,
                  blogs, tips, and other updates from Learn in Curve.
                </span>
              </label>
            </div>

            {status === "error" ? (
              <div
                id={errorId}
                role="alert"
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <p className={`max-w-full break-words ${fieldErrorHint}`}>
                  {message}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                    emailRef.current?.focus();
                  }}
                  className="font-body text-[10px] font-semibold text-ink/70 underline decoration-ink/25 underline-offset-2 hover:text-ink"
                >
                  Try again
                </button>
              </div>
            ) : (
              <p className="flex flex-col items-center gap-0.5 text-center font-body leading-snug text-ink/50 [font-size:clamp(8px,2.65vw,10px)]">
                <span className="whitespace-nowrap">
                  We&apos;ll email you about this course.
                </span>
                <span className="whitespace-nowrap">
                  You&apos;ll only receive marketing emails if you tick the
                  box.{" "}
                  <Link
                    href="/privacy"
                    className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
                  >
                    Privacy
                  </Link>
                </span>
              </p>
            )}
          </form>
        )}
      </div>
    </dialog>
  );
}
