"use client";

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Eye, RotateCcw } from "lucide-react";
import type { LoActivity, WorkedExampleCard } from "@/types/pmq";
import { ActivityLauncher } from "@/components/pmq/activities/ActivityLauncher";
import {
  WorkedExampleLauncher,
  workedExampleForRow,
} from "@/components/pmq/activities/WorkedExampleLauncher";
import { cn } from "@/lib/utils";

/**
 * LO2 (for now): Pair up / Test yourself sit on the section ## heading row.
 * Table no longer shows the uppercase first-column label (e.g. LEVEL).
 * Roll out to other LOs by flipping the same flag in CoreContentBlock.
 */
type HeadingChromeState = {
  activities?: LoActivity[];
  recall: boolean;
  onToggle: () => void;
  tableId: string;
} | null;

type HeadingChromeContextValue = {
  chrome: HeadingChromeState;
  setChrome: (next: HeadingChromeState) => void;
  slotMounted: boolean;
  setSlotMounted: (mounted: boolean) => void;
};

const HeadingChromeContext = createContext<HeadingChromeContextValue | null>(
  null,
);

export function StudyHeadingChromeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [chrome, setChromeState] = useState<HeadingChromeState>(null);
  const [slotMounted, setSlotMountedState] = useState(false);
  const setChrome = useCallback((next: HeadingChromeState) => {
    setChromeState(next);
  }, []);
  const setSlotMounted = useCallback((mounted: boolean) => {
    setSlotMountedState(mounted);
  }, []);
  const value = useMemo(
    () => ({ chrome, setChrome, slotMounted, setSlotMounted }),
    [chrome, setChrome, slotMounted, setSlotMounted],
  );
  return (
    <HeadingChromeContext.Provider value={value}>
      {children}
    </HeadingChromeContext.Provider>
  );
}

/** Renders registered table tools on the section heading row (LO2). */
export function StudyHeadingChromeSlot() {
  const ctx = useContext(HeadingChromeContext);
  const setSlotMounted = ctx?.setSlotMounted;
  useEffect(() => {
    if (!setSlotMounted) return;
    setSlotMounted(true);
    return () => setSlotMounted(false);
  }, [setSlotMounted]);

  if (!ctx?.chrome) return null;
  const { activities, recall, onToggle, tableId } = ctx.chrome;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
      <ActivityRowHead activities={activities} />
      <RecallToggle recall={recall} onToggle={onToggle} controls={tableId} />
    </div>
  );
}

/**
 * Study tables for Learn.
 *
 * Design rule, deliberately: nothing is hidden on the first read. Hiding content
 * behind clicks before a learner has seen it adds friction exactly where drop-off
 * is worst. Retrieval practice is opt-in via "Test yourself", which flips a
 * two-column table into recall mode once the learner has read it.
 *
 * Two-column tables (term / meaning) support recall mode. Wider comparison
 * tables are meant to be scanned side by side, so they stay fully visible and
 * only offer column focus.
 *
 * Pro recall activities (pair up / lineup / group up) and worked examples are
 * opt-in icons — Starter never sees them.
 */

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

function rowsFromSection(section: El | undefined): ReactNode[][] {
  if (!section) return [];
  return childArray(section.props.children).map((tr) =>
    childArray(tr.props.children).map((cell) => cell.props.children),
  );
}

type Parsed = { headers: string[]; rows: ReactNode[][] };

function parseMarkdownTable(children: ReactNode): Parsed | null {
  const sections = childArray(children);
  const thead = sections.find((el) => tagName(el) === "thead");
  const tbody = sections.find((el) => tagName(el) === "tbody");
  const headerRows = rowsFromSection(thead);
  const bodyRows = rowsFromSection(tbody);
  const headerCells = headerRows[0];
  if (!headerCells || headerCells.length < 2 || bodyRows.length === 0) {
    return null;
  }
  const headers = headerCells.map((cell) => nodeText(cell).trim());
  const width = headers.length;
  const rows = bodyRows
    .map((row) => {
      const next = [...row];
      while (next.length < width) next.push(null);
      return next.slice(0, width);
    })
    .filter((row) => row.some((cell) => nodeText(cell).trim().length > 0));
  if (rows.length === 0) return null;
  return { headers, rows };
}

type StudyExtras = {
  activities?: LoActivity[];
  workedExamples?: WorkedExampleCard[];
  /** LO2: hoist Pair up / Test yourself onto the ## heading; drop LEVEL label. */
  toolbarOnHeading?: boolean;
};

