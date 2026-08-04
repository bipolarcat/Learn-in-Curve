"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";
import {
  allowsDarkMode,
  applyDocumentTheme,
  readThemeCookie,
} from "@/lib/theme-routes";

/**
 * Enforces light everywhere except the dashboard and individual LOs.
 *
 * The blocking script in <head> already resolves the theme for the initial
 * load; this handles client-side navigation (where that script never re-runs)
 * and re-asserts `.dark` if anything strips it from <html>.
 */
export function ThemeRoutePolicy() {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let identifiedUserId: string | null = null;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        posthog.reset();
        identifiedUserId = null;
        return;
      }

      if (!session?.user || (event !== "INITIAL_SESSION" && event !== "SIGNED_IN")) {
        return;
      }

      if (identifiedUserId && identifiedUserId !== session.user.id) {
        posthog.reset();
      }
      posthog.identify(session.user.id, {
        email: session.user.email,
      });
      identifiedUserId = session.user.id;
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const wantDark =
        allowsDarkMode(pathname) && readThemeCookie() === "dark";
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
