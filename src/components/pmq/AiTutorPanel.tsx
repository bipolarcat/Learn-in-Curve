"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import { AI_TUTOR_LAUNCHED } from "@/lib/pmq/constants";
import { LockedFeature } from "@/components/LockedFeature";
import { SendFeedbackButton } from "@/components/SendFeedbackButton";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { SlyUnlockInvite } from "@/components/pmq/SlyUnlockInvite";
import { SlyTopUpDialog } from "@/components/pmq/SlyTopUpDialog";
import { SlyUsageMeter } from "@/components/pmq/SlyUsageMeter";
import {
  SlyPanelHeader,
  SlyPanelShell,
  slyChromeStyles,
} from "@/components/SlyChrome";
import { iconAction } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import type { FairUsageSummary } from "@/lib/tutor/fair-usage";
import {
  DEFAULT_AVATAR_ID,
  type AvatarId,
} from "@/lib/avatars";
import { AvatarImage } from "@/components/AvatarImage";

type AiTutorPanelProps = {
  isUnlocked: boolean;
  priceCents: number;
  /** Topic context for the tutor; overview / dashboard can pass 1. */
  loNumber?: number;
  courseId: string;
  /** Stripe return path after checkout. */
  returnPath?: string;
  /** True when all 24 LOs have quiz_completed_at — shows locked summary for free users (LIC-52). */
  courseComplete?: boolean;
  /** First name for user face pill; defaults to "You". */
  userFirstName?: string;
  /** Animal avatar for user face pill. */
  userAvatarId?: AvatarId;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  rating: number | null;
  createdAt: string;
};

type CapReason = "free" | "fair_usage" | null;

const WALLPAPER_SRC = "/brand/inspo/AItutor-window-wallpaper.jpg";

const SLY_LAUNCHER_LABEL = "Sly · your AI tutor";

/** Frosted launcher — matches dashboard card / LO glass panels. */
const slyLauncherSurface =
  "border border-teal-deep/35 bg-teal shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_16px_rgb(var(--ink-rgb)_/_0.08)]";

const slyLauncherMotion =
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[var(--ease-out-quint)] hover:bg-teal-deep hover:border-teal-deep/45 hover:shadow-[0_2px_4px_rgb(var(--ink-rgb)_/_0.05),0_8px_24px_rgb(var(--ink-rgb)_/_0.1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_16px_rgb(var(--ink-rgb)_/_0.08)]";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function slySuggestions(loNumber: number): string[] {
  return [
    `Explain learning objective ${loNumber} in plain English`,
    "Why might I get this topic wrong in the exam?",
    "Give me a short exam-technique tip for this LO",
    "Quiz me with one practice question on this topic",
  ];
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1,
  );
}

