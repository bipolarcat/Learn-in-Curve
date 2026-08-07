"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { stampCtaPrimary, CtaArrow } from "@/components/stamp-chip";
import {
  trackCtaClicked,
  trackQuizDemoCompleted,
  trackQuizDemoQuestionAnswered,
} from "@/lib/analytics/events";

type Question = {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
};

const QUESTIONS: Question[] = [
  {
    q: "Which combination lists three phases that are all part of the project (not extended) life cycle? (1) Adoption of outputs. (2) Benefits realisation. (3) Definition. (4) Deployment. (5) Concept. (6) Post-project review.",
    opts: ["3, 5, 6", "1, 4, 6", "2, 5, 6", "3, 4, 5"],
    correct: 3,
    explain:
      "Concept, Definition and Deployment are all in the project life cycle. Adoption and Benefits Realisation are extended-life-cycle additions; post-project review sits inside Transition.",
  },
  {
    q: "You are PM on a long, complex vehicle manufacturing project where the full set of requirements is still being developed. Which life cycle is NOT suitable?",
    opts: ["Extended", "Linear", "Iterative", "Hybrid"],
    correct: 1,
    explain:
      "Linear assumes scope is fixed upfront. With requirements still evolving, iterative or hybrid is preferable; extended addresses benefits realisation, which is orthogonal to the question.",
  },
  {
    q: "Which statement best describes a strength of the linear life cycle?",
    opts: [
      "Each phase is known and provides a clear framework for the team to follow.",
      "It repeats one or more phases before proceeding to the next.",
      "It allows the PM and team to develop functions of the project as it progresses.",
      "It is beneficial for projects with evolving objectives or solutions.",
    ],
    correct: 0,
    explain:
      "Linear's strength is the clear, known framework. The other options describe iterative or hybrid characteristics.",
  },
];

const FEATURES = [
  "800+ questions across all 24 learning objectives",
  "Instant answer with a real explanation",
  "Exam-format questions matching how APM actually asks",
  "Helps in covering every objective thoroughly",
] as const;

type QuizDemoProps = {
  enrolHref: string;
};

