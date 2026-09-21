import { LabArtPlate } from "@/components/lab/LabArtPlate";
import { ScrollReveal } from "@/components/ScrollReveal";
import { DrawRandomUnderline } from "@/components/ui/draw-random-underline";

const STEPS = [
  {
    id: "test",
    step: "01",
    title: "Practice Questions",
    lead: "Every learning objective, covered.",
    body: "Over 1,000 questions mapped to the syllabus. Practise by topic, test your recall, reveal answers when you need them, and keep going until what you’ve learned sticks.",
    src: "/brand/features/practice.webp",
    alt: "Illustrated practice scene — answering syllabus-mapped questions.",
    objectPosition: "center 40%",
    objectFit: "cover" as const,
    imageClassName: "",
    tone: "teal" as const,
  },
  {
    id: "weak-spots",
    step: "02",
    title: "Mock Exams",
    lead: "Put your knowledge to the test.",
    body: "Full-length mock exams built around the real question types, marking approach and time pressure. Practise under exam conditions and find out where you stand before exam day.",
    src: "/brand/features/misconceptions.webp",
    alt: "Illustrated mock-exam scene — practising under exam conditions.",
    objectPosition: "center 45%",
    objectFit: "cover" as const,
    imageClassName: "",
    tone: "orange" as const,
  },
  {
    id: "recall",
    step: "03",
    title: "Recall Activities",
    lead: "Pair Up. Line Up. Group Up.",
    body: "Recall activities sit throughout the course material, so the moment you learn something you turn around and retrieve it. Get one wrong and you try again, and again, until it is right. That is the loop that moves knowledge into memory.",
    src: "/brand/features/memory.webp",
    alt: "Illustrated recall activities — Pair Up, Line Up, Group Up practice.",
    // Full 5:4 art — contain so ears + board aren’t cropped on the 4:3 mobile plate.
    objectPosition: "center",
    objectFit: "contain" as const,
    imageClassName: "scale-[0.75]",
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
        <ScrollReveal className="mx-auto max-w-[min(100%,52rem)] text-center xl:max-w-[58rem]">
          <p className="mb-1 font-body text-[14px] font-bold tracking-[0.14em] text-teal sm:text-[15px]">
            The Method
          </p>
          <h2
            id="home-testing-method-heading"
            className="font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            You learn it when you{" "}
            <span className="text-orange">recall</span> it
          </h2>
          <p className="mx-auto mt-3 max-w-[42rem] text-pretty text-center font-body text-[clamp(13.5px,4.2vw,16px)] leading-relaxed text-ink/65 sm:max-w-[48rem] sm:text-[18px]">
            Psychologists call it{" "}
            <DrawRandomUnderline
              text="“The Testing Effect”"
              textClassName="text-[clamp(13.5px,4.2vw,16px)] sm:text-[18px]"
            />
            .
          </p>
          <p className="mx-auto mt-2.5 max-w-[42rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:mt-3 sm:max-w-[48rem] sm:text-[16px]">
            Every time you retrieve an answer from memory, you strengthen it.
            That is why answering questions beats re-reading notes or
            re-watching videos: it reveals the difference between what you
            actually know and what simply feels familiar.
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
                    objectFit={step.objectFit}
                    imageClassName={step.imageClassName}
                    tone={step.tone}
                    priority={i === 0}
                  />
                  <div className="flex min-w-0 flex-1 flex-col px-0.5">
                    <p
                      className="font-body text-[11px] font-bold tabular-nums tracking-[0.1em] text-orange sm:text-[12px]"
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
