"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type MethodBeat = {
  id: string;
  step: string;
  title: string;
  lead: string;
  body: string;
};

const BEATS: MethodBeat[] = [
  {
    id: "test",
    step: "01",
    title: "Test, Don’t Reread",
    lead: "Turn learning into retrieval.",
    body: "Instead of repeatedly reading the same material, answer questions that force you to recall what you’ve learned — helping you identify what you actually know and what you don’t.",
  },
  {
    id: "weak-spots",
    step: "02",
    title: "Find Your Weak Spots",
    lead: "Your mistakes become your study plan.",
    body: "Every answer helps build a picture of where you’re strongest and where you need more work. Focus your revision on the topics that need it most.",
  },
  {
    id: "recall",
    step: "03",
    title: "Recall. Repeat. Remember.",
    lead: "Keep testing until it sticks.",
    body: "Revisit questions you got wrong, retest difficult topics, and strengthen your recall over time — so you’re practising retrieval, not just recognising information on a page.",
  },
];

/**
 * Active-recall method section for the lab landing — three beats, one open at a time.
 */
export function LabMethod() {
  const [openId, setOpenId] = useState(BEATS[0].id);
  const reduce = useReducedMotion();

  return (
    <section
      id="lab-method"
      aria-labelledby="lab-method-heading"
      className="relative overflow-x-clip border-t border-ink/[0.06] pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            The testing method
          </p>
          <h2
            id="lab-method-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Active recall, not re-reading
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Built for busy PMs with an exam date on the calendar — practise
            retrieval so what you study sticks on the day.
          </p>
        </div>

        <ul className="mx-auto mt-8 flex max-w-[40rem] flex-col gap-2 sm:mt-10 sm:gap-2.5">
          {BEATS.map((beat) => {
            const open = openId === beat.id;
            const panelId = `lab-method-panel-${beat.id}`;
            const buttonId = `lab-method-tab-${beat.id}`;

            return (
              <li
                key={beat.id}
                className={`rounded-2xl border transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out-quint)] ${
                  open
                    ? "border-ink/18 bg-paper shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.05)]"
                    : "border-ink/10 bg-paper/50 hover:border-ink/16 hover:bg-paper/80"
                }`}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                  onClick={() => setOpenId(beat.id)}
                >
                  <span
                    className="mt-0.5 font-stamp text-[11px] font-bold tracking-[0.08em] text-orange sm:text-[12px]"
                    aria-hidden
                  >
                    {beat.step}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[1.25rem]">
                      {beat.title}
                    </span>
                    {!open ? (
                      <span className="mt-1 block font-body text-[13px] leading-snug text-ink/55 sm:text-[14px]">
                        {beat.lead}
                      </span>
                    ) : null}
                  </span>
                </button>

                {open ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-ink/[0.06] px-4 pb-4 pt-0 sm:px-5 sm:pb-5"
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.28, ease: EASE }}
                  >
                    <p className="pt-3 font-body text-[15px] font-semibold leading-snug tracking-tight text-ink sm:text-[16px]">
                      {beat.lead}
                    </p>
                    <p className="mt-2 text-pretty font-body text-[14px] leading-relaxed text-ink/65 sm:text-[15px]">
                      {beat.body}
                    </p>
                  </motion.div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