export function QuizDemo({ enrolHref }: QuizDemoProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qi, setQi] = useState(0);
  const [xp, setXp] = useState(0);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    QUESTIONS.map(() => false),
  );
  const [flyXp, setFlyXp] = useState<{ id: number; left: number; top: number } | null>(
    null,
  );
  const completedTracked = useRef(false);

  const q = QUESTIONS[qi];
  const completedCount = completed.filter(Boolean).length;
  const allDone = completedCount === QUESTIONS.length;
  const isLastQuestion = qi === QUESTIONS.length - 1;

  useEffect(() => {
    if (!allDone || completedTracked.current) return;
    completedTracked.current = true;
    trackQuizDemoCompleted({
      correct_count: Math.floor(xp / 10),
      total: QUESTIONS.length,
    });
  }, [allDone, xp]);

  const spawnFlyXP = useCallback((btn: HTMLButtonElement) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = btn.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    setFlyXp({
      id: Date.now(),
      left: rect.right - cardRect.left - 40,
      top: rect.top - cardRect.top,
    });
    setTimeout(() => setFlyXp(null), 1000);
  }, []);

  const handleAnswer = useCallback(
    (i: number, btn: HTMLButtonElement) => {
      if (locked) return;
      setLocked(true);
      setSelected(i);

      setCompleted((prev) => {
        const next = [...prev];
        next[qi] = true;
        return next;
      });

      if (i === q.correct) {
        setXp((prev) => prev + 10);
        setFeedback(`Correct — ${q.explain}`);
        spawnFlyXP(btn);
      } else {
        setFeedback(`Not quite — ${q.explain}`);
      }
      trackQuizDemoQuestionAnswered({
        question_index: qi,
        correct: i === q.correct,
      });
      setShowNext(!isLastQuestion);
    },
    [locked, q, spawnFlyXP, qi, isLastQuestion],
  );

  const handleNext = () => {
    setQi((prev) => prev + 1);
    setLocked(false);
    setSelected(null);
    setFeedback("");
    setShowNext(false);
  };

  return (
    <div className="wrap grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
      <ScrollReveal>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl border border-ink/12 bg-[linear-gradient(to_bottom,rgb(238_246_245),rgb(251_243_225))] shadow-[0_2px_4px_rgba(36,26,18,0.05),0_12px_32px_rgba(36,26,18,0.1)]"
        >
          <div className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div
                className="flex flex-1 gap-1.5"
                aria-label={`Question ${qi + 1} of ${QUESTIONS.length}`}
              >
                {QUESTIONS.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-teal/15"
                  >
                    <div
                      className="h-full rounded-full bg-orange transition-[width] duration-200 ease-[var(--ease-out-quint)]"
                      style={{ width: completed[idx] ? "100%" : "0%" }}
                    />
                  </div>
                ))}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/40 bg-gold/90 px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.06em] text-ink shadow-[1px_1px_0_rgba(36,26,18,0.2)]">
                <span aria-hidden>✦</span>
                {xp} XP
              </span>
            </div>

            <p
              className="mb-5 text-[15px] font-semibold leading-snug text-pretty text-ink sm:text-[16px]"
              id="quiz-question"
            >
              {q.q}
            </p>

            <div
              className="grid gap-2"
              role="group"
              aria-labelledby="quiz-question"
            >
              {q.opts.map((opt, i) => {
                const isCorrect = i === q.correct;
                const isSelected = i === selected;
                let stateClass =
                  "border-teal/20 bg-paper text-ink hover:border-orange/50 hover:bg-orange/[0.06]";
                if (locked) {
                  if (isCorrect)
                    stateClass = "border-olive/50 bg-olive text-paper";
                  else if (isSelected)
                    stateClass =
                      "border-rust/50 bg-rust text-paper motion-safe:animate-shake";
                  else stateClass = "border-ink/10 bg-cream text-ink/45";
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={locked}
                    onClick={(e) => handleAnswer(i, e.currentTarget)}
                    className={`min-h-[44px] rounded-xl border px-3.5 py-3 text-left font-body text-[14px] leading-snug transition-[transform,background-color,border-color,color,opacity] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${stateClass} ${
                      !locked
                        ? "cursor-pointer active:scale-[0.985]"
                        : "cursor-default"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Fixed footprint — feedback + CTA slot pre-reserved so the page does not jump */}
            <div className="mt-4 grid min-h-[9.5rem] grid-rows-[1fr_auto] gap-5 sm:min-h-[8.75rem]">
              <p
                className="max-h-[5.5rem] overflow-y-auto text-[13px] leading-relaxed text-teal-deep/90"
                aria-live="polite"
              >
                {feedback || "\u00a0"}
              </p>
              <div className="flex h-11 items-center sm:h-12">
                {showNext && !allDone ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={stampCtaPrimary}
                  >
                    Next question
                    <CtaArrow />
                  </button>
                ) : null}
                {allDone ? (
                  <Link
                    href={enrolHref}
                    className={stampCtaPrimary}
                    onClick={() =>
                      trackCtaClicked({
                        variant: "enrol",
                        location: "quiz_demo",
                      })
                    }
                  >
                    Enrol to PMQ for free
                    <CtaArrow />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {flyXp ? (
            <span
              key={flyXp.id}
              className="pointer-events-none absolute z-10 font-body text-sm font-bold text-orange motion-safe:animate-fly-up"
              style={{ left: flyXp.left, top: flyXp.top }}
            >
              +10
            </span>
          ) : null}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.06}>
        <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange sm:text-[12px]">
          Practice Questions
        </p>
        <h2 className="mb-4 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-extrabold tracking-[-0.03em] text-balance text-ink">
          Give it a try
        </h2>
        <p className="mb-7 max-w-[42ch] text-[17px] leading-relaxed text-pretty text-ink/80">
          Same format as the real PMQ in 5 days course - pick an answer, see
          why, earn XP.
        </p>
        <ul className="grid max-w-[40ch] gap-3">
          {FEATURES.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[15px] leading-snug text-ink/85"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
}
