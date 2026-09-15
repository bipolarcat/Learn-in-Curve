import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { DiagramFigure } from "@/components/content/DiagramFigure";
import {
  HoistActivitiesToHeading,
  StudyHeadingChromeProvider,
  StudyHeadingChromeSlot,
  StudyTable,
} from "@/components/pmq/StudyTable";
import { ExamTipList } from "@/components/pmq/ExamTipCallout";
import { InsightsDisclosureList } from "@/components/pmq/InsightsDisclosure";
import { ActivityLauncher } from "@/components/pmq/activities/ActivityLauncher";
import { cn } from "@/lib/utils";

const LEGACY_DIAGRAM_BASE = "/courses/pmq-in-5-days/public/diagrams";

function loNumberFromOutcomeCode(outcomeCode: string): number | null {
  const match = outcomeCode.match(/^\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/** Leading codes like “1a.” / “1b)” / “2.1 —” — strip for display only. */
const LEADING_OUTCOME_CODE =
  /^\s*(?:\d+[a-z]|\d+(?:\.\d+)+)\s*(?:[.):\-–—]|\s+)\s*/i;

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children.trim();
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === "string" ? c : "")).join("").trim();
  }
  return String(children ?? "").trim();
}

function stripLeadingCode(text: string): string {
  const stripped = text.replace(LEADING_OUTCOME_CODE, "").trim();
  return stripped.length > 0 ? stripped : text;
}

function mapHeadingChildren(children: ReactNode): ReactNode {
  if (typeof children === "string") {
    return stripLeadingCode(children);
  }
  if (Array.isArray(children)) {
    let strippedFirst = false;
    return children.map((child) => {
      if (!strippedFirst && typeof child === "string") {
        strippedFirst = true;
        return stripLeadingCode(child);
      }
      return child;
    });
  }
  return children;
}

function LegacyDiagramFigure({
  file,
  caption,
  id,
  loNumber,
}: {
  file: string;
  caption: string;
  id: string;
  loNumber: number | null;
}) {
  const displayCaption = stripLeadingCode(caption);
  const src =
    loNumber !== null
      ? `${LEGACY_DIAGRAM_BASE}/${file}`
      : `${LEGACY_DIAGRAM_BASE}/${file}`;

  return (
    <figure
      key={id}
      className="my-4 w-full max-w-full min-w-0 sm:my-5"
    >
      <div className="flex w-full max-w-full min-w-0 flex-col items-center overflow-hidden rounded-xl border border-black/[0.08] bg-paper px-3 pb-3 pt-3 dark:border-white/[0.12] sm:px-4 sm:pb-3.5 sm:pt-4">
        <Image
          src={src}
          alt={displayCaption}
          width={1200}
          height={800}
          sizes="(max-width: 768px) calc(100vw - 2.5rem), min(1040px, 100vw)"
          className="h-auto w-full max-w-full object-contain"
          loading="lazy"
        />
        <figcaption className="mt-2.5 w-full text-center font-body text-xs italic leading-snug text-pretty text-ink/60">
          {displayCaption}
        </figcaption>
      </div>
    </figure>
  );
}

function renderDiagram(
  d: NonNullable<CoreContentBlockType["diagrams"]>[number],
  loNumber: number | null,
) {
  // v2 diagrams carry `alt` and `figure_number`; file is null → skip entirely
  if (!d.file) return null;

  const isV2 = Boolean(d.alt) && Boolean(d.figure_number);
  if (isV2) {
    return (
      <DiagramFigure
        key={d.id}
        src={`/diagrams/v2/${d.file}`}
        alt={d.alt!}
        caption={stripLeadingCode(d.caption)}
        figureNumber={d.figure_number!}
      />
    );
  }

  return (
    <LegacyDiagramFigure
      key={d.id}
      id={d.id}
      file={d.file}
      caption={d.caption}
      loNumber={loNumber}
    />
  );
}

