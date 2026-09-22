"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Bell, X } from "lucide-react";
import {
  DASHBOARD_INBOX,
  type InboxMessage,
  type InboxSection,
} from "@/content/dashboard-inbox";
import { Logo } from "@/components/Logo";
import { markWhatsNewSeen } from "@/lib/whats-new/actions";
import { cn } from "@/lib/utils";

const FOX_SRC = "/brand/logo/fox-logo-png.png";
/** Same ease as SiteHeaderMenu panel. */
const blurEase = [0.22, 1, 0.36, 1] as const;

/**
 * Read state lives on the account (`profiles.whats_new_seen_at`), not in
 * localStorage, so it follows the user across devices and browsers. One
 * timestamp means "read everything published up to here", so opening any
 * message clears the whole list.
 */
function publishedMs(message: InboxMessage): number {
  const t = Date.parse(`${message.publishedAt}T00:00:00`);
  return Number.isNaN(t) ? 0 : t;
}

/** Missing or unparseable seenAt is treated as never seen. */
function seenMs(seenAtIso: string | null | undefined): number {
  if (!seenAtIso) return 0;
  const t = Date.parse(seenAtIso);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * A message counts as unread only inside its announcement window. Without this
 * an old release note would greet every new sign-up forever, since a fresh
 * browser has no read state at all.
 */
function withinUnreadWindow(message: InboxMessage): boolean {
  if (!message.unreadUntil) return true;
  const until = Date.parse(`${message.unreadUntil}T00:00:00`);
  if (Number.isNaN(until)) return true;
  return Date.now() < until;
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

function renderSection(section: InboxSection, i: number) {
  if (section.kind === "lead") {
    return (
      <p key={i} className="text-ink/75">
        {section.text}
      </p>
    );
  }
  if (section.kind === "date") {
    return (
      <p key={i} className="text-[12px] text-ink/40">
        {section.text}
      </p>
    );
  }
  if (section.kind === "heading") {
    return (
      <h3
        key={i}
        className="pt-2 font-display text-[0.95rem] font-bold tracking-[-0.02em] text-ink"
      >
        {section.text}
      </h3>
    );
  }
  if (section.kind === "numbered") {
    return (
      <p key={i}>
        <span className="font-medium text-ink">
          {section.number}. {section.title}
          {section.text ? ":" : "."}
        </span>
        {section.text ? (
          <>
            {" "}
            {section.text}
          </>
        ) : null}
      </p>
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
}

type PanelPos = { top: number; left: number; width: number };

export function DashboardInboxBell({
  seenAt,
}: {
  /** `profiles.whats_new_seen_at` for the signed-in user. */
  seenAt: string | null;
}) {
  const listId = useId();
  const headingId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(
    null,
  );
  const [seenAtIso, setSeenAtIso] = useState<string | null>(seenAt);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHydrated(true);
  }, []);

  // Server is the source of truth; pick up a newer value after revalidate.
  useEffect(() => {
    setSeenAtIso(seenAt);
  }, [seenAt]);

  const placePanel = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(20 * 16, window.innerWidth - margin * 2);
    let left = r.right - width;
    left = Math.max(margin, Math.min(left, window.innerWidth - margin - width));
    setPanelPos({
      top: r.bottom + 8,
      left,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!dropdownOpen) return;
    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [dropdownOpen, placePanel]);

  const isUnread = useCallback(
    (message: InboxMessage) =>
      withinUnreadWindow(message) &&
      publishedMs(message) > seenMs(seenAtIso),
    [seenAtIso],
  );

  const unreadCount = hydrated
    ? DASHBOARD_INBOX.filter(isUnread).length
    : 0;
  const hasUnread = unreadCount > 0;

  const markRead = useCallback(() => {
    // Optimistic: clear the badge now, persist in the background. A failed
    // write just means the badge returns on the next load, never a broken UI.
    setSeenAtIso(new Date().toISOString());
    void markWhatsNewSeen();
  }, []);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  const closeModal = useCallback(() => setActiveMessage(null), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      closeDropdown();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !activeMessage) closeDropdown();
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
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
    markRead();
    setDropdownOpen(false);
    setActiveMessage(message);
  }

  const panel =
    dropdownOpen && panelPos ? (
      <motion.div
        key="inbox-panel"
        ref={panelRef}
        id={listId}
        role="menu"
        aria-label="Notifications"
      initial={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 0, scale: 0.94, y: -8 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, y: -6 }
      }
      transition={{
        duration: reduceMotion ? 0.08 : 0.22,
        ease: blurEase,
      }}
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        width: panelPos.width,
        transformOrigin: "top right",
        zIndex: 80,
      }}
      className="overflow-hidden rounded-[1.35rem] border border-ink/[0.06] bg-cream/95 p-2 shadow-[0_8px_30px_rgb(var(--ink-rgb)_/_0.12),0_1px_2px_rgb(var(--ink-rgb)_/_0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-cream/80 dark:border-white/[0.1]"
    >
      <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5 pt-2">
        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
          Notifications
        </h3>
        <button
          type="button"
          aria-label="Close notifications"
          onClick={(e) => {
            e.stopPropagation();
            closeDropdown();
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.06] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        >
          <X className="size-3.5" strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {DASHBOARD_INBOX.map((message) => (
          <NotificationItem
            key={message.id}
            message={message}
            unread={hydrated && isUnread(message)}
            onOpen={() => openMessage(message)}
          />
        ))}
      </div>
    </motion.div>
  ) : null;

  return (
    <>
      <div ref={rootRef} className="relative z-30 shrink-0">
        <button
          ref={triggerRef}
          type="button"
          aria-label={
            hasUnread
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          aria-expanded={dropdownOpen}
          aria-controls={listId}
          aria-haspopup="menu"
          onClick={() => {
            setDropdownOpen((v) => {
              const next = !v;
              if (next) queueMicrotask(placePanel);
              return next;
            });
          }}
          className={cn(
            "relative inline-flex size-8 items-center justify-center rounded-full text-ink/65 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            dropdownOpen && "bg-ink/[0.05] text-ink",
          )}
        >
          <Bell className="size-[1.05rem]" strokeWidth={1.75} aria-hidden />
          {hasUnread ? (
            <span
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-orange"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>{panel}</AnimatePresence>,
            document.body,
          )
        : null}

      {activeMessage && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/40 p-3 backdrop-blur-[2px] motion-safe:animate-[feedback-backdrop-in_0.22s_var(--ease-out-quint)_both] motion-reduce:backdrop-blur-none sm:p-4"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                className="inbox-scroll relative my-auto max-h-full w-full max-w-[26rem] overflow-y-auto overscroll-y-contain rounded-[1.35rem] border border-ink/[0.06] bg-cream shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_12px_32px_rgb(0_0_0_/_0.08)] motion-safe:animate-[feedback-dialog-in_0.32s_var(--ease-out-quint)_both] sm:max-h-[36rem] sm:rounded-[1.5rem]"
              >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink/[0.06] bg-cream/95 px-4 pb-3 pt-4 backdrop-blur-md sm:px-5 sm:pt-5">
                  <div className="flex min-w-0 items-start gap-2.5 pr-1">
                    <Logo
                      size={36}
                      alt=""
                      className="mt-0.5 size-9 shrink-0 object-contain"
                    />
                    <h2
                      id={headingId}
                      className="min-w-0 font-display text-[1.05rem] font-bold leading-snug tracking-[-0.03em] text-ink text-pretty sm:text-[1.15rem]"
                    >
                      {activeMessage.heading}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink/50 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.1] hover:text-ink/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    <X className="size-3.5" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>

                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  <div className="space-y-5 font-body text-[13.5px] leading-relaxed tracking-tight text-ink/75 text-pretty">
                    {activeMessage.sections.map(renderSection)}

                    <div className="space-y-1 pb-1 pt-2">
                      <p>{activeMessage.signOff.thanks}</p>
                      <p className="pt-2">{activeMessage.signOff.farewell}</p>
                      <p>{activeMessage.signOff.name}</p>
                      <p className="flex items-center gap-1.5 text-[12px] text-ink/40">
                        <span>{activeMessage.signOff.role}</span>
                        <Logo size={18} alt="" className="size-[18px] shrink-0 object-contain" />
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
