"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bell, X } from "lucide-react";
import {
  DASHBOARD_INBOX,
  type InboxMessage,
} from "@/content/dashboard-inbox";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lic-dashboard-inbox-read";
const FOX_SRC = "/brand/logo/fox-logo-png.png";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // private mode / quota — unread badge may reappear; message still works
  }
}

function formatPublishedDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeAgoLabel(iso: string): string {
  const then = Date.parse(`${iso}T12:00:00`);
  if (Number.isNaN(then)) return "";
  const days = Math.max(0, Math.round((Date.now() - then) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function NotificationItem({
  message,
  unread,
  onOpen,
}: {
  message: InboxMessage;
  unread: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onOpen}
      className="flex w-full items-start gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] focus-visible:bg-ink/[0.04] focus-visible:outline-none active:bg-ink/[0.06]"
    >
      <span className="relative mt-0.5 flex size-9 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-ink/[0.06]">
        <Image
          src={FOX_SRC}
          alt=""
          width={36}
          height={36}
          className="aspect-square size-full object-cover"
          aria-hidden
        />
      </span>

      <span className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            "block text-[13px] leading-snug tracking-[-0.01em] text-ink",
            unread ? "font-semibold" : "font-medium",
          )}
        >
          {message.title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-none text-ink/40">
          {timeAgoLabel(message.publishedAt)}
        </span>
      </span>

      {unread ? (
        <span
          className="mt-2 size-2 shrink-0 rounded-full bg-orange"
          aria-label="Unread"
        />
      ) : (
        <span className="mt-2 size-2 shrink-0" aria-hidden />
      )}
    </button>
  );
}

export function DashboardInboxBell() {
  const listId = useId();
  const headingId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(
    null,
  );
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReadIds(loadReadIds());
    setHydrated(true);
  }, []);

  const unreadCount = hydrated
    ? DASHBOARD_INBOX.filter((m) => !readIds.has(m.id)).length
    : 0;
  const hasUnread = unreadCount > 0;

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  const closeModal = useCallback(() => setActiveMessage(null), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        closeDropdown();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !activeMessage) closeDropdown();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen, activeMessage, closeDropdown]);

  useEffect(() => {
    if (!activeMessage) return;
    const { body, documentElement: html } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMessage, closeModal]);

  function openMessage(message: InboxMessage) {
    markRead(message.id);
    setDropdownOpen(false);
    setActiveMessage(message);
  }

  return (
    <>
      <div ref={rootRef} className="relative z-30 shrink-0">
        <button
          type="button"
          aria-label={
            hasUnread
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          aria-expanded={dropdownOpen}
          aria-controls={listId}
          aria-haspopup="menu"
          onClick={() => setDropdownOpen((v) => !v)}
          className={cn(
            "relative inline-flex size-8 items-center justify-center rounded-full border border-ink/[0.08] bg-cream/80 transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream hover:bg-cream",
            dropdownOpen && "border-ink/[0.12] bg-cream",
          )}
        >
          <Bell
            className="size-[1.05rem] text-ink/65"
            strokeWidth={1.75}
            aria-hidden
          />
          {hasUnread ? (
            <span
              className="absolute right-1 top-1 size-1.5 rounded-full bg-orange"
              aria-hidden
            />
          ) : null}
        </button>

        {dropdownOpen ? (
          <div
            id={listId}
            role="menu"
            aria-label="Notifications"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[50] w-[min(calc(100vw-1.5rem),20rem)] origin-top-right overflow-hidden rounded-[1.35rem] border border-ink/[0.06] bg-cream/95 p-2 shadow-[0_8px_30px_rgb(var(--ink-rgb)_/_0.12),0_1px_2px_rgb(var(--ink-rgb)_/_0.04)] backdrop-blur-xl motion-safe:animate-[profile-pop_160ms_var(--ease-out-quint)] supports-[backdrop-filter]:bg-cream/80 dark:border-white/[0.1]"
          >
            <div className="px-2.5 pb-1.5 pt-2">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                Notifications
              </h3>
            </div>

            <div className="flex flex-col gap-0.5">
              {DASHBOARD_INBOX.map((message) => (
                <NotificationItem
                  key={message.id}
                  message={message}
                  unread={hydrated && !readIds.has(message.id)}
                  onOpen={() => openMessage(message)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {activeMessage && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/30 p-3 backdrop-blur-[3px] motion-safe:animate-[feedback-backdrop-in_0.22s_var(--ease-out-quint)_both] motion-reduce:backdrop-blur-none sm:items-center sm:p-6"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                className="relative flex max-h-[min(88dvh,36rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-[1.5rem] border border-ink/[0.06] bg-cream shadow-[0_16px_48px_rgb(var(--ink-rgb)_/_0.14),0_2px_6px_rgb(var(--ink-rgb)_/_0.04)] motion-safe:animate-[feedback-dialog-in_0.32s_var(--ease-out-quint)_both]"
              >
                <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
                  <div className="min-w-0 pr-2">
                    <h2
                      id={headingId}
                      className="font-display text-[1.2rem] font-bold leading-snug tracking-[-0.03em] text-ink text-pretty"
                    >
                      {activeMessage.heading}
                    </h2>
                    <p className="mt-1.5 text-[12px] text-ink/40">
                      {formatPublishedDate(activeMessage.publishedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-ink/45 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.08] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    <X className="size-3.5" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>

                <div className="inbox-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6 sm:pb-7">
                  <div className="space-y-3.5 font-body text-[13.5px] leading-relaxed tracking-tight text-ink/75 text-pretty">
                    {activeMessage.sections.map((section, i) => {
                      if (section.kind === "lead") {
                        return (
                          <p key={i} className="text-ink/75">
                            {section.text}
                          </p>
                        );
                      }
                      if (section.kind === "heading") {
                        return (
                          <h3
                            key={i}
                            className="pt-1 font-display text-[0.95rem] font-bold tracking-[-0.02em] text-ink"
                          >
                            {section.text}
                          </h3>
                        );
                      }
                      if (section.kind === "bullets") {
                        return (
                          <ul
                            key={i}
                            className="list-disc space-y-1.5 pl-4 marker:text-ink/30"
                          >
                            {section.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={i}>{section.text}</p>;
                    })}

                    <div className="space-y-1 pt-2">
                      <p>{activeMessage.signOff.thanks}</p>
                      <p className="pt-2">{activeMessage.signOff.farewell}</p>
                      <p className="font-medium text-ink">
                        {activeMessage.signOff.name}
                      </p>
                      <p className="text-[12px] text-ink/40">
                        {activeMessage.signOff.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
