"use client";

import Image from "next/image";
import { slyChromeStyles } from "@/components/SlyChrome";
import showcase from "@/components/SlyShowcase.module.css";
import { useEffect, useRef, useState } from "react";

import { SLY_SHOWCASE_CHAT } from "@/lib/pmq/sly-showcase-chat";

export { SLY_SHOWCASE_CHAT };

const WALLPAPER_SRC = "/brand/inspo/AItutor-window-wallpaper.webp";

const TYPE_MS = 32;
const OPENER_HOLD_MS = 900;
const PRE_SEND_MS = 280;
const SEND_FLASH_MS = 200;
const POST_USER_MS = 480;
const THINKING_MS = 1100;
const HOLD_MS = 2800;
const RESET_GAP_MS = 420;

type VisibleMsg = {
  id: string;
  role: "sly" | "user";
  text: string;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type SlyMacConsoleProps = {
  compact?: boolean;
};

/**
 * Landing product demo: Mac-style SaaS chat window with typed send/reply loop.
 * Decorative only (aria-hidden) — it never fetches or accepts user input.
 */
export function SlyMacConsole({ compact = false }: SlyMacConsoleProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [messages, setMessages] = useState<VisibleMsg[]>([
    {
      id: "seed",
      role: "sly",
      text: SLY_SHOWCASE_CHAT[0].text,
    },
  ]);
  const [composerText, setComposerText] = useState("");
  const [showCaret, setShowCaret] = useState(false);
  const [sending, setSending] = useState(false);
  const [slyTyping, setSlyTyping] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, slyTyping]);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting);
      },
      { threshold: 0.28 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        timersRef.current.push(id);
      });

    if (reduced) {
      clearTimers();
      setMessages(
        SLY_SHOWCASE_CHAT.map((line, i) => ({
          id: `static-${i}`,
          role: line.role,
          text: line.text,
        })),
      );
      setComposerText("");
      setShowCaret(false);
      setSending(false);
      setSlyTyping(false);
      return clearTimers;
    }

    if (!inView) {
      clearTimers();
      return clearTimers;
    }

    let cancelled = false;

    async function runLoop() {
      while (!cancelled) {
        setMessages([]);
        setComposerText("");
        setShowCaret(false);
        setSending(false);
        setSlyTyping(false);

        await wait(RESET_GAP_MS);
        if (cancelled) break;

        for (let i = 0; i < SLY_SHOWCASE_CHAT.length; i++) {
          if (cancelled) return;
          const line = SLY_SHOWCASE_CHAT[i];
          const isFirst = i === 0;

          if (line.role === "sly") {
            if (isFirst) {
              setMessages([
                {
                  id: `opener-${Date.now()}`,
                  role: "sly",
                  text: line.text,
                },
              ]);
              await wait(OPENER_HOLD_MS);
              if (cancelled) break;
            } else {
              setSlyTyping(true);
              await wait(THINKING_MS);
              if (cancelled) break;
              setSlyTyping(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: `sly-${i}-${Date.now()}`,
                  role: "sly",
                  text: line.text,
                },
              ]);
              await wait(POST_USER_MS);
              if (cancelled) break;
            }
          } else {
            setShowCaret(true);
            const userText = line.text;
            for (let c = 1; c <= userText.length; c++) {
              if (cancelled) return;
              setComposerText(userText.slice(0, c));
              await wait(TYPE_MS);
            }
            await wait(PRE_SEND_MS);
            if (cancelled) break;

            setSending(true);
            await wait(SEND_FLASH_MS);
            if (cancelled) break;

            setComposerText("");
            setShowCaret(false);
            setSending(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `user-${i}-${Date.now()}`,
                role: "user",
                text: userText,
              },
            ]);
            await wait(POST_USER_MS);
            if (cancelled) break;
          }
        }

        if (cancelled) break;
        await wait(HOLD_MS);
        if (cancelled) break;
      }
    }

    void runLoop();
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [inView, reduced]);

  const composerEmpty = composerText.length === 0;

  return (
    <div
      ref={rootRef}
      className={`${showcase.console} relative mx-auto flex w-full max-w-[680px] flex-col overflow-hidden rounded-[14px] border border-ink/12 bg-paper text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06),0_18px_40px_-12px_rgb(var(--ink-rgb)_/_0.28),0_8px_16px_-8px_rgb(var(--ink-rgb)_/_0.14)] lg:mx-0 lg:max-w-none ${
        compact ? "h-[310px] sm:h-[330px]" : "h-[360px] sm:h-[400px]"
      }`}
      aria-hidden
    >
      {/* Mac title bar */}
      <div className="relative flex shrink-0 items-center border-b border-ink/8 bg-[#EDE6D6] px-3.5 py-2.5">
        <div className="absolute left-3.5 flex items-center gap-[7px]">
          <span className="sly-mac-traffic h-[11px] w-[11px] rounded-full bg-[#FF5F57] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="sly-mac-traffic h-[11px] w-[11px] rounded-full bg-[#FEBC2E] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
          <span className="sly-mac-traffic h-[11px] w-[11px] rounded-full bg-[#28C840] shadow-[inset_0_-0.5px_0.5px_rgb(0_0_0_/_0.18)]" />
        </div>
        <div className="mx-auto flex items-center gap-2 pl-14 pr-2">
          <span className="relative inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-sand">
            <Image
              src="/mascot/fox-face.svg"
              alt=""
              width={20}
              height={20}
              className="h-full w-full object-cover object-top"
            />
          </span>
          <p className="truncate text-[12.5px] font-semibold tracking-[-0.01em] text-ink/75">
            Sly · AI tutor
          </p>
        </div>
      </div>

      {/* Chat body — fixed height; demo advances programmatically, no user scroll */}
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
          ref={scrollRef}
          className={`${slyChromeStyles.scroll} relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-5`}
        >
          {messages.map((line) => (
            <ChatBubble key={line.id} role={line.role} text={line.text} />
          ))}

          {slyTyping ? (
            <div className={`${showcase.bubble} flex w-full min-w-0 flex-col items-start gap-1.5`}>
              <NameChip role="sly" />
              <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-ink/10 bg-paper/95 px-3.5 py-3 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06)]">
                <span className={`${slyChromeStyles.typingDot} h-1.5 w-1.5 rounded-full bg-ink/35`} />
                <span className={`${slyChromeStyles.typingDot} h-1.5 w-1.5 rounded-full bg-ink/35`} />
                <span className={`${slyChromeStyles.typingDot} h-1.5 w-1.5 rounded-full bg-ink/35`} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 shrink-0 border-t border-ink/8 bg-paper/92 px-3 pb-3.5 pt-3 backdrop-blur-[2px] sm:px-4">
          <div className="flex items-end gap-2 rounded-[12px] border border-ink/12 bg-cream/95 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.45)]">
            <p
              className={`min-h-11 flex-1 px-3 py-2.5 text-[14.5px] leading-snug ${
                composerEmpty ? "text-ink/40" : "text-ink"
              }`}
            >
              {composerEmpty && !showCaret ? (
                "Ask Sly…"
              ) : (
                <>
                  {composerText}
                  {showCaret ? (
                    <span
                      className={`${showcase.caret} ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-teal align-baseline`}
                      aria-hidden
                    />
                  ) : null}
                </>
              )}
            </p>
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-orange text-paper transition-transform duration-150 ${
                sending ? `${showcase.sendFlash} scale-95` : ""
              }`}
            >
              <SendGlyph />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
}: {
  role: "sly" | "user";
  text: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`${showcase.bubble} flex w-full min-w-0 flex-col gap-1.5 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <NameChip role={role} />
      <div
        className={`min-w-0 max-w-[88%] overflow-hidden px-3.5 py-2.5 text-[14px] leading-relaxed shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.06)] ${
          isUser
            ? `${slyChromeStyles.userBubble} rounded-2xl rounded-br-md break-words text-paper`
            : "rounded-2xl rounded-bl-md border border-ink/10 bg-paper/95 text-ink"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-pretty">{text}</p>
      </div>
    </div>
  );
}

function NameChip({ role }: { role: "sly" | "user" }) {
  if (role === "user") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-paper/90 py-0.5 pl-2.5 pr-0.5 ring-1 ring-ink/8">
        <span className="text-[11px] font-semibold text-ink/70">Sim</span>
        <span className="relative inline-flex h-[20px] w-[20px] overflow-hidden rounded-full bg-avatar-plate">
          <Image
            src="/avatars/bear.png?v=11"
            alt=""
            width={20}
            height={20}
            className="h-full w-full scale-[1.14] object-cover object-center"
          />
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-paper/90 py-0.5 pl-0.5 pr-2.5 ring-1 ring-ink/8">
      <span className="relative inline-flex h-[20px] w-[20px] overflow-hidden rounded-full border border-ink/10 bg-sand">
        <Image
          src="/mascot/fox-face.svg"
          alt=""
          width={20}
          height={20}
          className="h-full w-full object-cover object-top"
        />
      </span>
      <span className="text-[11px] font-semibold text-ink/70">Sly</span>
    </span>
  );
}

function SendGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h12M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
