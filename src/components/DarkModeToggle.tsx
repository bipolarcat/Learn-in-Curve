"use client";

import { useEffect, useState } from "react";

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[var(--ease-out-quint)] group-hover:-rotate-12"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[var(--ease-out-quint)] group-hover:rotate-45"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

type DarkModeToggleProps = {
  className?: string;
};

/** Fixed ink/paper hex so theme token inversion doesn’t flip this control. */
const toneLightMode =
  "!bg-[#241A12] !text-[#FBF3E1] !border-[#241A12]/40 hover:!bg-[#3a2e24] hover:!text-[#FBF3E1] hover:!border-[#3a2e24]";
const toneDarkMode =
  "!bg-[#FBF3E1] !text-[#241A12] !border-[#FBF3E1]/55 hover:!bg-[#F4E9D6] hover:!text-[#241A12] hover:!border-[#F4E9D6]";

const defaultLayout =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-[transform,background-color,border-color,color] duration-150 ease-[var(--ease-out-quint)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function DarkModeToggle({ className = defaultLayout }: DarkModeToggleProps) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [spinKey, setSpinKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    setDark(next);
    setSpinKey((k) => k + 1);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const tone = dark ? toneDarkMode : toneLightMode;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group ${className} ${tone}`}
    >
      <span
        key={spinKey}
        className="inline-flex motion-safe:animate-[theme-icon-pop_0.35s_var(--ease-out-expo)_both]"
      >
        {mounted ? (dark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
      </span>
    </button>
  );
}
