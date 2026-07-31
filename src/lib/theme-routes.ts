/** Routes where users may opt into dark mode. Every other page is light-only. */
export function allowsDarkMode(pathname: string): boolean {
  return (
    /^\/dashboard\/?$/.test(pathname) ||
    /^\/courses\/pmq-in-5-days\/?$/.test(pathname) ||
    /^\/courses\/pmq-in-5-days\/lo\/[^/]+\/?$/.test(pathname)
  );
}

/** Read saved preference (or system) — only meaningful on dark-capable routes. */
export function prefersDarkTheme(): boolean {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Apply or clear `.dark` on <html>, matching route policy + preference. */
export function applyDocumentTheme(pathname: string): boolean {
  const root = document.documentElement;
  const allow = allowsDarkMode(pathname);
  const dark = allow && prefersDarkTheme();
  root.classList.toggle("dark", dark);
  // `only` blocks Chrome/Edge auto-dark remapping when OS prefers dark
  root.style.colorScheme = dark ? "only dark" : "only light";
  return dark;
}

/** Persist + apply an explicit user choice (allowed routes only). */
export function setDocumentTheme(nextDark: boolean): void {
  try {
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  } catch {
    /* ignore quota / private mode */
  }
  const root = document.documentElement;
  root.classList.toggle("dark", nextDark);
  root.style.colorScheme = nextDark ? "only dark" : "only light";
  window.dispatchEvent(
    new CustomEvent("lic-theme", { detail: { dark: nextDark } }),
  );
}
