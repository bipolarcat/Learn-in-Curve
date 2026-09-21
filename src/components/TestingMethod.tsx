import { LabArtPlate } from "@/components/lab/LabArtPlate";
import { ScrollReveal } from "@/components/ScrollReveal";
import { DrawRandomUnderline } from "@/components/ui/draw-random-underline";
import { cn } from "@/lib/utils";

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
    body: "Recall activities sit throughout the course material, so the moment you learn something you turn around and retrieve it. Get one wrong and you try again, and again, until it is right.",
    src: "/brand/features/memory.webp",
    alt: "Illustrated recall activities — Pair Up, Line Up, Group Up practice.",
    // Full 5:4 art — contain so ears + board aren’t cropped on the 4:3 mobile plate.
    objectPosition: "center",
    objectFit: "contain" as const,
    imageClassName: "scale-[0.75]",
    tone: "cream" as const,
  },
] as const;

type TestingMethodProps = {
  /**
   * Inside `HomeMethodBand`: no outer section/wrap, cream-on-teal type.
   * Standalone keeps the original cream-page treatment.
   */
  embedded?: boolean;
};

/**
 * Illustrated testing method — three active-recall beats with brand art.
 * Home: inside Method band (with practice console). Mobile stacked; desktop 3-up.
 */
export function TestingMethod({ embedded = false }: TestingMethodProps) {
  const content = (
    <>
      <ScrollReveal className="mx-auto max-w-[min(100%,52rem)] text-center xl:max-w-[58rem]">
        <p
          className={cn(
            "mb-1 font-body text-[14px] font-bold tracking-[0.14em] sm:text-[15px]",
            embedded ? "text-[#fbf3e1]/72" : "text-teal",
          )}
        >
          The Method
        </p>
        <h2
          id="home-testing-method-heading"
          className={cn(
            "font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance",
            embedded ? "text-[#fbf3e1]" : "text-ink",
          )}
        >
          You learn it when you{" "}
          <span className="text-orange">recall</span>
          {" "}
          it
        </h2>
        <p
          className={cn(
            "mx-auto mt-3 max-w-[42rem] text-pretty text-center font-body text-[clamp(13.5px,4.2vw,16px)] leading-relaxed sm:max-w-[48rem] sm:text-[18px]",
            embedded ? "text-[#fbf3e1]/80" : "text-ink/65",
          )}
        >
          Psychologists call it{" "}
          <DrawRandomUnderline
            text="“The Testing Effect”"
            textClassName="text-[clamp(13.5px,4.2vw,16px)] sm:text-[18px]"
            stroke={embedded ? "#fbf3e1" : "#0a0806"}
          />
          .
        </p>
        <p
          className={cn(
            "mx-auto mt-2.5 max-w-[42rem] text-pretty font-body text-[15px] leading-relaxed sm:mt-3 sm:max-w-[48rem] sm:text-[16px]",
            embedded ? "text-[#fbf3e1]/72" : "text-ink/65",
          )}
        >
          Every time you retrieve an answer from memory, you strengthen it.
          That is why answering questions beats re-reading notes or
          re-watching videos: it reveals the difference between what you
          actually know and what simply feels familiar.
        </p>
      </ScrollReveal>

      <ol className="mt-8 grid list-none grid-cols-1 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-3 lg:gap-6">
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
                  className={
                    embedded
                      ? "border-white/12 shadow-[0_1px_0_rgb(255_255_255_/_0.08),0_18px_36px_-16px_rgb(0_0_0_/_0.45)]"
                      : undefined
                  }
                />
                <div className="flex min-w-0 w-full flex-1 flex-col">
                  <p
                    className="font-body text-[11px] font-bold tabular-nums tracking-[0.1em] text-orange sm:text-[12px]"
                    aria-hidden
                  >
                    {step.step}
                  </p>
                  <h3
                    className={cn(
                      "mt-1 font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.3rem]",
                      embedded ? "text-[#fbf3e1]" : "text-ink",
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1.5 font-body text-[14px] font-semibold leading-snug tracking-tight sm:text-[15px]",
                      embedded ? "text-[#fbf3e1]/92" : "text-ink",
                    )}
                  >
                    {step.lead}
                  </p>
                  <p
                    className={cn(
                      "mt-2 w-full text-pretty font-body text-[13.5px] leading-relaxed sm:text-[14.5px]",
                      embedded ? "text-[#fbf3e1]/70" : "text-ink/65",
                    )}
                  >
                    {step.body}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </>
  );

  if (embedded) {
    return (
      <div
        id="home-testing-method"
        aria-labelledby="home-testing-method-heading"
      >
        {content}
      </div>
    );
  }

  return (
    <section
      id="home-testing-method"
      aria-labelledby="home-testing-method-heading"
      className="relative overflow-x-clip pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">{content}</div>
    </section>
  );
}
