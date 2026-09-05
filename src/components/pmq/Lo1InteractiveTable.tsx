"use client";

import {
  Children,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === "br") return " ";
    return nodeText(node.props.children);
  }
  return "";
}

type El = ReactElement<{ children?: ReactNode; node?: { tagName?: string } }>;

function childArray(node: ReactNode): El[] {
  return Children.toArray(node).filter(isValidElement) as El[];
}

function tagName(el: El): string {
  if (typeof el.type === "string") return el.type;
  return el.props.node?.tagName ?? "";
}

function rowsFromSection(section: El | undefined): string[][] {
  if (!section) return [];
  return childArray(section.props.children).map((tr) =>
    childArray(tr.props.children).map((cell) =>
      nodeText(cell.props.children).trim(),
    ),
  );
}

function parseMarkdownTable(children: ReactNode): {
  headers: string[];
  rows: string[][];
} | null {
  const sections = childArray(children);
  const thead = sections.find((el) => tagName(el) === "thead");
  const tbody = sections.find((el) => tagName(el) === "tbody");
  const headerRows = rowsFromSection(thead);
  const bodyRows = rowsFromSection(tbody);
  const headers = headerRows[0];
  if (!headers || headers.length < 2 || bodyRows.length === 0) return null;
  const width = headers.length;
  const rows = bodyRows
    .map((row) => {
      const next = [...row];
      while (next.length < width) next.push("");
      return next.slice(0, width);
    })
    .filter((row) => row.some((cell) => cell.length > 0));
  if (rows.length === 0) return null;
  return { headers, rows };
}

function RowExpandTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const [openRow, setOpenRow] = useState<number | null>(null);

  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      <div className="overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.12]">
        <div
          className="grid grid-cols-[minmax(0,1fr)_1.25rem] gap-x-3 border-b border-black/[0.08] bg-ink/[0.04] px-3 py-2 font-body text-[11px] font-semibold tracking-tight text-ink/60 dark:border-white/[0.12]"
          role="presentation"
        >
          <span>{headers[0]}</span>
          <span aria-hidden />
        </div>
        <ul className="m-0 list-none p-0">
          {rows.map((row, index) => {
            const open = openRow === index;
            const panelId = `lo1-row-${index}-${row[0]?.slice(0, 24) ?? index}`;
            return (
              <li
                key={`${row[0]}-${index}`}
                className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenRow((current) => (current === index ? null : index))
                  }
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_1.25rem] items-start gap-x-3 px-3 py-2.5 text-left touch-manipulation [-webkit-tap-highlight-color:transparent] transition-colors duration-[220ms] ease-[var(--ease-out-quint)]",
                    open ? "bg-ink/[0.05]" : "[@media(hover:hover)]:hover:bg-ink/[0.04]",
                  )}
                >
                  <span className="font-body text-[13px] font-semibold leading-[1.5] text-ink">
                    {row[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-ink/40 transition-transform duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  id={panelId}
                  hidden={!open}
                  className="border-t border-black/[0.08] bg-ink/[0.03] px-3 py-2.5 dark:border-white/[0.12]"
                >
                  <p className="m-0 font-body text-[11px] font-semibold tracking-tight text-ink/55">
                    {headers[1]}
                  </p>
                  <p className="mt-1 font-body text-[13px] leading-[1.55] text-ink/90">
                    {row[1]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

function ColumnPickerTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const columnHeaders = headers.slice(1);
  const [focus, setFocus] = useState(0);
  const col = focus + 1;

  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-black/[0.08] bg-paper/80 p-1 dark:border-white/[0.12]">
        {columnHeaders.map((header, index) => {
          const selected = focus === index;
          return (
            <button
              key={`${header}-${index}`}
              type="button"
              aria-pressed={selected}
              onClick={() => setFocus(index)}
              className={cn(
                "inline-flex min-h-8 items-center rounded-lg px-2.5 font-body text-[12px] font-medium tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50",
                selected
                  ? "bg-ink/[0.05] text-orange"
                  : "text-ink hover:bg-ink/[0.04] hover:text-ink/80",
              )}
            >
              {header || `Col ${index + 1}`}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 m-0 list-none divide-y divide-black/[0.08] overflow-hidden rounded-2xl border border-black/[0.08] p-0 dark:divide-white/[0.12] dark:border-white/[0.12]">
        {rows.map((row, index) => (
          <li key={`${row[0]}-${index}`} className="px-3.5 py-2.5">
            <p className="m-0 font-body text-[11px] font-semibold tracking-tight text-ink/55">
              {row[0] || headers[0]}
            </p>
            <p className="mt-1 font-body text-[14px] leading-[1.55] text-ink/90">
              {row[col] ?? ""}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function ColumnFocusTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const [focus, setFocus] = useState<number | null>(null);

  const columnTone = (index: number) => {
    if (focus === null) return "";
    return focus === index ? "bg-ink/[0.05]" : "opacity-45";
  };

  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.12]">
        <table className="w-full min-w-[520px] border-collapse text-left font-body">
          <thead>
            <tr className="border-b border-black/[0.08] bg-ink/[0.04] dark:border-white/[0.12]">
              {headers.map((header, index) => {
                if (index === 0) {
                  return (
                    <th
                      key="row-label"
                      scope="col"
                      className="px-3 py-2 align-bottom font-body text-[11px] font-semibold tracking-tight text-ink/60"
                    >
                      {header || "Aspect"}
                    </th>
                  );
                }
                const isFocused = focus === index;
                return (
                  <th
                    key={`${header}-${index}`}
                    scope="col"
                    className={cn(
                      "px-1.5 py-1.5 align-bottom transition-[background-color,opacity] duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                      columnTone(index),
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={isFocused}
                      onClick={() =>
                        setFocus((current) => (current === index ? null : index))
                      }
                      className={cn(
                        "flex w-full min-h-8 items-center rounded-lg px-2 text-left font-body text-[12px] font-medium tracking-tight leading-tight transition-colors duration-[220ms] ease-[var(--ease-out-quint)]",
                        isFocused
                          ? "bg-ink/[0.05] text-orange"
                          : "text-ink hover:bg-ink/[0.04] hover:text-ink/80",
                      )}
                    >
                      {header}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`${row[0]}-${rowIndex}`}
                className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]"
              >
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th
                      key="label"
                      scope="row"
                      className="px-3 py-2 align-top font-body text-[12.5px] font-semibold leading-[1.5] text-ink"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={cn(
                        "px-3 py-2 align-top font-body text-[12.5px] leading-[1.5] text-ink/85 transition-[background-color,opacity] duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                        columnTone(index),
                      )}
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 font-body text-[11.5px] font-semibold text-ink/50">
        {focus === null ? (
          "Select a column heading to focus it."
        ) : (
          <>
            <span className="text-teal">Focus: {headers[focus]}</span>
            {" · "}
            <button
              type="button"
              onClick={() => setFocus(null)}
              className="rounded font-semibold text-ink/50 underline decoration-ink/25 underline-offset-2"
            >
              Show all
            </button>
          </>
        )}
      </p>
    </figure>
  );
}

export function Lo1InteractiveTable({ children }: { children: ReactNode }) {
  const parsed = parseMarkdownTable(children);
  if (!parsed) {
    return (
      <div className="markdown-wide-artifact markdown-table-shell my-3 max-w-full min-w-0">
        <table>{children}</table>
      </div>
    );
  }

  if (parsed.headers.length === 2) {
    return <RowExpandTable headers={parsed.headers} rows={parsed.rows} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <ColumnPickerTable headers={parsed.headers} rows={parsed.rows} />
      </div>
      <div className="hidden lg:block">
        <ColumnFocusTable headers={parsed.headers} rows={parsed.rows} />
      </div>
    </>
  );
}
