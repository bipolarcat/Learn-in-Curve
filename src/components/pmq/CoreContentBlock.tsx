import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { DiagramFigure } from "@/components/content/DiagramFigure";

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

function diagramsAfterHeading(
  diagrams: NonNullable<CoreContentBlockType["diagrams"]>,
  heading: string,
) {
  return diagrams.filter(
    (d) => d.placement === "after_heading" && d.heading === heading,
  );
}

type CoreContentBlockProps = {
  block: CoreContentBlockType;
};

/**
 * Core lesson markdown. Heading levels are demoted (h4/h5) so they nest
 * correctly under Learn’s outcome `h3` titles.
 */
export function CoreContentBlock({ block }: CoreContentBlockProps) {
  const diagrams = block.diagrams ?? [];
  const loNumber = loNumberFromOutcomeCode(block.outcome_code);

  function renderHeading(
    Tag: "h4" | "h5",
    className: string,
    children: ReactNode,
  ) {
    const raw = headingText(children);
    const matched = diagramsAfterHeading(diagrams, raw);

    return (
      <div className="not-prose min-w-0 max-w-full">
        <Tag className={className}>{mapHeadingChildren(children)}</Tag>
        {matched.map((d) => renderDiagram(d, loNumber))}
      </div>
    );
  }

  return (
    <div className="pmq-markdown pmq-markdown--learn-core min-w-0 max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) =>
            renderHeading(
              "h4",
              "mt-5 mb-2 w-full min-w-0 font-body text-base font-semibold tracking-tight text-balance text-ink first:mt-0",
              children,
            ),
          h3: ({ children }) =>
            renderHeading(
              "h5",
              "mt-4 mb-1.5 w-full min-w-0 font-body text-[15px] font-semibold tracking-tight text-balance text-ink first:mt-0",
              children,
            ),
          table: ({ children }) => (
            <div className="markdown-wide-artifact markdown-table-shell my-3 max-w-full min-w-0">
              <table>{children}</table>
            </div>
          ),
          pre: ({ children }) => (
            <div className="markdown-wide-artifact my-3 max-w-full min-w-0">
              <pre className="overflow-x-auto">{children}</pre>
            </div>
          ),
        }}
      >
        {block.body_markdown}
      </ReactMarkdown>
    </div>
  );
}
