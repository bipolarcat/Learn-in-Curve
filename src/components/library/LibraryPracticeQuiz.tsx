"use client";

import { useState } from "react";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { stampCtaPrimary } from "@/components/stamp-chip";
import { trackLibraryQuizAnswered } from "@/lib/analytics/events";
import type { LibraryPracticeQuestion } from "@/content/library/types";

type LibraryPracticeQuizProps = {
  slug: string;
  questions: LibraryPracticeQuestion[];
};

type AnswerState = {
  selected: string;
  correct: boolean;
};

/**
 * Click-to-reveal MCQs for Shelf syllabus pages. Answers stay hidden until
 * the learner picks an option; each pick fires library_quiz_answered.
 */
export function LibraryPracticeQuiz({
  slug,
  questions,
}: LibraryPracticeQuizProps) {
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});

  function pick(index: number, key: string, correctKey: string) {
    if (answers[index]) return;
    const correct = key === correctKey;
    setAnswers((prev) => ({ ...prev, [index]: { selected: key, correct } }));
    trackLibraryQuizAnswered({
      slug,
      question_index: index + 1,
      correct,
    });
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const allDone = answeredCount === questions.length;

  return (
    <section
      className="mt-10"
      aria-labelledby="library-practice-heading"
    >
      <h2
        id="library-practice-heading"
        className="m-0 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink"
      >
        Test yourself: three quick questions
      </h2>

      <ol className="mt-5 list-none space-y-6 p-0">
        {questions.map((q, index) => {
          const state = answers[index];
          return (
            <li key={q.prompt} className="m-0">
              <p className="m-0 font-body text-[15.5px] font-semibold leading-snug text-ink">
                <span className="text-ink/45">{index + 1}.</span> {q.prompt}
              </p>
              <div
                className="mt-3 grid gap-2"
                role="group"
                aria-label={`Question ${index + 1} options`}
              >
                {q.options.map((opt) => {
                  const selected = state?.selected === opt.key;
                  const showResult = Boolean(state);
                  const isCorrectOption = opt.key === q.correctKey;
                  let optionClass =
                    "min-h-11 w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-left font-body text-[14.5px] leading-snug text-ink transition-colors";
                  if (!showResult) {
                    optionClass +=
                      " hover:border-orange/45 hover:bg-orange/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55";
                  } else if (isCorrectOption) {
                    optionClass +=
                      " border-teal/50 bg-teal/[0.08] text-ink";
                  } else if (selected) {
                    optionClass +=
                      " border-orange/45 bg-orange/[0.06] text-ink";
                  } else {
                    optionClass += " opacity-55";
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={showResult}
                      aria-pressed={selected}
                      onClick={() => pick(index, opt.key, q.correctKey)}
                      className={optionClass}
                    >
                      <span className="font-semibold text-ink/55">
                        {opt.key})
                      </span>{" "}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {state ? (
                <p
                  className={`mt-2 font-body text-[13.5px] ${
                    state.correct ? "text-teal" : "text-orange"
                  }`}
                  role="status"
                >
                  {state.correct
                    ? "Correct."
                    : `Not quite. The answer is ${q.correctKey}.`}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {allDone ? (
        <div className="mt-6 rounded-xl border border-ink/10 bg-sand/40 px-4 py-4">
          <p className="m-0 font-body text-[14.5px] leading-relaxed text-ink">
            {correctCount === questions.length
              ? "All three right."
              : `You got ${correctCount} of ${questions.length}.`}{" "}
            The written questions are where the PMQ is really won.
          </p>
          <FreeMockExamLink
            className={`${stampCtaPrimary} mt-4 min-h-11 w-full justify-center !normal-case !tracking-[-0.01em] sm:w-auto`}
            label="Try the free PMQ mock"
            location="library_end"
            showArrow
            from="library"
            freeMockCta={{ location: "library_end", slug }}
          />
        </div>
      ) : null}
    </section>
  );
}
