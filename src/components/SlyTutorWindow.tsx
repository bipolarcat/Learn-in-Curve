"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { slyChromeStyles } from "@/components/SlyChrome";
import showcase from "@/components/SlyShowcase.module.css";
import { stampCtaPrimary, stampCtaPrimaryCompact, CtaArrow } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import { GUEST_TIER_MESSAGE_CAP } from "@/lib/tutor/constants";
import { useGuestSlyChat } from "@/lib/tutor/use-guest-sly-chat";

const WALLPAPER_SRC = "/brand/inspo/AItutor-window-wallpaper.webp";

const SUGGESTIONS = [
  "What is the APM PMQ exam actually testing?",
  "Explain stakeholder management in plain English",
  "Give me one exam-technique tip for scenario questions",
];

/**
 * Live landing-page Sly window.
 *
 * Opens directly to suggested questions and a real composer. The old scripted
 * typing loop was decorative and made visitors wait to discover the actual
 * interaction, so it no longer mounts.
 *
 * Signed-in visitors never get the composer: `/api/tutor/guest-chat` rejects an
 * authenticated session with a 400. They get a direct link into course Sly.
 */
export function SlyTutorWindow({ isSignedIn }: { isSignedIn: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(false);

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

  const composerLocked = locked || unavailable;

  return (
    <section
      ref={rootRef}
      aria-label="Try Sly, the AI tutor"
      className={`${showcase.console} relative mx-auto flex h-[420px] w-full max-w-[680px] flex-col overflow-hidden rounded-[14px] border border-ink/12 bg-paper text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06),0_18px_40px_-12px_rgb(var(--ink-rgb)_/_0.28),0_8px_16px_-8px_rgb(var(--ink-rgb)_/_0.14)] sm:h-[460px] lg:mx-0 lg:max-w-none`}
    >
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Mac title bar */}
      <div className="relative flex shrink-0 items-center gap-2 border-b border-ink/8 bg-[#EDE6D6] px-3.5 py-2.5">
        <div className="flex shrink-0 items-center gap-[7px]" aria-hidden>
          <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28C840] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
        </div>
        <div className="mx-auto flex min-w-0 items-center gap-2">
          <span className="relative inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-paper">
            <Image
              src="/brand/sly/sly-tutor-portrait.png"
              alt=""
              width={20}
              height={20}
              className="h-full w-full scale-[1.5] object-cover object-[center_24%]"
            />
          </span>
          <p className="truncate text-[12.5px] font-semibold tracking-[-0.01em] text-ink/75">
            Sly · AI tutor
          </p>
        </div>
        {isSignedIn ? (
          <span className="w-[7.5rem] shrink-0" aria-hidden />
        ) : (
          <p
            className="shrink-0 rounded-md bg-ink/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink/60"
            aria-live="polite"
          >
            {usageLoaded && !unavailable
              ? locked
                ? "Trial used"
                : `${messagesRemaining} question${messagesRemaining === 1 ? "" : "s"} left`
              : `${GUEST_TIER_MESSAGE_CAP} free questions`}
          </p>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <Image
            src={WALLPAPER_SRC}
            alt=""
            fill
            sizes="720px"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-paper/15 via-transparent to-cream/30" />
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`${slyChromeStyles.scroll} relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4`}
        >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-4 px-1 py-6 text-center">
                <div className="rounded-2xl bg-cream/92 px-4 py-3 shadow-sm ring-1 ring-ink/10">
                  <p className="m-0 max-w-[20rem] text-[14px] font-medium leading-relaxed text-ink text-pretty">
                    {isSignedIn
                      ? "Launching soon!"
                      : unavailable
                        ? "Sly’s free trial is taking a short break. Create a free account to keep learning in the meantime."
                        : locked
                          ? "This network has already used the free Sly trial. Sign up to keep chatting with your own free messages."
                          : "Choose a question below or type your own. Answers are live, and the Beta is limited to a few questions per visitor."}
                  </p>
                </div>
                {!isSignedIn && !composerLocked ? (
                  <div className="flex w-full max-w-[22rem] flex-col gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void send(suggestion)}
                        disabled={sending}
                        className="rounded-xl border border-ink/15 bg-cream/95 px-3.5 py-2.5 text-left text-[13px] leading-snug text-ink shadow-sm transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] hover:border-teal/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="flex list-none flex-col gap-2.5">
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
                      className={`${slyChromeStyles.message} flex w-full min-w-0 flex-col gap-1 ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {showFace ? (
                        msg.role === "assistant" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 py-0.5 pl-0.5 pr-2.5 ring-1 ring-ink/10">
                            <SlyFace size={22} />
                            <span className="text-[12px] font-semibold text-ink">
                              Sly
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 px-2.5 py-0.5 ring-1 ring-ink/10">
                            <span className="text-[12px] font-semibold text-ink">
                              You
                            </span>
                          </span>
                        )
                      ) : null}
                      <div
                        className={`min-w-0 max-w-[85%] overflow-hidden rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                          msg.role === "user"
                            ? `${slyChromeStyles.userBubble} break-words text-paper`
                            : `${slyChromeStyles.assistantBubble} min-h-[2.75rem] text-ink`
                        }`}
                      >
                        {thinking ? (
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

        {/* Real composer from the first paint — no scripted typing handover. */}
        <div
          className={`${slyChromeStyles.composer} relative z-10 shrink-0 px-3 pb-3 pt-2.5 sm:px-4`}
        >
          {isSignedIn ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-paper/85 p-3.5 shadow-sm backdrop-blur-sm">
              <p className="m-0 text-[14px] font-medium leading-snug text-ink shrink-0">
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
            <div className="rounded-xl border border-ink/10 bg-paper/85 p-4 shadow-sm backdrop-blur-sm">
              <p className="m-0 text-[14px] font-medium leading-snug text-ink text-pretty">
                {unavailable
                  ? "Sly’s free trial is taking a short break. Create a free account to keep learning in the meantime."
                  : "That’s the Beta taster. Create a free account to carry on with the course."}
              </p>
              <Link
                href="/auth/sign-up"
                className={`${stampCtaPrimary} mt-3 w-full !justify-center`}
              >
                Create free account
              </Link>
              <p className="m-0 mt-2.5 text-center text-[12px] text-ink/50">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-orange hover:text-orange-dark"
                >
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error ? (
                <div
                  className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-ink/10 bg-paper/90 px-3 py-1.5 font-body text-[12px] font-medium text-ink/55"
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

              <div
                className={`${slyChromeStyles.composerWell} relative flex items-end gap-2 rounded-xl border border-ink/12 bg-paper/60 p-1 transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-out-quint)] focus-within:border-teal/50 focus-within:bg-paper/80 focus-within:shadow-[0_0_0_3px_rgb(var(--teal-rgb)_/_0.14)]`}
              >
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

              <p className="m-0 mt-2 text-center text-[11px] leading-snug text-ink/45 text-pretty">
                Sly is AI and can make mistakes.
                <span className="mx-1.5 text-ink/25" aria-hidden>
                  ·
                </span>
                <SendFeedbackButton
                  className="inline text-[11px] font-medium text-ink/50 underline-offset-2 transition-colors hover:text-teal-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
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
      className="relative inline-flex shrink-0 overflow-hidden rounded-full border border-ink/15 bg-sand"
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
