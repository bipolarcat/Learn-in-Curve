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
import { Bell, CheckCheck, X } from "lucide-react";
import {
  DASHBOARD_INBOX,
  type InboxMessage,
} from "@/content/dashboard-inbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quietFormSurface } from "@/components/ui/semantic";
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

function formatWeekdayStamp(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
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
      className="w-full py-4 text-left first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
    >
      <div className="flex gap-3">
        <span className="relative flex size-11 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-border">
          <Image
            src={FOX_SRC}
            alt=""
            width={44}
            height={44}
            className="aspect-square size-full object-cover"
            aria-hidden
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col space-y-2">
          <div className="w-full items-start">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm leading-snug tracking-[-0.006em] text-ink">
                <span className="font-medium">{message.from}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {message.action}{" "}
                </span>
                <span className="font-medium">{message.target}</span>
              </p>
              {unread ? (
                <span
                  className="size-1.5 shrink-0 rounded-full bg-olive"
                  aria-label="Unread"
                />
              ) : null}
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {formatWeekdayStamp(message.publishedAt)}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgoLabel(message.publishedAt)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-2.5 text-sm leading-snug tracking-[-0.006em] text-ink/80">
            {message.preview}
          </div>
        </div>
      </div>
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

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const m of DASHBOARD_INBOX) next.add(m.id);
      if (next.size === prev.size) return prev;
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
            "relative inline-flex size-8 items-center justify-center rounded-xl border border-black/[0.08] transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:border-white/[0.12]",
            dropdownOpen
              ? "bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.05)]"
              : "bg-paper/90 hover:border-black/[0.14] hover:bg-paper dark:hover:border-white/[0.18]",
          )}
        >
          <Bell
            className="size-[1.05rem] text-ink/70"
            strokeWidth={1.75}
            aria-hidden
          />
          {hasUnread ? (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange ring-2 ring-paper"
              aria-hidden
            />
          ) : null}
        </button>

        {dropdownOpen ? (
          <div
            id={listId}
            role="menu"
            aria-label="Your notifications"
            className="absolute right-0 top-[calc(100%+0.4rem)] z-[50] flex w-[min(calc(100vw-1.5rem),22rem)] origin-top-right flex-col gap-5 rounded-xl border border-border bg-paper p-4 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_12px_32px_rgb(var(--ink-rgb)_/_0.12)] motion-safe:animate-[profile-pop_160ms_var(--ease-out-quint)] sm:w-[26rem] sm:p-5 dark:border-white/[0.12]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold leading-none tracking-[-0.006em] text-ink">
                  Your notifications
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label="Mark all as read"
                  disabled={!hasUnread}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllRead();
                  }}
                >
                  <CheckCheck className="size-4" aria-hidden />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-ink">
                  View all
                  <Badge
                    variant="secondary"
                    className="size-5 justify-center rounded-full border-0 bg-ink/15 px-0 text-[11px] text-ink"
                  >
                    {DASHBOARD_INBOX.length}
                  </Badge>
                </span>
                {hasUnread ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground">
                    Unread
                    <Badge
                      variant="secondary"
                      className="size-5 justify-center rounded-full border-0 bg-olive/20 px-0 text-[11px] text-olive"
                    >
                      {unreadCount}
                    </Badge>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="divide-y divide-dashed divide-border">
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
              className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] motion-safe:animate-[feedback-backdrop-in_0.22s_var(--ease-out-quint)_both] motion-reduce:backdrop-blur-none sm:items-center sm:p-4"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                className={cn(
                  quietFormSurface,
                  "relative flex max-h-[min(92dvh,40rem)] w-full max-w-[28rem] flex-col rounded-t-2xl motion-safe:animate-[feedback-dialog-in_0.32s_var(--ease-out-quint)_both] sm:rounded-2xl",
                )}
              >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-white px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                  <div className="flex min-w-0 items-start gap-3 pr-2">
                    <span className="relative mt-0.5 flex size-10 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-border">
                      <Image
                        src={FOX_SRC}
                        alt=""
                        width={40}
                        height={40}
                        className="aspect-square size-full object-cover"
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0">
                      <h2
                        id={headingId}
                        className="font-display text-[1.15rem] font-bold leading-snug tracking-[-0.03em] text-ink text-pretty"
                      >
                        {activeMessage.heading}
                      </h2>
                      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                        {formatPublishedDate(activeMessage.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={closeModal}
                    aria-label="Close"
                    className="size-8 shrink-0 text-muted-foreground"
                  >
                    <X className="size-4" strokeWidth={2} aria-hidden />
                  </Button>
                </div>

                <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                  <div className="space-y-3.5 font-body text-[13.5px] leading-relaxed tracking-tight text-ink/80 text-pretty">
                    {activeMessage.sections.map((section, i) => {
                      if (section.kind === "lead") {
                        return (
                          <p key={i} className="font-semibold text-ink">
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
                            className="list-disc space-y-1.5 pl-4 marker:text-ink/35"
                          >
                            {section.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={i}>{section.text}</p>;
                    })}

                    <div className="space-y-1 border-t border-border pt-4">
                      <p className="text-ink">{activeMessage.signOff.thanks}</p>
                      <p className="pt-2 text-ink">
                        {activeMessage.signOff.farewell}
                      </p>
                      <p className="font-semibold text-ink">
                        {activeMessage.signOff.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
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
