"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  headerMenuTrigger,
  headerMenuTriggerOpen,
} from "@/components/header-control";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/SignOutButton";
import { NewBadge } from "@/components/pmq/tier-badge";
import type { AvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import {
  MenuBoardIcon,
  MenuCoursesIcon,
  MenuHomeIcon,
  MenuLicMarkIcon,
  MenuMockMeIcon,
  MenuShelfIcon,
  MenuSignOutIcon,
  MenuTalkIcon,
  MenuThemeIcon,
  menuIconClass,
} from "@/components/SiteHeaderMenuIcons";

export type HeaderAccount = {
  email: string;
  /** Profile first + last name when either is set; otherwise null. */
  name: string | null;
  avatarId: AvatarId;
};

type MenuGlyph = (props: { className?: string }) => ReactNode;

const MENU_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: MenuGlyph;
}> = [
  { href: "/courses", label: "Explore Courses", icon: MenuCoursesIcon },
  { href: "/mock-me", label: "Mock Me", icon: MenuMockMeIcon },
  { href: "/library", label: "The Shelf", icon: MenuShelfIcon },
  { href: "/about", label: "Behind the Curve", icon: MenuLicMarkIcon },
  { href: "/contact", label: "Let's Talk", icon: MenuTalkIcon },
];

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
  newBadgeHrefs,
}: {
  isSignedIn?: boolean;
  account?: HeaderAccount | null;
  showThemeToggle?: boolean;
  newBadgeHrefs: readonly string[];
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
  const onHome = pathname === "/";
  const onDashboard = pathname === "/dashboard";
  const signedIn = isSignedIn && account;
  const title = signedIn
    ? account.name || account.email || "Signed in"
    : null;
  const subtitle =
    signedIn && account.name && account.email ? account.email : null;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      buttonRef.current?.focus();
      return;
    }
    // Touch leaves :hover/:focus stuck on the trigger — clear it on dismiss.
    buttonRef.current?.blur();
  };

  useEffect(() => {
    closeMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on route change
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
      closeMenu(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
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
        className={open ? headerMenuTriggerOpen : headerMenuTrigger}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((wasOpen) => {
            if (wasOpen) {
              queueMicrotask(() => buttonRef.current?.blur());
            }
            return !wasOpen;
          });
        }}
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
                            onDashboard && "text-orange",
                          )}
                          onClick={() => closeMenu(false)}
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
                          onSignOutStart={() => closeMenu(false)}
                          className={cn(
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

                  {!onHome ? (
                    <MenuItemMotion
                      index={itemIndex++}
                      reduceMotion={reduceMotion}
                    >
                      <Link
                        role="menuitem"
                        href="/"
                        className={menuItemClass}
                        onClick={() => closeMenu(false)}
                      >
                        <MenuHomeIcon />
                        Home Page
                      </Link>
                    </MenuItemMotion>
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
                    const Icon = item.icon;
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
                            current && "text-orange",
                          )}
                          onClick={() => {
                            closeMenu(false);
                          }}
                        >
                          <Icon className={menuIconClass} />
                          {item.label}
                          {newBadgeHrefs.includes(item.href) ? (
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
                          <span className="flex items-center gap-2 font-body text-[13px] font-semibold tracking-[-0.01em] text-ink">
                            <MenuThemeIcon />
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
