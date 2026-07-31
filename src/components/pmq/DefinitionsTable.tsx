"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { KeyDefinition } from "@/types/pmq";

type DefinitionsTableProps = {
  definitions: KeyDefinition[];
};

const termClass =
  "font-body text-base font-semibold leading-snug tracking-tight text-ink";
const bodyClass =
  "font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";
const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight text-ink/60";

function DefinitionAccordionItem({
  def,
  open,
  onToggle,
}: {
  def: KeyDefinition;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <div className="border-b border-black/[0.08] last:border-b-0 dark:border-white/[0.12]">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full min-h-11 items-center gap-3 py-3.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <span className={`min-w-0 flex-1 ${termClass}`}>{def.term}</span>
          <ChevronDown
            className={`size-4 shrink-0 text-ink/40 transition-transform duration-200 ease-[var(--ease-out-quint)] motion-reduce:transition-none ${
              open ? "rotate-180 text-ink/55" : ""
            }`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        hidden={!open}
        className={open ? "pb-4" : undefined}
      >
        {open ? (
          <div className="grid gap-3 pl-0">
            <div>
              <p className={fieldLabelClass}>Plain English</p>
              <p className={`mt-1 ${bodyClass}`}>{def.plain_english}</p>
            </div>
            <div className="border-t border-black/[0.06] pt-3 dark:border-white/[0.1]">
              <p className={fieldLabelClass}>APM definition</p>
              <p className={`mt-1 ${bodyClass}`}>{def.apm_definition}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MobileDefinitionsAccordion({
  definitions,
}: {
  definitions: KeyDefinition[];
}) {
  /** One open at a time keeps the list tidy on small screens. */
  const [openTerm, setOpenTerm] = useState<string | null>(
    definitions[0]?.term ?? null,
  );

  return (
    <div className="w-full md:hidden" aria-label="Key definitions">
      {definitions.map((def) => (
        <DefinitionAccordionItem
          key={def.term}
          def={def}
          open={openTerm === def.term}
          onToggle={() =>
            setOpenTerm((current) => (current === def.term ? null : def.term))
          }
        />
      ))}
    </div>
  );
}

/**
 * Key definitions — mobile accordion (one open); desktop column table.
 */
export function DefinitionsTable({ definitions }: DefinitionsTableProps) {
  return (
    <>
      <MobileDefinitionsAccordion definitions={definitions} />

      <div className="hidden w-full min-w-0 max-w-full overflow-x-auto md:block">
        <table className="w-full max-w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            Key definitions — term, plain English, and APM wording
          </caption>
          <thead>
            <tr className="border-b border-black/[0.08] dark:border-white/[0.12]">
              <th
                scope="col"
                className="w-[22%] py-2 pr-4 font-body text-[13px] font-semibold tracking-tight text-ink/60"
              >
                Term
              </th>
              <th
                scope="col"
                className="w-[39%] py-2 pr-4 font-body text-[13px] font-semibold tracking-tight text-ink/60"
              >
                Plain English
              </th>
              <th
                scope="col"
                className="w-[39%] py-2 font-body text-[13px] font-semibold tracking-tight text-ink/60"
              >
                APM definition
              </th>
            </tr>
          </thead>
          <tbody>
            {definitions.map((def) => (
              <tr
                key={def.term}
                className="border-b border-black/[0.05] last:border-b-0 dark:border-white/[0.08]"
              >
                <td className={`py-3 pr-4 align-top ${termClass}`}>{def.term}</td>
                <td className={`py-3 pr-4 align-top ${bodyClass}`}>
                  {def.plain_english}
                </td>
                <td className={`py-3 align-top ${bodyClass}`}>
                  {def.apm_definition}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
