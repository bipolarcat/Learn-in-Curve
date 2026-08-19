"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { AvatarImage } from "@/components/AvatarImage";
import {
  headerIcon,
  headerMenuTrigger,
} from "@/components/header-control";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/SignOutButton";
import { NewBadge } from "@/components/pmq/tier-badge";
import type { AvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export type HeaderAccount = {
  email: string;
  /** Profile first + last name when either is set; otherwise null. */
  name: string | null;
  avatarId: AvatarId;
};

const MENU_ITEMS = [
  { href: "/courses", label: "Explore Courses" },
  { href: "/free-mock-exam", label: "Mock Me", badge: "New" },
  { href: "/library", label: "The Shelf", badge: "New" },
  { href: "/about", label: "Behind the Curve" },
  { href: "/contact", label: "Let's Talk" },
] as const;

const menuItemClass =
  "flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 font-body text-[13px] font-semibold tracking-[-0.01em] text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55";

const blurEase = [0.22, 1, 0.36, 1] as const;

/**
 * "Menu" label: blur-in on appear, blur-out-up on hide.
 * Motion values from 21st.dev Blur Out Up (framecn, demo 19317).
 */
function MenuWord({
  visible,
  reduceMotion,
}: {
  visible: boolean;
  reduceMotion: boolean | null;
}) {
  const letters = ["M", "e", "n", "u"] as const;

  if (reduceMotion) {
    return visible ? (
      <span className="pl-0.5 tracking-[-0.01em]">Menu</span>
    ) : null;
  }

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.span
          key="menu-word"
          className="flex overflow-hidden whitespace-nowrap pl-0.5"
          initial={{ maxWidth: 0, opacity: 0 }}
          animate={{ maxWidth: 48, opacity: 1 }}
          exit={{ maxWidth: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: blurEase }}
          aria-hidden
        >
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              className="inline-block tracking-[-0.01em]"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{
                duration: 0.2,
                delay: i * 0.028,
                ease: blurEase,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function MenuBoardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4 shrink-0"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  );
}

function MenuSignOutIcon() {
  const doorMotion =
    "motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-reduce:transition-none";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4 shrink-0 overflow-visible"
    >
      <path
        d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2"
        className={cn(doorMotion, "group-[.is-signing-out]:opacity-0")}
      />
      <path
        d="M12 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="currentColor"
        stroke="currentColor"
        className={cn(
          doorMotion,
          "opacity-0 group-[.is-signing-out]:opacity-100",
        )}
      />
      <g
        className={cn(
          "origin-center motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "motion-safe:group-hover:-translate-x-0.5",
          "motion-safe:group-[.is-signing-out]:-translate-x-[20px]",
        )}
      >
        <path d="M15 12H3M6 9l-3 3 3 3" />
      </g>
    </svg>
  );
}

function MenuItemMotion({
  index,
  reduceMotion,
  children,
}: {
  index: number;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.04 + index * 0.035,
        duration: 0.2,
        ease: blurEase,
      }}
    >
      {children}
    </motion.div>
  );
}