function diagramsFor(
  diagrams: NonNullable<CoreContentBlockType["diagrams"]>,
  heading: string,
  placement: "after_heading" | "after_section",
) {
  return diagrams.filter(
    (d) => d.placement === placement && d.heading === heading,
  );
}

type CoreContentBlockProps = {
  block: CoreContentBlockType;
  /** Learn: study tables (meanings always visible; Pair up for retrieval). */
  studyTables?: boolean;
  /**
   * Pro recall activities + worked examples. Only pass true when
   * `canAccessRecallActivities(userTier)` is true — Starter must see nothing.
   */
  activities?: boolean;
};

/**
 * Split the body at `##` headings so section-anchored tips can be placed at the
 * end of the section they belong to. Fenced code is skipped so a `#` inside a
 * fence never opens a section.
 */
function splitSections(
  markdown: string,
): { heading: string | null; markdown: string }[] {
  const lines = markdown.split("\n");
  const sections: { heading: string | null; lines: string[] }[] = [];
  let current: { heading: string | null; lines: string[] } = {
    heading: null,
    lines: [],
  };
  let fenced = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const match = fenced ? null : line.match(/^##\s+(.*)$/);
    if (match) {
      if (current.heading !== null || current.lines.some((l) => l.trim())) {
        sections.push(current);
      }
      current = { heading: match[1].trim(), lines: [line] };
      continue;
    }
    current.lines.push(line);
  }
  if (current.heading !== null || current.lines.some((l) => l.trim())) {
    sections.push(current);
  }

  return sections.map((section) => ({
    heading: section.heading,
    markdown: section.lines.join("\n"),
  }));
}

/**
 * Core lesson markdown. Heading levels are demoted (h4/h5) so they nest
 * correctly under Learn’s outcome `h3` titles.
 */