export function AiTutorPanel({
  isUnlocked,
  priceCents,
  loNumber = 1,
  courseId,
  returnPath,
  courseComplete = false,
  userFirstName = "You",
  userAvatarId = DEFAULT_AVATAR_ID,
}: AiTutorPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [failedSend, setFailedSend] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(
    null,
  );
  const [capReason, setCapReason] = useState<CapReason>(null);
  const [hasEntitlement, setHasEntitlement] = useState(isUnlocked);
  const [fairUsage, setFairUsage] = useState<FairUsageSummary | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const chatLocked = !!capReason;
  const showLockedSummary = courseComplete && !hasEntitlement;
  const showPayUrge =
    AI_TUTOR_LAUNCHED && !hasEntitlement && (chatLocked || !isUnlocked);
  const launcherLockedHint =
    AI_TUTOR_LAUNCHED &&
    !hasEntitlement &&
    (messagesRemaining === 0 || (!isUnlocked && messagesRemaining == null));

  const openPanel = useCallback(() => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setExpanded(true);
  }, []);

  const closePanel = useCallback(() => {
    setExpanded(false);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollContainerRef.current;
    if (el) {
      if (behavior === "smooth") {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const scrollToBottomAfterPaint = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToBottom("auto"));
    });
  }, [scrollToBottom]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 112);
    el.style.height = `${next}px`;
  }, []);

  const fillSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      requestAnimationFrame(() => {
        resizeTextarea();
        textareaRef.current?.focus();
      });
    },
    [resizeTextarea],
  );

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  useEffect(() => {
    if (!expanded) return;

    const scrollY = window.scrollY;
    const { body, documentElement: html } = document;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };
    const scrollbarGap = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    // iOS: fixed body so the page behind the sheet can't rubber-band scroll.
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.paddingRight = prev.bodyPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    const panel = panelRef.current;
    const previouslyFocused = restoreFocusRef.current;

    const focusInitial = () => {
      if (!chatLocked && AI_TUTOR_LAUNCHED) {
        textareaRef.current?.focus();
        return;
      }
      panel
        ?.querySelector<HTMLButtonElement>('button[aria-label="Close"]')
        ?.focus();
    };

    const focusTimer = window.setTimeout(focusInitial, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
        return;
      }

      if (e.key !== "Tab" || !panel) return;

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [expanded, chatLocked, closePanel]);

  const loadHistory = useCallback(async () => {
    const soft = messagesRef.current.length > 0;
    if (!soft) setLoadingHistory(true);
    setError("");
    try {
      const res = await fetch(
        `/api/tutor/chat?courseId=${encodeURIComponent(courseId)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn’t load chat history.");
        return;
      }
      setMessages(data.messages ?? []);
      setMessagesRemaining(data.messagesRemaining ?? null);
      setCapReason(data.capReason ?? null);
      setHasEntitlement(!!data.hasEntitlement);
      setFairUsage((prev) => data.fairUsage ?? prev);
      scrollToBottomAfterPaint();
    } catch {
      setError("Couldn’t load chat history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [courseId, scrollToBottomAfterPaint]);

  useEffect(() => {
    setHasEntitlement(isUnlocked);
  }, [isUnlocked]);

  useEffect(() => {
    if (expanded && AI_TUTOR_LAUNCHED) {
      void loadHistory();
      scrollToBottomAfterPaint();
    }
  }, [expanded, loadHistory, scrollToBottomAfterPaint]);

  async function handleSend(messageOverride?: string) {
    const trimmed = (messageOverride ?? input).trim();
    if (!trimmed || sending || chatLocked) return;

    posthog.capture("tutor_message_sent", {
      course_id: courseId,
      learning_objective: loNumber,
      is_entitled: hasEntitlement,
    });
    setSending(true);
    setError("");
    setFailedSend(null);
    setInput("");

    const optimisticUserId = `pending-user-${Date.now()}`;
    const optimisticAssistantId = `pending-assistant-${Date.now()}`;
    const now = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticUserId,
        role: "user",
        content: trimmed,
        rating: null,
        createdAt: now,
      },
      {
        id: optimisticAssistantId,
        role: "assistant",
        content: "",
        rating: null,
        createdAt: now,
      },
    ]);
    requestAnimationFrame(() => scrollToBottom("auto"));

    const failSend = (message: string) => {
      setMessages((prev) =>
        prev.filter(
          (m) => m.id !== optimisticUserId && m.id !== optimisticAssistantId,
        ),
      );
      setError(message);
      setFailedSend(trimmed);
      setInput(trimmed);
    };

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, loNumber, message: trimmed }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!contentType.includes("text/event-stream")) {
        const data = await res.json();
        if (!res.ok) {
          if (data.capReason) {
            setCapReason(data.capReason);
            setMessagesRemaining(0);
          }
          failSend(
            data.capReason === "free"
              ? "You've used your 3 free messages. Unlock for unlimited access."
              : data.capReason === "fair_usage"
                ? "You've reached the fair-usage limit for this course."
                : (data.error ?? "Couldn’t send your message."),
          );
          return;
        }
        setMessages((prev) => {
          const withoutPending = prev.filter(
            (m) =>
              m.id !== optimisticUserId && m.id !== optimisticAssistantId,
          );
          return [
            ...withoutPending,
            {
              id: optimisticUserId,
              role: "user" as const,
              content: trimmed,
              rating: null,
              createdAt: now,
            },
            data.reply,
          ];
        });
        setMessagesRemaining(data.messagesRemaining ?? null);
        setCapReason(data.capReason ?? null);
        setFairUsage(data.fairUsage ?? null);
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "Sly replied";
        }
        scrollToBottom("auto");
        return;
      }

      if (!res.ok || !res.body) {
        failSend("Couldn’t send your message.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamFailed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;
            const raw = trimmedLine.slice(5).trim();
            if (!raw) continue;

            let event: {
              type: string;
              message?: ChatMessage;
              text?: string;
              reply?: ChatMessage;
              messagesRemaining?: number | null;
              capReason?: CapReason;
              fairUsage?: FairUsageSummary | null;
              error?: string;
            };
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event.type === "user" && event.message) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticUserId ? event.message! : m,
                ),
              );
            } else if (event.type === "chunk" && event.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticAssistantId
                    ? { ...m, content: m.content + event.text! }
                    : m,
                ),
              );
              scrollToBottom("auto");
            } else if (event.type === "done" && event.reply) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticAssistantId ? event.reply! : m,
                ),
              );
              setMessagesRemaining(event.messagesRemaining ?? null);
              setCapReason(event.capReason ?? null);
              setFairUsage((prev) => event.fairUsage ?? prev);
              if (liveRegionRef.current) {
                liveRegionRef.current.textContent = "Sly replied";
              }
              scrollToBottom("auto");
            } else if (event.type === "error") {
              streamFailed = true;
              failSend(event.error ?? "Couldn’t send your message.");
            }
          }
        }
      }

      if (!streamFailed) {
        // If stream ended without done/error, leave whatever we rendered
      }
    } catch {
      failSend("Couldn’t send your message.");
    } finally {
      setSending(false);
    }
  }

  async function handleRating(messageId: string, rating: -1 | 1) {
    const current = messages.find((m) => m.id === messageId);
    // Exclusive up/down; click selected again to clear.
    const nextRating = current?.rating === rating ? null : rating;
    const previous = current?.rating ?? null;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, rating: nextRating } : m)),
    );

    try {
      await fetch("/api/tutor/rating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating: nextRating }),
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, rating: previous } : m,
        ),
      );
    }
  }

  function renderWallpaper() {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src={WALLPAPER_SRC}
          alt=""
          fill
          sizes="440px"
          priority={expanded}
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/15 via-transparent to-cream/30" />
      </div>
    );
  }

  function renderSkeletons() {
    return (
      <div
        className="flex h-full min-h-[14rem] items-center justify-center"
        aria-busy
        aria-label="Loading chat"
      >
        <Spinner variant="ellipsis" size={28} className="text-ink/45" />
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-4 px-1 py-8 text-center">
        <div className="rounded-2xl bg-cream/92 px-4 py-3 shadow-sm ring-1 ring-ink/10">
          <p className="max-w-[18rem] text-[14px] font-medium leading-relaxed text-ink text-pretty">
            Ask about this learning objective, quiz mistakes, or exam technique.
          </p>
        </div>
        <div className="flex w-full max-w-[22rem] flex-col gap-2">
          {slySuggestions(loNumber).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => fillSuggestion(suggestion)}
              className="rounded-xl border border-ink/15 bg-cream/95 px-3.5 py-2.5 text-left text-[13px] leading-snug text-ink shadow-sm transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] hover:border-teal/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderMessageList() {
    if (loadingHistory && messages.length === 0) {
      return renderSkeletons();
    }

    if (messages.length === 0) {
      return renderEmptyState();
    }

    return (
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
                <span className="inline-flex items-center gap-2 rounded-full bg-cream/95 py-0.5 pl-2.5 pr-0.5 ring-1 ring-ink/10">
                  <span className="text-[12px] font-semibold text-ink">
                    {userFirstName}
                  </span>
                  <UserFace size={22} avatarId={userAvatarId} />
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

                {msg.role === "assistant" &&
                !msg.id.startsWith("pending-") &&
                msg.content ? (
                  <div className={`${slyChromeStyles.thumbRow} mt-2.5 flex items-center border-t border-ink/10 pt-1.5`}>
                    <button
                      type="button"
                      onClick={() => handleRating(msg.id, 1)}
                      className={`${slyChromeStyles.thumbButton} ${
                        msg.rating === 1 ? slyChromeStyles.thumbOn : ""
                      }`}
                      aria-label="Mark helpful"
                      aria-pressed={msg.rating === 1}
                    >
                      <ThumbIcon side="up" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRating(msg.id, -1)}
                      className={`${slyChromeStyles.thumbButton} ${slyChromeStyles.thumbDown} ${
                        msg.rating === -1 ? slyChromeStyles.thumbOn : ""
                      }`}
                      aria-label="Mark not helpful"
                      aria-pressed={msg.rating === -1}
                    >
                      <ThumbIcon side="down" />
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderComposer() {
    if (chatLocked || !AI_TUTOR_LAUNCHED) return null;

    return (
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
                onClick={() => void handleSend(failedSend)}
                className="shrink-0 font-semibold text-teal-deep underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={`${slyChromeStyles.composerWell} flex items-end gap-2 rounded-xl border border-ink/10 bg-paper/55 p-1 transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-out-quint)] focus-within:border-teal/50 focus-within:bg-paper/75 focus-within:shadow-[0_0_0_3px_rgb(var(--teal-rgb)_/_0.14)]`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
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
            onClick={() => void handleSend()}
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
            source="Sly tutor panel"
          />
        </p>
      </div>
    );
  }

  function renderMetaStrip() {
    if (!AI_TUTOR_LAUNCHED || chatLocked || hasEntitlement) return null;

    return (
      <div className="relative z-10">
        {showLockedSummary ? (
          <p className="border-b border-ink/10 bg-cream/95 px-4 py-2 text-[13px] leading-snug text-ink/75">
            You&apos;ve finished all 24 learning objectives. Unlock Sly for
            your personalised weak-area summary — same one-time unlock.
          </p>
        ) : null}
        <SlyUnlockInvite
          priceCents={priceCents}
          loNumber={loNumber}
          returnPath={returnPath}
          urgency="soft"
          variant="compact"
          messagesRemaining={messagesRemaining}
        />
      </div>
    );
  }

  function renderLockedCap() {
    const isFreeCap = capReason === "free";
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        {renderWallpaper()}
        {messages.length > 0 ? (
          <div
            ref={scrollContainerRef}
            className={`${slyChromeStyles.scroll} relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4`}
            aria-disabled="true"
          >
            <p className="mb-3 rounded-xl bg-cream/95 px-3 py-2 text-[13px] font-medium leading-snug text-ink ring-1 ring-ink/10">
              Chat is paused — unlock or top up below to keep talking with Sly.
            </p>
            <div className="pointer-events-none select-none" aria-hidden>
              {renderMessageList()}
            </div>
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="relative z-10 min-h-0 flex-1" />
        )}
        <div className={`${slyChromeStyles.composer} relative z-10 shrink-0 p-3 sm:p-4`}>
          {isFreeCap ? (
            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3 shadow-sm backdrop-blur-sm">
              <SlyUnlockInvite
                priceCents={priceCents}
                loNumber={loNumber}
                returnPath={returnPath}
                urgency="cap"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-ink/10 bg-paper/70 p-3.5 shadow-sm backdrop-blur-sm">
              <LockedFeature unlocked={false} label="Fair usage reached">
                <p className="text-[14px] leading-relaxed text-ink/70">
                  You&apos;ve reached the fair-usage limit for Sly on this
                  course. Top up anytime — 70% of what you pay goes back into
                  your metre.
                </p>
                <button
                  type="button"
                  onClick={() => setTopUpOpen(true)}
                  className="btn btn-primary mt-3 !min-h-10 w-full !rounded-xl !text-xs !uppercase !tracking-[0.07em] font-body"
                >
                  Top up Sly
                </button>
              </LockedFeature>
            </div>
          )}
          {error ? (
            <p
              className="mt-2.5 rounded-lg border border-ink/10 bg-paper/90 px-3 py-1.5 font-body text-[12px] font-medium text-ink/55"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const launcherPulse =
    showPayUrge || launcherLockedHint
      ? "motion-safe:animate-[sly-launcher-glow_3.6s_ease-in-out_infinite]"
      : "";

  const launcherAriaLabel = "Open Sly, your AI tutor";
  const launcherLabel = !AI_TUTOR_LAUNCHED
    ? "Sly · coming soon"
    : SLY_LAUNCHER_LABEL;

  return (
    <>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      {!expanded && (
        <>
          <button
            type="button"
            onClick={openPanel}
            className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-40 flex h-14 w-14 items-center justify-center rounded-2xl text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:hidden ${slyLauncherSurface} ${slyLauncherMotion} ${launcherPulse}`}
            aria-label={launcherAriaLabel}
          >
            <SlyFace size={36} bordered />
          </button>

        <button
          type="button"
            onClick={openPanel}
            className={`fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 rounded-2xl px-3 py-4 text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:flex ${slyLauncherSurface} ${slyLauncherMotion} ${launcherPulse}`}
            aria-label={launcherAriaLabel}
          >
            <SlyFace size={40} bordered />
            <span className="max-h-[9.5rem] font-body text-[11px] font-semibold leading-snug tracking-[-0.01em] text-paper/90 [writing-mode:vertical-rl] rotate-180">
              {launcherLabel}
          </span>
        </button>
        </>
      )}

      {expanded && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close Sly, your AI tutor"
            className="fixed inset-0 z-40 bg-ink/40"
            onClick={closePanel}
          />
          <SlyPanelShell
            ref={panelRef}
            label="Sly, your AI tutor"
          >
            <SlyPanelHeader>
              <SlyFace size={28} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold leading-tight text-paper">
                  {!AI_TUTOR_LAUNCHED ? "Sly · coming soon" : "Sly"}
                </h2>
                <p className="truncate text-[10px] font-medium leading-tight text-paper/70">
                  {!AI_TUTOR_LAUNCHED ? "On the way" : "Your AI tutor"}
                </p>
              </div>
              {AI_TUTOR_LAUNCHED && hasEntitlement && fairUsage ? (
                <SlyUsageMeter variant="header" usage={fairUsage} />
              ) : AI_TUTOR_LAUNCHED && hasEntitlement ? (
                <div className="min-w-[5.75rem]" aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={closePanel}
                className={`${iconAction} !min-h-8 !min-w-8 shrink-0 text-paper/85 hover:bg-paper/10 hover:text-paper focus-visible:ring-paper`}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </SlyPanelHeader>

              {!AI_TUTOR_LAUNCHED ? (
              <div className={`${slyChromeStyles.scroll} relative min-h-0 flex-1 overflow-y-auto p-5`}>
                {renderWallpaper()}
                <div className="relative z-10 rounded-xl border border-ink/15 bg-cream/95 p-5 shadow-sm">
                  <p className="mb-2 text-[12px] font-medium text-orange">
                        Coming soon
                  </p>
                    <p className="text-[15px] leading-relaxed text-ink/85">
                    Sly, your personal PMQ tutor, is on the way — scoped to the
                    topic you&apos;re studying, grounded in the APM syllabus,
                    and aware of your quiz attempts so it can explain what you
                    got wrong.
                  </p>
                </div>
                  </div>
            ) : chatLocked ? (
              renderLockedCap()
            ) : (
              <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
                {renderWallpaper()}
                {renderMetaStrip()}
                <div
                  ref={scrollContainerRef}
                  className={`${slyChromeStyles.scroll} relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4`}
                >
                  {renderMessageList()}
                  <div ref={messagesEndRef} />
                </div>
                {renderComposer()}
                </div>
              )}
          </SlyPanelShell>
        </>
      )}
      <SlyTopUpDialog
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        returnPath={returnPath ?? `/courses/pmq-in-5-days/lo/${loNumber}`}
      />
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

function UserFace({ size, avatarId }: { size: number; avatarId: AvatarId }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full bg-avatar-plate"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <AvatarImage avatarId={avatarId} size={size} />
    </span>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="translate-x-px"
    >
      <path
        d="M4.5 12h12M12.5 6.5 18.5 12l-6 5.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

/** Transparent sticker plates — public/brand/inspo/thumbs-{up,down}.png */
function ThumbIcon({ side }: { side: "up" | "down" }) {
  return (
    <Image
      src={
        side === "up"
          ? "/brand/inspo/thumbs-up.png"
          : "/brand/inspo/thumbs-down.png"
      }
      alt=""
      width={18}
      height={18}
      className={`${slyChromeStyles.thumbImage} pointer-events-none h-[18px] w-[18px] select-none object-contain`}
      draggable={false}
    />
  );
}
