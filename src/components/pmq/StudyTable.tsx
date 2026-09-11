"use client";

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { LoActivity, WorkedExampleCard } from "@/types/pmq";
import { ActivityLauncher } from "@/components/pmq/activities/ActivityLauncher";
import {
  WorkedExampleLauncher,
  workedExampleForRow,
} from "@/components/pmq/activities/WorkedExampleLauncher";
import { cn } from "@/lib/utils";
import styles from "@/components/pmq/StudyTable.module.css";

/**
 * LO2 (for now): Pair up (and other activity launchers) sit on the section ##
 * heading row. Table no longer shows the uppercase first-column label (e.g. LEVEL).
 * Roll out to other LOs by flipping the same flag in CoreContentBlock.
 */
type HeadingChromeState = {
  activities?: LoActivity[];
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
  const { activities } = ctx.chrome;
  if (!activities?.length) return null;
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1">
      <ActivityRowHead activities={activities} compact />
    </div>
  );
}

/**
 * Study tables for Learn.
 *
 * Design rule, deliberately: nothing is hidden on the first read. Hiding content
 * behind clicks before a learner has seen it adds friction exactly where drop-off
 * is worst. Retrieval practice for term/meaning pairs is Pair up (and other Pro
 * recall activities) — not an in-table hide/reveal toggle.
 *
 * Wider comparison tables stay fully visible (horizontal scroll on narrow
 * screens). No column-focus / column-picker chrome.
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
  /** LO2: hoist Pair up onto the ## heading; drop LEVEL label. */
  toolbarOnHeading?: boolean;
};

function ActivityRowHead({
  activities,
  compact = false,
}: {
  activities?: LoActivity[];
  /** Heading chrome — smaller hit box so title + icons share one tight line. */
  compact?: boolean;
}) {
  if (!activities?.length) return null;
  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1">
      {activities.slice(0, 2).map((activity) => (
        <ActivityLauncher
          key={activity.id}
          activity={activity}
          className={compact ? "!size-7" : undefined}
        />
      ))}
    </div>
  );
}

/** LO2: register Pair up / Group up on the ## heading row when the slot is live. */
function useHoistActivitiesToHeading(
  toolbarOnHeading: boolean,
  activities?: LoActivity[],
) {
  const headingChrome = useContext(HeadingChromeContext);
  const setChrome = headingChrome?.setChrome;
  const slotMounted = headingChrome?.slotMounted ?? false;
  const hoistToHeading = toolbarOnHeading && slotMounted && Boolean(setChrome);

  useEffect(() => {
    if (!hoistToHeading || !setChrome) return;
    setChrome({ activities });
    return () => setChrome(null);
  }, [hoistToHeading, setChrome, activities]);

  return hoistToHeading;
}

const cardShell =
  "overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.12]";

/** True two-column study table — header + side-by-side cells (not stacked cards). */
function TwoColumnTable({
  headers,
  rows,
  activities,
  workedExamples,
  toolbarOnHeading = false,
}: Parsed & StudyExtras) {
  const hoistToHeading = useHoistActivitiesToHeading(
    toolbarOnHeading,
    activities,
  );

  return (
    <figure className={cn(styles.figure, "not-prose min-w-0")}>
      {!hoistToHeading && (activities?.length ?? 0) > 0 ? (
        <div className="mb-1.5 flex flex-wrap items-center justify-end gap-2">
          <ActivityRowHead activities={activities} />
        </div>
      ) : null}

      <div className={cardShell}>
        <table
          className={cn(
            styles.table,
            "w-full min-w-0 border-collapse font-body text-[13.5px] leading-[1.5] text-ink [&_p]:m-0",
          )}
        >
          <thead>
            <tr className="border-b border-black/[0.08] dark:border-white/[0.12]">
              <th
                scope="col"
                className="w-[38%] px-3.5 py-2.5 text-left align-top font-semibold tracking-tight"
              >
                {headers[0]}
              </th>
              <th
                scope="col"
                className="px-3.5 py-2.5 text-left align-top font-semibold tracking-tight"
              >
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const label = nodeText(row[0]).trim();
              const worked = workedExampleForRow(workedExamples, label);
              return (
                <tr
                  key={`${label}-${index}`}
                  className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]"
                >
                  <td className="px-3.5 py-2.5 align-top">
                    <div className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 font-semibold leading-[1.5]">
                        {row[0]}
                      </span>
                      {worked ? (
                        <WorkedExampleLauncher example={worked} />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 align-top text-ink/85">
                    {row[1]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Multi-column comparison — every column visible; scroll sideways if needed. */
function MultiColumnTable({
  headers,
  rows,
  activities,
  workedExamples,
  hoistToHeading = false,
}: Parsed & {
  activities?: LoActivity[];
  workedExamples?: WorkedExampleCard[];
  hoistToHeading?: boolean;
}) {
  return (
    <figure className="not-prose m-0 my-4 min-w-0">
      {!hoistToHeading && (activities?.length ?? 0) > 0 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <ActivityRowHead activities={activities} />
        </div>
      ) : null}
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.12]">
        <table className="w-full min-w-[520px] border-collapse text-left font-body">
          <thead>
            <tr className="border-b border-black/[0.08] bg-ink/[0.04] dark:border-white/[0.12]">
              {headers.map((header, index) =>
                index === 0 ? (
                  <th
                    key="row-label"
                    scope="col"
                    className="px-3 py-2.5 align-bottom font-body text-[11px] font-semibold tracking-tight text-ink/60"
                  >
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span>{header || "Aspect"}</span>
                      {!hoistToHeading ? (
                        <ActivityRowHead activities={activities} />
                      ) : null}
                    </span>
                  </th>
                ) : (
                  <th
                    key={`${header}-${index}`}
                    scope="col"
                    className="px-3 py-2.5 align-bottom font-body text-[12px] font-semibold tracking-tight text-ink"
                  >
                    {header}
                  </th>
                ),
              )}
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
                        className="px-3 py-2 align-top font-body text-[12.5px] leading-[1.5] text-ink/85"
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

  return <MultiColumnStudyTables {...parsed} {...extras} />;
}

/** Hoist once — single table for all breakpoints. */
function MultiColumnStudyTables({
  headers,
  rows,
  activities,
  workedExamples,
  toolbarOnHeading = false,
}: Parsed & StudyExtras) {
  const hoistToHeading = useHoistActivitiesToHeading(
    toolbarOnHeading,
    activities,
  );

  return (
    <MultiColumnTable
      headers={headers}
      rows={rows}
      activities={activities}
      workedExamples={workedExamples}
      hoistToHeading={hoistToHeading}
    />
  );
}

