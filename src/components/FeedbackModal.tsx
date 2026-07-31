"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import {
  fieldErrorHint,
  formActionPrimary,
  quietFormSurface,
} from "@/components/ui/semantic";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  /** Which surface the button was clicked from, e.g. "Footer", "Sly tutor panel". Goes in the email subject/body, not shown to the user. */
  source: string;
};

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeedbackModal({ open, onClose, source }: FeedbackModalProps) {
  const headingId = useId();
  const messageId = useId();
  const emailId = useId();

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null | undefined>(
    undefined,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    setMessage("");
    setEmail("");
    setStatus("idle");
    setErrorMsg(null);
    setUserEmail(undefined);

    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!cancelled) setUserEmail(data.user?.email ?? null);
      })
      .catch(() => {
        if (!cancelled) setUserEmail(null);
      });

    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && status !== "submitting") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, status]);

  if (!open) return null;

  const checkingAuth = userEmail === undefined;
  const isSignedIn = typeof userEmail === "string";
  const submitting = status === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("error");
      setErrorMsg("Say a quick word about what you noticed.");
      return;
    }
    if (!isSignedIn) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
        setStatus("error");
        setErrorMsg("Enter a valid email so we can reply.");
        return;
      }
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          email: isSignedIn ? undefined : email.trim(),
          source,
          pageUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(
          typeof data.error === "string"
            ? data.error
            : "Couldn't send - please try again.",
        );
        return;
      }

      setStatus("success");
      window.setTimeout(onClose, 1400);
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't send - check your connection and try again.");
    }
  }

  const fieldClass =
    "w-full rounded-[0.65rem] border border-black/[0.08] bg-[rgb(248_247_245)] px-3 py-2.5 font-body text-[13.5px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-out-quint)] placeholder:text-ink/35 hover:border-black/[0.14] focus:border-[rgb(var(--orange-rgb)/0.5)] focus:bg-white focus:shadow-[0_0_0_3px_rgb(var(--orange-rgb)/0.12)]";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`${quietFormSurface} relative w-full max-w-[22rem] p-4 sm:p-5`}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-lg text-ink/40 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange disabled:opacity-50"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
            <path
              d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {status === "success" ? (
          <p
            className="py-8 text-center font-body text-[14px] font-semibold text-olive"
            role="status"
          >
            Sent - thanks for the note.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3 pr-1" noValidate>
            <div className="flex items-end gap-2.5 pr-7">
              <Image
                src="/brand/feedback/write-note.png"
                alt=""
                width={44}
                height={44}
                className="h-10 w-auto shrink-0 select-none object-contain object-bottom"
                unoptimized
                aria-hidden
              />
              <h2
                id={headingId}
                className="pb-px font-display text-[1.05rem] font-bold leading-none tracking-[-0.03em] text-ink"
              >
                Send feedback
              </h2>
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor={messageId}
                className="font-body text-[12px] font-semibold text-ink/65"
              >
                Message
              </label>
              <textarea
                ref={textareaRef}
                id={messageId}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="What did you notice?"
                className={`${fieldClass} min-h-[6.5rem] resize-none leading-relaxed`}
              />
            </div>

            {checkingAuth ? null : isSignedIn ? (
              <p className="font-body text-[12px] text-ink/50">
                Sending as {userEmail}
              </p>
            ) : (
              <div className="grid gap-1.5">
                <label
                  htmlFor={emailId}
                  className="font-body text-[12px] font-semibold text-ink/65"
                >
                  Your email
                </label>
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>
            )}

            {errorMsg ? (
              <p className={fieldErrorHint} role="alert">
                {errorMsg}
              </p>
            ) : null}

            <div className="flex justify-end pt-0.5">
              <button
                type="submit"
                disabled={submitting || checkingAuth}
                aria-busy={submitting}
                aria-label={submitting ? "Sending message" : "Send message"}
                className={`${formActionPrimary} !min-h-9 !px-3.5 !py-1.5 !text-[13px] !font-semibold disabled:cursor-wait disabled:opacity-80`}
              >
                {submitting ? (
                  <Spinner
                    variant="ellipsis"
                    size={14}
                    className="text-current"
                    aria-hidden
                  />
                ) : (
                  "Send message"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
