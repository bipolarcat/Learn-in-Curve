"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";
import {
  DASHBOARD_INBOX,
  type InboxMessage,
} from "@/content/dashboard-inbox";
import { quietFormSurface } from "@/components/ui/semantic";

const STORAGE_KEY = "lic-dashboard-inbox-read";

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

  const hasUnread =
    hydrated && DASHBOARD_INBOX.some((m) => !readIds.has(m.id));

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
              ? "Notifications, 1 unread"
              : "Notifications"
          }
          aria-expanded={dropdownOpen}
          aria-controls={listId}
          aria-haspopup="menu"
          onClick={() => setDropdownOpen((v) => !v)}
          className={`relative inline-flex size-8 items-center justify-center rounded-xl border border-black/[0.08] transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:border-white/[0.12] ${
            dropdownOpen
              ? "bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.05)]"
              : "bg-paper/90 hover:border-black/[0.14] hover:bg-paper dark:hover:border-white/[0.18]"
          }`}
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
            aria-label="Notifications"
            className="absolute right-0 top-[calc(100%+0.4rem)] z-[50] w-[min(100vw-2rem,18.5rem)] origin-top-right overflow-hidden rounded-xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_10px_28px_rgb(var(--ink-rgb)_/_0.1)] motion-safe:animate-[profile-pop_160ms_var(--ease-out-quint)] dark:border-white/[0.12]"
          >
            <div className="border-b border-black/[0.06] px-3 py-2 dark:border-white/[0.08]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/45">
                Inbox
              </p>
            </div>
            <ul className="py-1">
              {DASHBOARD_INBOX.map((message) => {
                const unread = hydrated && !readIds.has(message.id);
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => openMessage(message)}
                      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] focus-visible:bg-ink/[0.04] focus-visible:outline-none"
                    >
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          unread ? "bg-orange" : "bg-transparent"
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[13px] leading-snug tracking-tight text-ink ${
                            unread ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {message.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink/45">
                          {formatPublishedDate(message.publishedAt)}
                          {unread ? " · Unread" : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
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
                className={`${quietFormSurface} relative flex max-h-[min(92dvh,40rem)] w-full max-w-[28rem] flex-col rounded-t-2xl sm:rounded-2xl motion-safe:animate-[feedback-dialog-in_0.32s_var(--ease-out-quint)_both]`}
              >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                  <div className="min-w-0 pr-2">
                    <h2
                      id={headingId}
                      className="font-display text-[1.15rem] font-bold leading-snug tracking-[-0.03em] text-ink text-pretty"
                    >
                      {activeMessage.heading}
                    </h2>
                    <p className="mt-1 text-[12px] font-medium text-ink/45">
                      {formatPublishedDate(activeMessage.publishedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/40 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    <X className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                  <div className="space-y-3.5 font-body text-[13.5px] leading-relaxed tracking-tight text-ink/80 text-pretty">
                    {activeMessage.sections.map((section, i) => {
                      if (section.kind === "lead") {
                        return (
                          <p
                            key={i}
                            className="font-semibold text-ink"
                          >
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

                    <div className="space-y-1 border-t border-black/[0.06] pt-4">
                      <p className="text-ink">{activeMessage.signOff.thanks}</p>
                      <p className="pt-2 text-ink">
                        {activeMessage.signOff.farewell}
                      </p>
                      <p className="font-semibold text-ink">
                        {activeMessage.signOff.name}
                      </p>
                      <p className="text-[12px] text-ink/50">
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
