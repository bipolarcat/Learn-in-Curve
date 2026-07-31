type LoJumpItem = {
  id: string;
  label: string;
};

type LoStudyJumpNavProps = {
  items: LoJumpItem[];
};

/**
 * Compact in-page jump list so revisers can skip to Definitions / Quiz / etc.
 * without opening every accordion first.
 */
export function LoStudyJumpNav({ items }: LoStudyJumpNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Sections on this learning objective"
      className="mb-8 -mx-1"
    >
      <ul className="flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-lg border-2 border-ink/20 bg-paper px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-teal no-underline transition-colors duration-150 ease-[var(--ease-out-quint)] hover:border-ink hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