function ActivityRowHead({ activities }: { activities?: LoActivity[] }) {
  if (!activities?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activities.slice(0, 2).map((activity) => (
        <ActivityLauncher key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

const cardShell =
  "overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.12]";

function RecallToggle({
  recall,
  onToggle,
  controls,
}: {
  recall: boolean;
  onToggle: () => void;
  controls: string;
}) {
  const Icon = recall ? RotateCcw : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={recall}
      aria-controls={controls}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 font-body text-[12px] font-semibold tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50",
        recall
          ? "bg-ink/[0.05] text-orange"
          : "text-ink/60 hover:bg-ink/[0.04] hover:text-ink",
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {recall ? "Show answers" : "Test yourself"}
    </button>
  );
}

/** Term / meaning. Open by default; "Test yourself" turns it into recall practice. */
function TwoColumnTable({
  headers,
  rows,
  activities,
  workedExamples,
  toolbarOnHeading = false,
}: Parsed & StudyExtras) {
  const baseId = useId();
  const tableId = `study-table-${baseId}`;
  const [recall, setRecall] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const headingChrome = useContext(HeadingChromeContext);
  const setChrome = headingChrome?.setChrome;
  const slotMounted = headingChrome?.slotMounted ?? false;

  const toggleRecall = useCallback(() => {
    setRecall((current) => !current);
    setRevealed(new Set());
  }, []);

  const hoistToHeading = toolbarOnHeading && slotMounted && Boolean(setChrome);

  useEffect(() => {
    if (!hoistToHeading || !setChrome) return;
    setChrome({
      activities,
      recall,
      onToggle: toggleRecall,
      tableId,
    });
    return () => setChrome(null);
  }, [hoistToHeading, setChrome, activities, recall, toggleRecall, tableId]);

  function reveal(index: number) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      {!hoistToHeading ? (
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {!toolbarOnHeading ? (
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
                {headers[0]}
              </span>
            ) : null}
            <ActivityRowHead activities={activities} />
          </div>
          <RecallToggle
            recall={recall}
            onToggle={toggleRecall}
            controls={tableId}
          />
        </div>
      ) : null}

      <div id={tableId} className={cardShell}>
        <ul className="m-0 list-none p-0">
          {rows.map((row, index) => {
            const open = !recall || revealed.has(index);
            const label = nodeText(row[0]).trim();
            const worked = workedExampleForRow(workedExamples, label);
            return (
              <li
                key={`${label}-${index}`}
                className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]"
              >
                <div className="flex items-start gap-2 px-3.5 pb-1 pt-2.5">
                  <p className="m-0 min-w-0 flex-1 font-body text-[13.5px] font-semibold leading-[1.5] text-ink">
                    {row[0]}
                  </p>
                  {worked ? <WorkedExampleLauncher example={worked} /> : null}
                </div>

                {open ? (
                  <div className="px-3.5 pb-2.5 pt-0.5">
                    <p className="m-0 font-body text-[13.5px] leading-[1.6] text-ink/85">
                      {row[1]}
                    </p>
                  </div>
                ) : (
                  <div className="px-3.5 pb-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => reveal(index)}
                      className="w-full rounded-lg border border-dashed border-ink/20 px-3 py-1.5 text-left font-body text-[12.5px] font-medium text-ink/45 transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] hover:border-ink/35 hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
                    >
                      Recall it, then tap to check
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {recall ? (
        <p className="mt-1.5 font-body text-[11.5px] font-medium text-ink/45">
          {revealed.size} of {rows.length} checked
        </p>
      ) : null}
    </figure>
  );
}

/** Narrow screens: one column of the comparison at a time. */
function ColumnPickerTable({
  headers,
  rows,
  activities,
  workedExamples,
}: Parsed & StudyExtras) {
  const columnHeaders = headers.slice(1);
  const [focus, setFocus] = useState(0);
  const col = focus + 1;

  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ActivityRowHead activities={activities} />
      </div>
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
      <ul className="m-0 mt-3 list-none divide-y divide-black/[0.08] overflow-hidden rounded-2xl border border-black/[0.08] p-0 dark:divide-white/[0.12] dark:border-white/[0.12]">
        {rows.map((row, index) => {
          const label = nodeText(row[0]).trim() || headers[0];
          const worked = workedExampleForRow(workedExamples, label);
          return (
            <li key={index} className="px-3.5 py-2.5">
              <div className="flex items-start gap-2">
                <p className="m-0 min-w-0 flex-1 font-body text-[11px] font-semibold tracking-tight text-ink/55">
                  {label}
                </p>
                {worked ? <WorkedExampleLauncher example={worked} /> : null}
              </div>
              <p className="mt-1 font-body text-[14px] leading-[1.55] text-ink/90">
                {row[col] ?? ""}
              </p>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** Wide screens: everything stays visible, a column can be brought forward. */
function ColumnFocusTable({
  headers,
  rows,
  activities,
  workedExamples,
}: Parsed & StudyExtras) {
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
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <span>{header || "Aspect"}</span>
                        <ActivityRowHead activities={activities} />
                      </span>
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
                        "flex min-h-8 w-full items-center rounded-lg px-2 text-left font-body text-[12px] font-medium leading-tight tracking-tight transition-colors duration-[220ms] ease-[var(--ease-out-quint)]",
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
            {rows.map((row, rowIndex) => {
              const label = nodeText(row[0]).trim();
              const worked = workedExampleForRow(workedExamples, label);
              return (
                <tr
                  key={rowIndex}
                  className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]"
                >
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th
                        key="label"
                        scope="row"
                        className="px-3 py-2 align-top font-body text-[12.5px] font-semibold leading-[1.5] text-ink"
                      >
                        <span className="inline-flex items-start gap-2">
                          <span className="min-w-0">{cell}</span>
                          {worked ? (
                            <WorkedExampleLauncher example={worked} />
                          ) : null}
                        </span>
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
              );
            })}
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

export function StudyTable({
  children,
  activities,
  workedExamples,
  toolbarOnHeading = false,
}: {
  children: ReactNode;
  activities?: LoActivity[];
  workedExamples?: WorkedExampleCard[];
  /** LO2 only for now — see CoreContentBlock. */
  toolbarOnHeading?: boolean;
}) {
  const parsed = parseMarkdownTable(children);
  const extras: StudyExtras = { activities, workedExamples, toolbarOnHeading };

  if (!parsed) {
    return (
      <div className="markdown-wide-artifact markdown-table-shell my-3 min-w-0 max-w-full">
        <table>{children}</table>
      </div>
    );
  }

  if (parsed.headers.length === 2) {
    return <TwoColumnTable {...parsed} {...extras} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <ColumnPickerTable {...parsed} {...extras} />
      </div>
      <div className="hidden lg:block">
        <ColumnFocusTable {...parsed} {...extras} />
      </div>
    </>
  );
}
