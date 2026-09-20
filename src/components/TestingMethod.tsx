import { LabArtPlate } from "@/components/lab/LabArtPlate";
import { ScrollReveal } from "@/components/ScrollReveal";

const STEPS = [
  {
    id: "test",
    step: "01",
    title: "Test, Don’t Reread",
    lead: "Turn learning into retrieval.",
    body: "Instead of repeatedly reading the same material, answer questions that force you to recall what you’ve learned — helping you identify what you actually know and what you don’t.",
    src: "/brand/features/practice.webp",
    alt: "Illustrated practice scene — answering questions instead of re-reading notes.",
    objectPosition: "center 40%",
    tone: "teal" as const,
  },
  {
    id: "weak-spots",
    step: "02",
    title: "Find Your Weak Spots",
    lead: "Your mistakes become your study plan.",
    body: "Every answer helps build a picture of where you’re strongest and where you need more work. Focus your revision on the topics that need it most.",
    src: "/brand/features/misconceptions.webp",
    alt: "Illustrated weak-spots scene — mistakes mapped into a clearer study plan.",
    objectPosition: "center 45%",
    tone: "orange" as const,
  },
  {
    id: "recall",
    step: "03",
    title: "Recall. Repeat. Remember.",
    lead: "Keep testing until it sticks.",
    body: "Revisit questions you got wrong, retest difficult topics, and strengthen your recall over time — so you’re practising retrieval, not just recognising information on a page.",
    src: "/brand/features/memory.webp",
    alt: "Illustrated memory scene — repeating retrieval until the learning sticks.",
    // Asset cropped flush to rabbit + board at 5:4; top bias keeps ears on mobile 4:3 plate.
    objectPosition: "center 35%",
    tone: "cream" as const,
  },
] as const;

/**
 * Illustrated testing method — three active-recall beats with brand art.
 * Home: between hero and PMQ launch proof. Mobile stacked; desktop 3-up.
 */
export function TestingMethod() {
  return (
    <section
      id="home-testing-method"
      aria-labelledby="home-testing-method-heading"
      className="relative overflow-x-clip pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <ScrollReveal className="mx-auto max-w-[40rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            The testing method
          </p>
          <h2
            id="home-testing-method-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Active recall, not re-reading
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Built for busy PMs with an exam date on the calendar — practise
            retrieval so what you study sticks on the day.
          </p>
        </ScrollReveal>

        <ol className="mt-8 grid list-none grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.id}>
              <ScrollReveal delay={0.06 * i} className="h-full">
                <article className="flex h-full flex-col gap-3.5">
                  <LabArtPlate
                    src={step.src}
                    alt={step.alt}
                    objectPosition={step.objectPosition}
                    tone={step.tone}
                    priority={i === 0}
                  />
                  <div className="flex min-w-0 flex-1 flex-col px-0.5">
                    <p
                      className="font-stamp text-[11px] font-bold tracking-[0.08em] text-orange sm:text-[12px]"
                      aria-hidden
                    >
                      {step.step}
                    </p>
                    <h3 className="mt-1 font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[1.3rem]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[14px] font-semibold leading-snug tracking-tight text-ink sm:text-[15px]">
                      {step.lead}
                    </p>
                    <p className="mt-2 text-pretty font-body text-[13.5px] leading-relaxed text-ink/65 sm:text-[14.5px]">
                      {step.body}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
