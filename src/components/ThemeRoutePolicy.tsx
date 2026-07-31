"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  allowsDarkMode,
  applyDocumentTheme,
  prefersDarkTheme,
} from "@/lib/theme-routes";

/**
 * Enforces light mode everywhere except the dashboard, PMQ overview and LOs.
 * Reapplies a saved/device dark preference when entering an allowed route, and
 * re-asserts `.dark` if React/hydration strips it from <html>.
 */
export function ThemeRoutePolicy() {
  const pathname = usePathname();

  // Before paint on route change — no hydration impact (runs after hydrate).
  useLayoutEffect(() => {
    applyDocumentTheme(pathname);
  }, [pathname]);

  // Observers after mount only — avoid touching <html> mid-hydration.
  useEffect(() => {
    applyDocumentTheme(pathname);

    const root = document.documentElement;

    const sync = () => {
      applyDocumentTheme(pathname);
    };

    const observer = new MutationObserver(() => {
      const wantDark = allowsDarkMode(pathname) && prefersDarkTheme();
      const hasDark = root.classList.contains("dark");
      if (wantDark === hasDark) return;
      root.classList.toggle("dark", wantDark);
      root.style.colorScheme = wantDark ? "only dark" : "only light";
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("lic-theme", sync);
    window.addEventListener("storage", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("lic-theme", sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  return null;
}