export function SiteHeaderMenu({
  isSignedIn = false,
  account = null,
  showThemeToggle = false,
}: {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
  showThemeToggle?: boolean;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const headingId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });

  const duration = reduceMotion ? 0 : 500;
  const onDashboard = pathname === "/dashboard";
  const signedIn = isSignedIn && account;
  const title = signedIn
    ? account.name || account.email || "Signed in"
    : null;
  const subtitle =
    signedIn && account.name && account.email ? account.email : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const header = btn.closest(".site-header") ?? btn;
      const headerBox = header.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();
      setPanelPos({
        top: headerBox.bottom + 8,
        right: Math.max(12, window.innerWidth - btnBox.right),
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    const onPointer = (event: PointerEvent) => {
      const t = event.target as Node;
      if (wrapRef.current?.contains(t)) return;
      const panel = document.getElementById(menuId);
      if (panel?.contains(t)) return;
      setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, menuId]);

  let itemIndex = 0;

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          headerMenuTrigger,
          open && `${headerIcon} bg-ink text-paper hover:bg-ink hover:text-paper`,
        )}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuToggleIcon open={open} duration={duration} className="size-[18px]" />
        <MenuWord visible={!open} reduceMotion={reduceMotion} />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  id={menuId}
                  role="menu"
                  aria-label={signedIn ? undefined : "Site"}
                  aria-labelledby={signedIn ? headingId : undefined}
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
                    right: panelPos.right,
                    transformOrigin: "top right",
                    zIndex: 70,
                  }}
                  className="min-w-[16rem] max-w-[20rem] rounded-xl border border-black/[0.08] bg-paper/95 p-1 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_12px_32px_rgb(var(--ink-rgb)_/_0.12)] backdrop-blur-xl dark:border-white/[0.12]"
                >
                  {signedIn ? (
                    <>
                      <div
                        id={headingId}
                        className="flex items-center gap-2.5 px-2.5 py-2"
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-black/[0.08] dark:ring-white/[0.12]">
                          <AvatarImage
                            avatarId={account.avatarId}
                            size={36}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-body text-[13px] font-semibold tracking-[-0.01em] text-ink">
                            {title}
                          </span>
                          {subtitle ? (
                            <span className="block truncate font-body text-[11px] font-medium tracking-tight text-ink/55">
                              {subtitle}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <MenuItemMotion
                        index={itemIndex++}
                        reduceMotion={reduceMotion}
                      >
                        <Link
                          role="menuitem"
                          href="/dashboard"
                          aria-current={onDashboard ? "page" : undefined}
                          className={cn(
                            menuItemClass,
                            onDashboard && "bg-ink/[0.06] text-orange",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <MenuBoardIcon />
                          My dashboard
                        </Link>
                      </MenuItemMotion>
                      <MenuItemMotion
                        index={itemIndex++}
                        reduceMotion={reduceMotion}
                      >
                        <SignOutButton
                          role="menuitem"
                          aria-label="Sign out"
                          title="Sign out"
                          className={cn(
                            "group overflow-visible",
                            menuItemClass,
                            "hover:bg-rust/[0.08] hover:text-rust",
                          )}
                        >
                          <MenuSignOutIcon />
                          Sign out
                        </SignOutButton>
                      </MenuItemMotion>
                      <div
                        role="separator"
                        className="my-1 h-px bg-ink/[0.08]"
                      />
                    </>
                  ) : null}

                  {MENU_ITEMS.map((item) => {
                    const current =
                      pathname === item.href ||
                      (item.href === "/library" &&
                        (pathname?.startsWith("/library/") ?? false)) ||
                      (item.href === "/courses" &&
                        (pathname === "/courses" ||
                          pathname === "/courses/"));
                    const i = itemIndex++;
                    return (
                      <MenuItemMotion
                        key={item.href}
                        index={i}
                        reduceMotion={reduceMotion}
                      >
                        <Link
                          role="menuitem"
                          href={item.href}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            menuItemClass,
                            current && "bg-ink/[0.06] text-orange",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                          {"badge" in item && item.badge ? (
                            <NewBadge />
                          ) : null}
                        </Link>
                      </MenuItemMotion>
                    );
                  })}

                  {showThemeToggle ? (
                    <>
                      <div
                        role="separator"
                        className="my-1 h-px bg-ink/[0.08]"
                      />
                      <MenuItemMotion
                        index={itemIndex}
                        reduceMotion={reduceMotion}
                      >
                        <div className="flex min-h-9 items-center justify-between gap-3 px-2.5">
                          <span className="font-body text-[13px] font-semibold tracking-[-0.01em] text-ink">
                            Theme
                          </span>
                          <ThemeToggle />
                        </div>
                      </MenuItemMotion>
                    </>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