export function CoreContentBlock({
  block,
  studyTables = false,
  activities: activitiesEnabled = false,
}: CoreContentBlockProps) {
  const diagrams = block.diagrams ?? [];
  const examTips = block.exam_tips ?? [];
  const blockActivities = activitiesEnabled ? (block.activities ?? []) : [];
  const blockWorked = activitiesEnabled ? (block.worked_examples ?? []) : [];
  const loNumber = loNumberFromOutcomeCode(block.outcome_code);
  const sections = splitSections(block.body_markdown);
  /** Hoist Pair up / Lineup / Group up onto ##; drop LEVEL column label. */
  const toolbarOnHeading = studyTables || activitiesEnabled;
  /** Insights disclosure instead of exam-tip cards. */
  const insightsDisclosure = true;
  const TipList = insightsDisclosure ? InsightsDisclosureList : ExamTipList;
  const sectionH2Class = insightsDisclosure
    ? "font-body text-[15px] font-semibold tracking-tight text-ink"
    : "font-body text-base font-semibold tracking-tight text-ink";
  const sectionH2SoloClass = insightsDisclosure
    ? "mt-5 mb-2 w-full min-w-0 font-body text-[15px] font-semibold tracking-tight text-ink first:mt-0"
    : "mt-5 mb-2 w-full min-w-0 font-body text-base font-semibold tracking-tight text-ink first:mt-0";

  return (
    <div className="pmq-markdown pmq-markdown--learn-core min-w-0 max-w-full">
      {sections.map((section, index) => {
        const closingDiagrams =
          section.heading === null
            ? []
            : diagramsFor(diagrams, section.heading, "after_section");
        const tips =
          section.heading === null
            ? []
            : examTips.filter(
                (t) =>
                  t.placement === "after_section" &&
                  t.heading === section.heading,
              );

        const sectionActivities =
          section.heading === null
            ? []
            : blockActivities.filter(
                (activity) => activity.heading === section.heading,
              );
        const sectionWorked =
          section.heading === null
            ? []
            : blockWorked.filter(
                (example) => example.heading === section.heading,
              );
        const sectionHasTable = /^\s*\|.+\|/m.test(section.markdown);

        function renderHeading(
          Tag: "h4" | "h5",
          className: string,
          children: ReactNode,
          withChromeSlot: boolean,
        ) {
          const raw = headingText(children);
          const matched = diagramsFor(diagrams, raw, "after_heading");
          const headingTips = examTips.filter(
            (t) => t.placement === "after_heading" && t.heading === raw,
          );

          const tipsFollowHeadingMedia =
            insightsDisclosure &&
            headingTips.length > 0 &&
            matched.length > 0;

          return (
            <div
              className={cn(
                "not-prose min-w-0 max-w-full",
                tipsFollowHeadingMedia && "insights-after-media [&_figure]:!mb-1.5",
              )}
            >
              {withChromeSlot ? (
                <div
                  className={
                    insightsDisclosure
                      ? "mt-5 mb-0.5 min-w-0 first:mt-0"
                      : "mt-5 mb-1 min-w-0 first:mt-0"
                  }
                >
                  <Tag className={`${sectionH2Class} m-0 inline leading-snug`}>
                    {mapHeadingChildren(children)}
                  </Tag>
                  <StudyHeadingChromeSlot />
                </div>
              ) : (
                <Tag className={sectionH2SoloClass}>
                  {mapHeadingChildren(children)}
                </Tag>
              )}
              {matched.map((d) => renderDiagram(d, loNumber))}
              <TipList tips={headingTips} />
            </div>
          );
        }

        const markdownComponents = {
          h2: ({ children }: { children?: ReactNode }) =>
            renderHeading(
              "h4",
              sectionH2SoloClass,
              children,
              toolbarOnHeading,
            ),
          h3: ({ children }: { children?: ReactNode }) =>
            renderHeading(
              "h5",
              "mt-4 mb-1.5 w-full min-w-0 font-body text-[15px] font-semibold tracking-tight text-ink first:mt-0",
              children,
              false,
            ),
          table: ({ children }: { children?: ReactNode }) => {
            if (studyTables) {
              return (
                <StudyTable
                  activities={sectionActivities}
                  workedExamples={sectionWorked}
                  toolbarOnHeading={toolbarOnHeading}
                >
                  {children}
                </StudyTable>
              );
            }
            return (
              <div className="markdown-wide-artifact markdown-table-shell my-3 max-w-full min-w-0">
                <table>{children}</table>
              </div>
            );
          },
          pre: ({ children }: { children?: ReactNode }) => (
            <div className="markdown-wide-artifact my-3 max-w-full min-w-0">
              <pre className="overflow-x-auto">{children}</pre>
            </div>
          ),
        };

        const sectionBody = (
          <>
            {toolbarOnHeading && sectionActivities.length > 0 ? (
              <HoistActivitiesToHeading activities={sectionActivities} />
            ) : null}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {section.markdown}
            </ReactMarkdown>
            {/* Fallback only when heading chrome is off — icons belong on ##. */}
            {!toolbarOnHeading &&
            !sectionHasTable &&
            sectionActivities.length > 0 ? (
              <div className="not-prose mt-2 flex flex-wrap items-center gap-1.5">
                {sectionActivities.slice(0, 2).map((activity) => (
                  <ActivityLauncher key={activity.id} activity={activity} />
                ))}
              </div>
            ) : null}
            {closingDiagrams.length > 0 ? (
              <div className="not-prose min-w-0 max-w-full">
                {closingDiagrams.map((d) => renderDiagram(d, loNumber))}
              </div>
            ) : null}
            <TipList tips={tips} />
          </>
        );

        const tipsFollowMedia =
          insightsDisclosure &&
          tips.length > 0 &&
          (closingDiagrams.length > 0 || sectionHasTable);

        return (
          <div
            key={section.heading ?? `section-${index}`}
            className={cn(
              "mt-8 min-w-0 first:mt-0",
              tipsFollowMedia && "insights-after-media [&_figure]:!mb-1.5",
            )}
          >
            {toolbarOnHeading ? (
              <StudyHeadingChromeProvider>{sectionBody}</StudyHeadingChromeProvider>
            ) : (
              sectionBody
            )}
          </div>
        );
      })}
    </div>
  );
}
