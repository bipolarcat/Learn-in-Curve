"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDocumentTheme } from "@/lib/theme-routes";

export interface ThemeToggleProps {
  className?: string;
}

/** Fixed Curve ink/paper — must not follow inverted dark tokens. */
const INK = "#241A12";
const PAPER = "#FBF3E1";

/**
 * Header dark-mode switch — wide, low pill (sleeker than h-8 icon chrome).
 * First paint is always the light-mode shell so SSR HTML matches hydration.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const read = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    read();
    setMounted(true);
    window.addEventListener("lic-theme", read);
    return () => window.removeEventListener("lic-theme", read);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    setIsDark(next);
    setDocumentTheme(next);
  };

  // Until mounted, keep the SSR light shell (avoids dark-class FOUC mismatch).
  const dark = mounted && isDark;

  return (
    <button
      type="button"
      className={cn(
        "relative flex h-6 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-[transform,background-color,border-color] duration-150 ease-[var(--ease-out-quint)] motion-safe:active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className,
      )}
      style={{
        backgroundColor: dark ? PAPER : INK,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: dark ? "rgb(251 243 225 / 0.55)" : "rgb(36 26 18 / 0.4)",
      }}
      onClick={toggle}
      aria-pressed={dark}
      aria-label={
        !mounted
          ? "Toggle theme"
          : dark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      suppressHydrationWarning
    >
      <span className="relative flex h-full w-full items-center" aria-hidden>
        <span
          className={cn(
            "absolute flex h-5 w-5 items-center justify-center rounded-full",
            dark ? "left-0" : "right-0",
          )}
        >
          {dark ? (
            <Sun className="h-2.5 w-2.5" style={{ color: INK }} strokeWidth={1.75} />
          ) : (
            <Moon
              className="h-2.5 w-2.5"
              style={{ color: "rgb(251 243 225 / 0.55)" }}
              strokeWidth={1.75}
            />
          )}
        </span>

        <span
          className={cn(
            "absolute flex h-5 w-5 items-center justify-center rounded-full transition-transform duration-200 ease-[var(--ease-out-quint)]",
            dark ? "translate-x-8" : "translate-x-0",
          )}
          style={{ backgroundColor: dark ? INK : PAPER }}
        >
          {dark ? (
            <Moon
              className="h-2.5 w-2.5"
              style={{ color: PAPER }}
              strokeWidth={1.75}
            />
          ) : (
            <Sun
              className="h-2.5 w-2.5"
              style={{ color: INK }}
              strokeWidth={1.75}
            />
          )}
        </span>
      </span>
    </button>
  );
}
