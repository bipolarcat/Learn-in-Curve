"use client";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type ResponseVisualState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect"
  | "muted";

const MCQ_STYLES: Record<ResponseVisualState, string> = {
  default:
    "border-ink/15 bg-paper text-ink hover:border-ink/25 hover:bg-ink/[0.03]",
  selected: "border-ink/30 bg-ink/[0.05] text-ink",
  /* Match mock quiz console rail — fill only, no ring/border outline */
  correct: "border-transparent bg-olive/[0.16] text-olive",
  incorrect: "border-transparent bg-orange/[0.14] text-orange",
  muted: "border-ink/10 bg-transparent text-ink/40",
};

const DROPDOWN_STYLES: Record<ResponseVisualState, string> = {
  default: "border-ink/15 bg-paper text-ink hover:border-ink/25",
  selected: "border-ink/25 bg-ink/[0.04] text-ink",
  correct: "border-transparent bg-olive/[0.16] text-olive",
  incorrect: "border-transparent bg-orange/[0.14] text-orange",
  muted: "border-ink/10 bg-paper text-ink/40",
};

export function McqResponseFields({
  options,
  value,
  disabled = false,
  ariaLabel,
  onChange,
  getState,
  compact = false,
}: {
  options: string[];
  value: string;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (letter: string) => void;
  getState?: (letter: string) => ResponseVisualState;
  /** Demo console — 2×2 options on sm+ */
  compact?: boolean;
}) {
  return (
    <div
      className={`grid w-full min-w-0 ${compact ? "gap-2.5 sm:grid-cols-2" : "gap-2"}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const letter = LETTERS[index];
        const selected = value === letter;
        const state = getState?.(letter) ?? (selected ? "selected" : "default");
        return (
          <button
            key={letter}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(letter)}
            className={`w-full min-w-0 rounded-lg border px-3.5 text-left font-body leading-snug transition-[background-color,border-color,color,box-shadow] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-default ${
              compact
                ? "min-h-11 py-2.5 text-[13.5px] sm:min-h-12 sm:text-[14px]"
                : "min-h-11 py-3 text-[14px]"
            } ${MCQ_STYLES[state]}`}
          >
            <span
              className={`mr-2 font-body font-semibold text-current/80 ${
                compact ? "text-[13px]" : "text-[14px]"
              }`}
            >
              {letter})
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function InlineDropdownResponseFields({
  prompt,
  options,
  values,
  disabled = false,
  questionNumber,
  questionTotal,
  onChange,
  getState,
  quiet = false,
}: {
  prompt: string;
  options: Record<string, string[]>;
  values: Record<string, string>;
  disabled?: boolean;
  questionNumber?: number;
  questionTotal?: number;
  onChange: (key: string, value: string) => void;
  getState?: (key: string) => ResponseVisualState;
  /** No filled-selected wash or orange focus ring (mock exam). */
  quiet?: boolean;
}) {
  const parts = prompt.split(/__\(([a-z])\)__/gi);
  return (
    <p className="mb-4 w-full min-w-0 font-body text-[15px] font-medium leading-relaxed text-ink [overflow-wrap:break-word]">
      {questionNumber ? (
        <span className="sr-only">
          Question {questionNumber}
          {questionTotal ? ` of ${questionTotal}` : ""}.{" "}
        </span>
      ) : null}
      {parts.map((part, index) => {
        const keyMatch = part.match(/^([a-z])$/i);
        if (!keyMatch) return <span key={index}>{part}</span>;
        const key = keyMatch[1].toLowerCase();
        const selected = values[key] ?? "";
        const state = quiet
          ? "default"
          : (getState?.(key) ?? (selected ? "selected" : "default"));
        return (
          <select
            key={`${key}-${index}`}
            value={selected}
            disabled={disabled}
            aria-label={`Blank ${key.toUpperCase()}`}
            onChange={(event) => onChange(key, event.target.value)}
            className={`mx-0.5 my-0.5 inline-block h-8 w-[8.75rem] shrink-0 cursor-pointer appearance-auto rounded-md border px-2 py-0 align-baseline font-body text-[13px] font-medium leading-none transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] focus:outline-none focus-visible:outline-none disabled:cursor-default ${
              quiet
                ? "focus:border-ink/25 focus-visible:border-ink/25 focus-visible:ring-0"
                : "focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            } ${DROPDOWN_STYLES[state]}`}
          >
            <option value="" disabled>
              Choose…
            </option>
            {(options[key] ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      })}
    </p>
  );
}
