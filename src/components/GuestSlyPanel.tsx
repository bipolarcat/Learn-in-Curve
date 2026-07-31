"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { stampCtaPrimary } from "@/components/stamp-chip";
import {
  SlyPanelHeader,
  SlyPanelShell,
  slyChromeStyles,
} from "@/components/SlyChrome";
import { iconAction } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import {
  JoinWaitlistButton,
  joinWaitlistButtonClass,
} from "@/components/pmq/JoinWaitlistButton";
import { GUEST_TIER_MESSAGE_CAP } from "@/lib/tutor/constants";
import { useGuestSlyChat } from "@/lib/tutor/use-guest-sly-chat";

type GuestSlyPanelProps = {
  open: boolean;
  onClose: () => void;
};

const WALLPAPER_SRC = "/brand/inspo/AItutor-window-wallpaper.webp";

const SUGGESTIONS = [
  "What is the APM PMQ exam actually testing?",
  "Explain stakeholder management in plain English",
  "Give me one exam-technique tip for scenario questions",
];

export function GuestSlyPanel({ open, onClose }: GuestSlyPanelProps) {
  const {
    messages,
    input,
    setInput,
    sending,
    error,
    failedSend,
    messagesRemaining,
    locked,
    unavailable,
    usageLoaded,
    send,
    handleScroll,
    scrollContainerRef,
    messagesEndRef,
    textareaRef,
    liveRegionRef,
  } = useGuestSlyChat({ active: open });

  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const t = window.setTimeout(() => textareaRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(t);
    };
  }, [open, textareaRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const used = GUEST_TIER_MESSAGE_CAP - messagesRemaining;

  return (
    <>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close Sly trial"
        className="fixed inset-0 z-40 bg-ink/40"
        onClick={onClose}
      />
      <SlyPanelShell
        ref={panelRef}
        label="Try Sly, your AI tutor"
      >
        <SlyPanelHeader>
          <SlyFace size={28} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">
              Sly
            </p>
            <p className="truncate text-[10px] font-medium leading-tight text-paper/70">
              Free trial · {GUEST_TIER_MESSAGE_CAP} messages
            </p>
          </div>
          {usageLoaded && !locked && !unavailable ? (
            <p className="shrink-0 rounded-md bg-paper/15 px-2 py-1 text-[10px] font-semibold tabular-nums text-paper/90">
              {messagesRemaining} left
            </p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className={`${iconAction} !min-h-8 !min-w-8 shrink-0 text-paper/85 hover:bg-paper/10 hover:text-paper focus-visible:ring-paper`}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </SlyPanelHeader>

        <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            <Image
              src={WALLPAPER_SRC}
              alt=""
              fill
              sizes="440px"
              priority
              className="object-cover object-[center_40%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-paper/15 via-transparent to-cream/30" />
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`${slyChromeStyles.scroll} relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4`}
          >
            {messages.length === 0 && unavailable ? (
              <div className="flex h-full min-h-[10rem] flex-col items-center justify-center px-1 py-8 text-center">
                <div className="rounded-2xl bg-cream/92 px-4 py-3 shadow-sm ring-1 ring-ink/10">
                  <p className="max-w-[18rem] text-[14px] font-medium leading-relaxed text-ink text-pretty">
                    Sly&apos;s free trial is taking a short break. Check back
                    soon, or create a free account to keep learning.
                  </p>
                </div>
              </div>
            ) : messages.length === 0 && !locked ? (
              <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-4 px-1 py-8 text-center">
                <div className="rounded-2xl bg-cream/92 px-4 py-3 shadow-sm ring-1 ring-ink/10">
                  <p className="max-w-[18rem] text-[14px] font-medium leading-relaxed text-ink text-pretty">
                    Ask Sly anything about the APM PMQ — live answers,{" "}
                    {GUEST_TIER_MESSAGE_CAP} free messages from this network.
                  </p>
                </div>
                <div className="flex w-full max-w-[22rem] flex-col gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      disabled={sending || locked}
                      className="rounded-xl border border-ink/15 bg-cream/95 px-3.5 py-2.5 text-left text-[13px] leading-snug text-ink shadow-sm transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] hover:border-teal/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.length === 0 && locked ? (
              <div className="flex h-full min-h-[10rem] flex-col items-center justify-center px-1 py-8 text-center">
                <div className="rounded-2xl bg-cream/92 px-4 py-3 shadow-sm ring-1 ring-ink/10">
                  <p className="max-w-[18rem] text-[14px] font-medium leading-relaxed text-ink text-pretty">
                    This network has already used the free Sly trial. Sly
                    arrives with the AI Pro Bundle — join the waitlist below.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="flex list-none flex-col gap-2.5">
                {messages.map((msg, index) => {
                  const isPendingAssistant =
                    msg.role === "assistant" &&
                    msg.id.startsWith("pending-assistant");
                  const isThinking = isPendingAssistant && !msg.content;
                  const prev = messages[index - 1];
                  const showAssistantFace =
                    msg.role === "assistant" &&
                    (!prev || prev.role !== "assistant");
                  const showUserFace =
                    msg.role === "user" && (!prev || prev.role !== "user");

                  return (
                    <li
                      key={msg.id}
                      className={`${slyChromeStyles.message} flex w-full min-w-0 flex-col gap-1 ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {msg.role === "assistant" && showAssistantFace ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 py-0.5 pl-0.5 pr-2.5 ring-1 ring-ink/10">
                          <SlyFace size={22} bordered />
                          <span className="text-[12px] font-semibold text-ink">
                            Sly
                          </span>
                        </span>
                      ) : null}
                      {msg.role === "user" && showUserFace ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 px-2.5 py-0.5 ring-1 ring-ink/10">
                          <span className="text-[12px] font-semibold text-ink">
                            You
                          </span>
                        </span>
                      ) : null}
                      <div
                        className={`min-w-0 max-w-[85%] overflow-hidden rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                          msg.role === "user"
                            ? `${slyChromeStyles.userBubble} break-words text-paper`
                            : `${slyChromeStyles.assistantBubble} text-ink`
                        }`}
                      >
                        {isThinking ? (
                          <span
                            className="inline-flex items-center py-0.5"
                            aria-label="Sly is thinking"
                          >
                            <Spinner
                              variant="ellipsis"
                              size={22}
                              className="text-ink/45"
                              aria-hidden
                            />
                          </span>
                        ) : msg.role === "assistant" ? (
                          <MarkdownBlock
                            content={msg.content}
                            className={slyChromeStyles.markdown}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-pretty">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div ref={messagesEndRef} />
          </div>

          {unavailable ? (
            <div className={`${slyChromeStyles.composer} relative z-10 shrink-0 p-3 sm:p-4`}>
              <div className="rounded-xl border border-ink/10 bg-paper/85 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-[14px] font-medium leading-snug text-ink text-pretty">
                  Sly&apos;s free trial is taking a short break. Create a
                  free account to keep learning in the meantime.
                </p>
                <Link
                  href="/auth/sign-up"
                  className={`${stampCtaPrimary} mt-3 w-full !justify-center`}
                >
                  Create free account
                </Link>
                <p className="mt-2.5 text-center text-[12px] text-ink/50">
                  Already have an account?{" "}
                  <Link
                    href="/auth/sign-in"
                    className="font-medium text-orange hover:text-orange-dark"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          ) : locked ? (
            <div className={`${slyChromeStyles.composer} relative z-10 shrink-0 p-3 sm:p-4`}>
              <div className="rounded-xl border border-ink/10 bg-paper/85 p-4 shadow-sm backdrop-blur-sm">
                <p className="text-[14px] font-medium leading-snug text-ink text-pretty">
                  You&apos;ve used your {GUEST_TIER_MESSAGE_CAP} free trial
                  messages
                  {used > 0 ? ` (${used} sent)` : ""}.
                </p>
                {/*
                  Waitlist, not signup. Sly belongs to the AI Pro Bundle, which
                  is `status: "waitlist"` in plans.ts and not on sale — so there
                  is nothing to send this user to buy, and "create a free
                  account to keep talking with Sly" was promising exactly the
                  thing the tier ladder withholds. Same control as the AI Pro
                  pricing card, via JoinWaitlistButton.
                */}
                <p className="mt-2.5 text-center text-[12px] font-medium text-ink/60">
                  AI Pro Bundle launching soon
                </p>
                <JoinWaitlistButton
                  className={`${joinWaitlistButtonClass} mt-2`}
                />
              </div>
            </div>
          ) : (
            <div className={`${slyChromeStyles.composer} relative z-10 shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-4`}>
              {error ? (
                <div
                  className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-ink/10 bg-paper/90 px-3 py-1.5 font-body text-[12px] font-medium text-ink/55"
                  role="alert"
                >
                  <p className="min-w-0 flex-1 leading-snug">{error}</p>
                  {failedSend ? (
                    <button
                      type="button"
                      onClick={() => void send(failedSend)}
                      className="shrink-0 font-semibold text-teal-deep underline-offset-2 hover:underline"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              ) : null}

              {usageLoaded ? (
                <p className="mb-1.5 text-center text-[11px] text-ink/45">
                  {messagesRemaining} of {GUEST_TIER_MESSAGE_CAP} free messages
                  left
                </p>
              ) : null}

              <div className={`${slyChromeStyles.composerWell} flex items-end gap-2 rounded-xl border border-ink/10 bg-paper/55 p-1 transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-out-quint)] focus-within:border-teal/50 focus-within:bg-paper/75 focus-within:shadow-[0_0_0_3px_rgb(var(--teal-rgb)_/_0.14)]`}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Sly…"
                  disabled={sending}
                  aria-label="Message to Sly"
                  className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-snug text-ink placeholder:text-ink/45 focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  aria-label={sending ? "Sending" : "Send message"}
                  aria-busy={sending}
                  className={`${slyChromeStyles.sendButton} inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange text-paper transition-[transform,filter,opacity] duration-150 ease-[var(--ease-out-quint)] enabled:hover:brightness-95 enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {sending ? (
                    <Spinner
                      variant="ellipsis"
                      size={18}
                      className="text-paper"
                      aria-hidden
                    />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] leading-snug text-ink/45 text-pretty">
                Sly is AI and can make mistakes.
                <span className="mx-1.5 text-ink/25" aria-hidden>
                  ·
                </span>
                <SendFeedbackButton
                  className="inline text-[11px] font-medium text-ink/50 underline-offset-2 transition-colors hover:text-teal-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  source="Sly guest trial"
                />
              </p>
            </div>
          )}
        </div>
      </SlyPanelShell>
    </>
  );
}

function SlyFace({
  size,
  bordered = false,
}: {
  size: number;
  bordered?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-sand ${
        bordered ? "border border-ink/20" : "border border-paper/50"
      }`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/mascot/fox-face.svg"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
