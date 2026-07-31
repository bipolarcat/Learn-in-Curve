"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GUEST_TIER_MESSAGE_CAP } from "@/lib/tutor/constants";

export type GuestChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type UseGuestSlyChatOptions = {
  /**
   * Gate for the one-off usage GET. Pass the visibility/open flag so the
   * landing page doesn't call the tutor route for visitors who never reach the
   * Sly section, while still resolving the allowance well before a click.
   */
  active: boolean;
};

/**
 * Guest Sly chat engine — 3 messages per hashed IP, streamed over SSE.
 *
 * Extracted from `GuestSlyPanel` so the drawer and the inline landing console
 * share one implementation. Two copies of a streaming reducer drift, and the
 * remaining-allowance number is a commercial statement: it decides whether a
 * visitor believes the tutor is free.
 */
export function useGuestSlyChat({ active }: UseGuestSlyChatOptions) {
  const [messages, setMessages] = useState<GuestChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [failedSend, setFailedSend] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState(
    GUEST_TIER_MESSAGE_CAP,
  );
  const [locked, setLocked] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [usageLoaded, setUsageLoaded] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  /** False once the reader scrolls up — auto-scroll must not yank them back. */
  const stickToBottomRef = useRef(true);
  const loadedRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (!stickToBottomRef.current) return;
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  /** Attach to the scroll container's `onScroll`. */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  }, []);

  useEffect(() => {
    if (!active || loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tutor/guest-chat");
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setMessagesRemaining(
            typeof data.messagesRemaining === "number"
              ? data.messagesRemaining
              : GUEST_TIER_MESSAGE_CAP,
          );
          setLocked(Boolean(data.locked));
          setUnavailable(data.enabled === false);
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setUsageLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  const send = useCallback(
    async (messageOverride?: string) => {
      const trimmed = (messageOverride ?? input).trim();
      if (!trimmed || sending || locked || unavailable) return;

      setSending(true);
      setError("");
      setFailedSend(null);
      setInput("");
      stickToBottomRef.current = true;

      const optimisticUserId = `pending-user-${Date.now()}`;
      const optimisticAssistantId = `pending-assistant-${Date.now()}`;
      const now = new Date().toISOString();

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticUserId,
          role: "user",
          content: trimmed,
          createdAt: now,
        },
        {
          id: optimisticAssistantId,
          role: "assistant",
          content: "",
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
        const res = await fetch("/api/tutor/guest-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });

        const contentType = res.headers.get("content-type") ?? "";

        if (!contentType.includes("text/event-stream")) {
          const data = await res.json();
          if (!res.ok) {
            if (data.error === "guest_trial_unavailable") {
              setUnavailable(true);
              failSend("Sly's free trial is paused right now.");
              return;
            }
            if (data.error === "guest_cap_exceeded" || data.locked) {
              setLocked(true);
              setMessagesRemaining(0);
              failSend(
                `You've used your ${GUEST_TIER_MESSAGE_CAP} free trial messages.`,
              );
              return;
            }
            failSend(data.error ?? "Couldn’t send your message.");
            return;
          }
          return;
        }

        if (!res.ok || !res.body) {
          failSend("Couldn’t send your message.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

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
                message?: GuestChatMessage;
                text?: string;
                reply?: GuestChatMessage;
                messagesRemaining?: number;
                locked?: boolean;
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
                if (typeof event.messagesRemaining === "number") {
                  setMessagesRemaining(event.messagesRemaining);
                }
                if (event.locked) setLocked(true);
                if (liveRegionRef.current) {
                  liveRegionRef.current.textContent = "Sly replied";
                }
                scrollToBottom("auto");
              } else if (event.type === "error") {
                failSend(event.error ?? "Couldn’t send your message.");
              }
            }
          }
        }
      } catch {
        failSend("Couldn’t send your message.");
      } finally {
        setSending(false);
      }
    },
    [input, locked, messages, scrollToBottom, sending, unavailable],
  );

  return {
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
  };
}
