"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AvatarImage } from "@/components/AvatarImage";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import {
  JoinWaitlistButton,
} from "@/components/pmq/JoinWaitlistButton";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { slyChromeStyles } from "@/components/SlyChrome";
import showcase from "@/components/SlyShowcase.module.css";
import { stampCtaPrimary, stampCtaPrimaryCompact, CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import { GUEST_TIER_MESSAGE_CAP } from "@/lib/tutor/constants";
import { useGuestSlyChat } from "@/lib/tutor/use-guest-sly-chat";
import { trackTutorOpened } from "@/lib/analytics/events";

/** Chat row face size — large enough to read ears / animal detail. */
const FACE_PX = 26;
const SUGGESTIONS = [
  "What is the APM PMQ exam actually testing?",
  "Explain stakeholder management in plain English",
  "Give me one exam-technique tip for scenario questions",
];

/**
 * Live landing-page Sly window — modern chat shell (Cursor/Claude feel).
 *
 * Keeps guest-chat logic, chips settle gate, and signed-in / trial-locked
 * states. Visual chrome only: no Mac traffic lights, no wallpaper.
 */
export function SlyTutorWindow({ isSignedIn }: { isSignedIn: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(false);
  /** Wait for layout/scroll-reveal to settle before chips accept taps. */
  const [chipsReady, setChipsReady] = useState(false);
  const openedTracked = useRef(false);

  const chat = useGuestSlyChat({ active: inView && !isSignedIn });
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
  } = chat;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.28 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || isSignedIn || openedTracked.current) return;
    openedTracked.current = true;
    trackTutorOpened({ surface: "guest" });
  }, [inView, isSignedIn]);

  useEffect(() => {
    if (!inView || isSignedIn) {
      setChipsReady(false);
      return;
    }
    const id = window.setTimeout(() => setChipsReady(true), 420);
    return () => window.clearTimeout(id);
  }, [inView, isSignedIn]);

  const composerLocked = locked || unavailable;
  const freeQuestionLabel = (n: number) =>
    `${n} free question${n === 1 ? "" : "s"}`;
  const statusLabel = isSignedIn
    ? null
    : usageLoaded && !unavailable
      ? locked
        ? "Trial used"
        : freeQuestionLabel(messagesRemaining)
      : freeQuestionLabel(GUEST_TIER_MESSAGE_CAP);

  return (
    <section
      ref={rootRef}
      aria-label="Try Sly, the AI tutor"
      className={`${showcase.console} ${showcase.chatShell} relative mx-auto flex h-[420px] w-full max-w-[680px] flex-col overflow-hidden sm:h-[460px] lg:mx-0 lg:max-w-none`}
    >
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Minimal chat header */}
      <header className="relative z-10 flex shrink-0 items-center gap-2.5 px-4 py-3 sm:px-5">
        <div className="flex shrink-0 items-center gap-[7px]" aria-hidden>
          <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28C840] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
        </div>
        <div className="min-w-0 flex-1" aria-hidden />
        {statusLabel ? (
          <p
            className="shrink-0 rounded-full bg-ink/[0.05] px-2.5 py-1 font-body text-[11px] font-semibold tabular-nums tracking-tight text-ink/55"
            aria-live="polite"
          >
            {statusLabel}
          </p>
        ) : null}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col bg-paper">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`${slyChromeStyles.scroll} ${showcase.chatScroll} relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-5`}
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-5 px-1 py-4 text-center">
              {locked ? (
                <p className="m-0 max-w-[22rem] text-[13px] leading-relaxed text-ink/65 text-pretty">
                  Join the waitlist below for full access when it launches.
                </p>
              ) : (
                <>
                  <div className="max-w-[22rem]">
                    {isSignedIn || unavailable ? (
                      <p className="m-0 font-body text-[15px] font-semibold tracking-[-0.02em] text-ink">
                        {isSignedIn
                          ? "Launching soon!"
                          : "Sly’s free trial is taking a short break"}
                      </p>
                    ) : null}
                    <p
                      className={`m-0 text-[13px] leading-relaxed text-ink/65 text-pretty ${
                        isSignedIn || unavailable ? "mt-1.5" : ""
                      }`}
                    >
                      {isSignedIn
                        ? "Open your course to keep studying."
                        : unavailable
                          ? "Create a free account to keep learning in the meantime."
                          : "Type your question or choose a prompt"}
                    </p>
                  </div>
                  {!isSignedIn && !composerLocked ? (
                    <div
                      className={`flex w-full max-w-[22rem] flex-col gap-2 ${
                        chipsReady ? "" : "pointer-events-none"
                      }`}
                      aria-hidden={!chipsReady}
                    >
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void send(suggestion)}
                          disabled={sending || !chipsReady}
                          className={`${showcase.suggestChip} min-h-11 w-full text-left`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <ul className="mx-auto flex w-full max-w-[36rem] list-none flex-col gap-4">
              {messages.map((msg, index) => {
                const pendingAssistant =
                  msg.role === "assistant" &&
                  msg.id.startsWith("pending-assistant");
                const thinking = pendingAssistant && !msg.content;
                const prev = messages[index - 1];
                const showFace = !prev || prev.role !== msg.role;

                return (
                  <li
                    key={msg.id}
                    className={`${slyChromeStyles.message} flex w-full min-w-0 flex-col gap-1.5 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {showFace && msg.role === "assistant" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <SlyFace size={FACE_PX} />
                        <span className="text-[12px] font-semibold tracking-tight text-ink/55">
                          Sly
                        </span>
                      </span>
                    ) : null}
                    {showFace && msg.role === "user" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold tracking-tight text-ink/55">
                          You
                        </span>
                        <UserFace size={FACE_PX} />
                      </span>
                    ) : null}
                    {msg.role === "user" ? (
                      <div className={`${showcase.userMsg} max-w-[88%] break-words text-pretty`}>
                        <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="min-h-[1.5rem] w-full min-w-0 max-w-[92%] text-[14px] leading-relaxed text-ink">
                        {thinking ? (
                          <span
                            className="inline-flex items-center gap-2 py-0.5 text-[13px] font-medium text-ink/45"
                            aria-label="Sly is thinking"
                          >
                            <Spinner
                              variant="ellipsis"
                              size={18}
                              className="text-ink/40"
                              aria-hidden
                            />
                            Thinking…
                          </span>
                        ) : (
                          <MarkdownBlock
                            content={msg.content}
                            className={slyChromeStyles.markdown}
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="relative z-10 shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
          {isSignedIn ? (
            <div className={`${showcase.composerCard} flex items-center justify-between gap-3 p-3.5`}>
              <p className="m-0 shrink-0 text-[14px] font-medium leading-snug text-ink">
                You&apos;re signed in
              </p>
              <Link
                href={`/courses/${PMQ_SLUG}`}
                className={`${stampCtaPrimaryCompact} shrink-0`}
              >
                Open your course
                <CtaArrow />
              </Link>
            </div>
          ) : composerLocked ? (
            <div className={`${showcase.composerCard} p-4`}>
              {unavailable ? (
                <>
                  <p className="m-0 text-[14px] font-medium leading-snug text-ink text-pretty">
                    Sly’s free trial is taking a short break. Create a free account
                    to keep learning in the meantime.
                  </p>
                  <Link
                    href="/auth/sign-up"
                    className={`${stampCtaPrimary} mt-3 w-full !justify-center !normal-case`}
                  >
                    Create Free Account
                  </Link>
                  <p className="m-0 mt-2.5 text-center text-[12px] text-ink/65">
                    Already have an account?{" "}
                    <Link
                      href="/auth/sign-in"
                      className="font-medium text-orange hover:text-orange-dark"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <JoinWaitlistButton
                  className={`${stampCtaPrimary} w-full !justify-center !normal-case`}
                />
              )}
            </div>
          ) : (
            <>
              {error ? (
                <div
                  className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-ink/10 bg-paper px-3 py-2 font-body text-[12px] font-medium text-ink/65"
                  role="alert"
                >
                  <p className="m-0 min-w-0 flex-1 leading-snug">{error}</p>
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

              <div className={showcase.composerCard}>
                <div className="flex items-end gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5">
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
                    placeholder="Write a message..."
                    disabled={sending}
                    aria-label="Write a message"
                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2 font-body text-[14px] leading-snug tracking-[-0.01em] text-ink placeholder:text-ink/35 focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={sending || !input.trim()}
                    aria-label={sending ? "Sending" : "Send message"}
                    aria-busy={sending}
                    className={`${showcase.sendBtn} mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color,opacity] duration-150 ease-[var(--ease-out-quint)] enabled:active:scale-[0.96] disabled:cursor-not-allowed`}
                  >
                    {sending ? (
                      <Spinner
                        variant="ellipsis"
                        size={14}
                        className="text-current"
                        aria-hidden
                      />
                    ) : (
                      <SendIcon />
                    )}
                  </button>
                </div>
              </div>

              <p className="m-0 mt-2 text-center text-[11px] leading-snug text-ink/50 text-pretty">
                Sly is AI and can make mistakes.
                <span className="mx-1.5 text-ink/25" aria-hidden>
                  ·
                </span>
                <SendFeedbackButton
                  className="inline text-[11px] font-medium text-ink/55 underline-offset-2 transition-colors hover:text-teal-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  source="Sly landing console"
                />
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SlyFace({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-sand ring-1 ring-ink/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/brand/sly/sly-tutor-portrait.png"
        alt=""
        width={size}
        height={size}
        /* Gentler zoom than the old 1.35 — keeps ears in frame on desktop. */
        className="h-full w-full scale-[1.18] object-cover object-[center_18%] sm:scale-[1.14] sm:object-[center_16%]"
      />
    </span>
  );
}

function UserFace({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-ink/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Same crop as dashboard profile (`AvatarImage`). */}
      <AvatarImage avatarId="dog" size={size} />
    </span>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
