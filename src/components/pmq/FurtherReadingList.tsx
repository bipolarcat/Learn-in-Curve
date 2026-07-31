import type { FurtherReading } from "@/types/pmq";

type FurtherReadingListProps = {
  items: FurtherReading[];
};

export function FurtherReadingList({ items }: FurtherReadingListProps) {
  return (
    <ul className="grid gap-2 list-none">
      {items.map((item) => (
        <li key={item.title} className="text-[14.5px] leading-relaxed">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal underline underline-offset-2 hover:text-teal-deep"
            >
              {item.title}
            </a>
          ) : (
            <span className="text-ink/85">{item.title}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
