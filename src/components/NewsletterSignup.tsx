"use client";

import { useState } from "react";
import Link from "next/link";
import { CtaArrow, stampCtaPrimaryCompact } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrorHint } from "@/components/ui/semantic";
import { NEWSLETTER_LIST_KEY } from "@/lib/notify/lists";
import styles from "@/components/NewsletterSignup.module.css";

type NewsletterSignupProps = {
  /** @deprecated rust — prefer notify (paper ticket band) or footer */
  variant?: "default" | "rust" | "notify" | "footer";
};

type SubmitState = "idle" | "submitting" | "ready" | "error";

/**
 * General newsletter signup. Joins the `newsletter` list via /api/notify and
 * triggers the same branded confirmation email + unsubscribe link as the
 * course-card popups.
 *
 * Sends `marketingConsent: true` because subscribing to a marketing newsletter
 * IS the consent — the act of submitting this form is the affirmative opt-in.
 * That's different from the course popups, where the launch notice is the
 * primary purpose and marketing is a separate, unticked box.
 */
export function NewsletterSignup({ variant = "default" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const isNotify = variant === "notify";
  const isFooter = variant === "footer";
  const isRust = variant === "rust";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setErrorMessage("Enter a valid email.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          list: NEWSLETTER_LIST_KEY,
          marketingConsent: true,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Couldn’t save your email. Try again.");
        return;
      }

      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage("Couldn’t save your email. Try again.");
    }
  }

  if (isFooter) {
    const inputId = "footer-newsletter-email";
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full min-w-0 flex-col items-stretch gap-1"
        noValidate
      >
        <div className="flex w-full min-w-0 items-center gap-1.5">
          <label className="sr-only" htmlFor={inputId}>
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            placeholder="Email"
            autoComplete="email"
            inputMode="email"
            disabled={status === "submitting"}
            className={`h-7 min-h-7 min-w-0 flex-1 rounded-lg border border-cream/20 bg-cream/[0.08] px-2 font-body text-[12px] leading-none text-cream placeholder:text-cream/40 transition-[border-color,background-color] duration-200 ease-[var(--ease-out-quint)] focus:outline-none focus:border-cream/35 focus:bg-cream/[0.12] focus-visible:outline-none focus-visible:ring-0 disabled:opacity-60 motion-reduce:transition-none ${
              status === "error"
                ? `border-orange/50 ${styles.inputError}`
                : ""
            }`}
            aria-invalid={status === "error"}
            aria-describedby={
              status === "error"
                ? `${inputId}-error`
                : status === "ready"
                  ? `${inputId}-ready`
                  : undefined
            }
            required
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            aria-busy={status === "submitting"}
            aria-label={status === "submitting" ? "Joining" : "Join"}
            className={`${stampCtaPrimaryCompact} !h-7 !min-h-7 !gap-1 !rounded-lg !px-2.5 shrink-0 justify-center !font-body !text-[11px] !font-semibold !normal-case !tracking-[-0.01em] disabled:opacity-60`}
          >
            {status === "submitting" ? (
              <Spinner
                variant="ellipsis"
                size={12}
                className="text-current"
                aria-hidden
              />
            ) : (
              <>
                Join
                <CtaArrow />
              </>
            )}
          </button>
        </div>
        {status === "error" && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-[11px] leading-snug text-orange"
          >
            {errorMessage}
          </p>
        )}
        {status === "ready" && (
          <p
            id={`${inputId}-ready`}
            role="status"
            className={`${styles.success} font-body text-[11px] font-bold text-[#9BC47A]`}
          >
            Check your inbox.
          </p>
        )}
      </form>
    );
  }

  if (isNotify) {
    return (
      <form
        onSubmit={handleSubmit}
        className="notify-form flex w-full flex-col items-stretch gap-2"
        noValidate
      >
        <div className="flex w-full items-center gap-2">
          <label className="sr-only" htmlFor="notify-email">
            Email address
          </label>
          <input
            id="notify-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
            disabled={status === "submitting"}
            className={`notify-input h-8 min-h-8 min-w-0 flex-1 rounded-xl border border-ink/15 bg-cream/80 px-3 font-body text-sm leading-none text-ink placeholder:text-ink/45 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06)] transition-[border-color] duration-200 ease-[var(--ease-out-quint)] focus:outline-none focus:border-ink/15 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-60 motion-reduce:transition-none ${
              status === "error"
                ? `border-ink/25 ${styles.inputError}`
                : ""
            }`}
            aria-invalid={status === "error"}
            aria-describedby={
              status === "error"
                ? "notify-email-error"
                : status === "ready"
                  ? "notify-email-ready"
                  : undefined
            }
            required
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            aria-busy={status === "submitting"}
            aria-label={status === "submitting" ? "Saving" : "Notify me"}
            className={`${stampCtaPrimaryCompact} notify-submit !h-8 shrink-0 justify-center !font-body !text-[12px] !font-semibold !normal-case !tracking-[-0.01em] disabled:opacity-60`}
          >
            {status === "submitting" ? (
              <Spinner
                variant="ellipsis"
                size={14}
                className="text-current"
                aria-hidden
              />
            ) : (
              <>
                Notify me
                <CtaArrow />
              </>
            )}
          </button>
        </div>
        {status === "error" && (
          <p
            id="notify-email-error"
            role="alert"
            className={fieldErrorHint}
          >
            {errorMessage}
          </p>
        )}
        {status === "ready" && (
          <p
            id="notify-email-ready"
            role="status"
            className={`${styles.success} font-body text-[11px] font-bold text-olive`}
          >
            Check your inbox — we&apos;ve sent a confirmation.
          </p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={isRust ? "signup flex flex-col gap-2.5 sm:flex-row" : "max-w-md"}
    >
      <div className={isRust ? "contents" : "flex flex-col gap-3 sm:flex-row"}>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder={isRust ? "you@email.com" : "you@company.com"}
          disabled={status === "submitting"}
          className={
            isRust
              ? "input-field min-w-[260px] flex-1 disabled:opacity-60"
              : "input-field flex-1 disabled:opacity-60"
          }
          aria-label="Email address"
          required
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          aria-busy={status === "submitting"}
          aria-label={
            status === "submitting"
              ? "Saving"
              : isRust
                ? "Notify me"
                : "Join the list"
          }
          className={
            isRust
              ? "group btn inline-flex items-center gap-2 whitespace-nowrap bg-ink text-cream disabled:opacity-60"
              : "group btn btn-primary inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
          }
        >
          {status === "submitting" ? (
            <Spinner variant="bars" size={16} className="text-current" aria-hidden />
          ) : (
            <>
              {isRust ? "Notify me" : "Join the list"}
              <CtaArrow />
            </>
          )}
        </button>
      </div>
      {status === "ready" && (
        <p
          className={`mt-3 font-body text-xs font-bold ${isRust ? "text-cream" : "text-olive"}`}
        >
          Check your inbox — we&apos;ve sent a confirmation.
        </p>
      )}
      {status === "error" && (
        <p
          className={`mt-3 ${fieldErrorHint} ${isRust ? "!text-cream/70" : ""}`}
        >
          {errorMessage}
        </p>
      )}
      {status === "idle" && (
        <p className={`mt-3 text-sm ${isRust ? "text-cream/80" : "text-ink/75"}`}>
          Learn in Curve will email you PM and AI study updates and course
          news. Unsubscribe any time.{" "}
          <Link
            href="/privacy"
            className={`underline underline-offset-2 ${
              isRust
                ? "decoration-cream/40 hover:text-cream"
                : "decoration-ink/25 hover:text-ink"
            }`}
          >
            Privacy notice
          </Link>
          .
        </p>
      )}
    </form>
  );
}
