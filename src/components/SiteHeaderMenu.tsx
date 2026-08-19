"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { headerIcon } from "@/components/header-control";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/free-mock-exam", label: "Free PMQ mock exam" },
  { href: "/library", label: "Library" },
  { href: "/contact", label: "Get in Touch" },
] as const;

export function SiteHeaderMenu() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });

  const duration = reduceMotion ? 0 : 500;

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
      const r = btn.getBoundingClientRect();
      setPanelPos({
        top: r.bottom + 8,
        right: Math.max(12, window.innerWidth - r.right),
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

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          headerIcon,
          open &&
            "border-ink bg-ink text-paper hover:border-ink hover:bg-ink hover:text-paper",
        )}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuToggleIcon open={open} duration={duration} className="size-[18px]" />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  id={menuId}
                  role="menu"
                  aria-label="Site"
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
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    position: "fixed",
                    top: panelPos.top,
                    right: panelPos.right,
                    transformOrigin: "top right",
                    zIndex: 70,
                  }}
                  className="min-w-[13.5rem] rounded-xl border border-black/[0.08] bg-paper/95 p-1 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_12px_32px_rgb(var(--ink-rgb)_/_0.12)] backdrop-blur-xl dark:border-white/[0.12]"
                >
                  {MENU_ITEMS.map((item, i) => {
                    const current =
                      pathname === item.href ||
                      (item.href === "/library" &&
                        (pathname?.startsWith("/library/") ?? false));
                    return (
                      <motion.div
                        key={item.href}
                        initial={
                          reduceMotion ? false : { opacity: 0, x: 8 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : 0.04 + i * 0.035,
                          duration: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          role="menuitem"
                          href={item.href}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "flex min-h-9 items-center rounded-lg px-2.5 font-body text-[13px] font-semibold tracking-[-0.01em] text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                            current && "bg-ink/[0.06] text-orange",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
