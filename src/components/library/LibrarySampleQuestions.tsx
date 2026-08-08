import Link from "next/link";
import type { LibrarySampleQuestion } from "@/content/library/sample-pool";

function formatDropdownPrompt(prompt: string): string {
  return prompt.replace(/__\(([a-z])\)__/gi, "[($1)]");
}

function SampleCard({ question }: { question: LibrarySampleQuestion }) {
  return (
    <article className="rounded-xl border border-ink/10 bg-paper px-4 py-4 sm:px-5 sm:py-5">
      <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-orange">
        {question.lo_code} · {question.lo_title}
      </p>
      <p className="mt-2 font-body text-[15px] font-medium leading-relaxed text-ink">
        {question.type === "dropdown"
          ? formatDropdownPrompt(question.prompt)
          : question.prompt}
      </p>

      {question.type === "dropdown" ? (
        <div className="mt-3 space-y-2 font-body text-[14px] text-ink/80">
          {Object.entries(question.dropdowns).map(([key, options]) => (
            <div key={key}>
              <p className="m-0 font-semibold text-ink">({key}) options</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {options.map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
              <p className="mt-1 text-olive">
                Correct: {question.correct_answers[key]}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <ol className="mt-3 list-[upper-alpha] space-y-1 pl-5 font-body text-[14px] text-ink/80">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = letter === question.correct_answer;
            return (
              <li
                key={letter}
                className={isCorrect ? "font-semibold text-olive" : undefined}
              >
                {opt}
                {isCorrect ? " (correct)" : ""}
              </li>
            );
          })}
        </ol>
      )}

      {question.explanation ? (
        <p className="mt-3 border-t border-ink/8 pt-3 font-body text-[13.5px] leading-relaxed text-ink/70">
          {question.explanation}
        </p>
      ) : null}
    </article>
  );
}

export function LibrarySampleQuestions({
  questions,
}: {
  questions: LibrarySampleQuestion[];
}) {
  if (questions.length === 0) {
    return (
      <p className="font-body text-[14px] text-ink/55">
        Sample questions for this topic are still being curated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          Sample questions
        </h2>
        <Link
          href="/free-mock-exam"
          className="font-body text-[13px] font-semibold text-orange underline-offset-2 hover:underline"
        >
          Try the free mock →
        </Link>
      </div>
      {questions.map((q) => (
        <SampleCard key={q.id} question={q} />
      ))}
    </div>
  );
}
