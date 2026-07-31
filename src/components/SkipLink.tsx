export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border-2 focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:font-semibold"
    >
      Skip to content
    </a>
  );
}
