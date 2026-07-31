import ExpandCards, {
  type ExpandCardImage,
} from "@/components/ui/expand-cards";

const SYLLABUS_SLIDES: ExpandCardImage[] = [
  {
    src: "/Landing page/Learn the full syllabus/1.png",
    alt: "Learn the full syllabus: all 24 APM PMQ learning objectives in short, focused lessons.",
    label: "Learn the full syllabus",
  },
  {
    src: "/Landing page/Learn the full syllabus/2.png",
    alt: "Test yourself as you learn with exam-style quizzes, instant marking and feedback.",
    label: "Test yourself as you learn",
  },
  {
    src: "/Landing page/Learn the full syllabus/3.png",
    alt: "Take realistic timed mock exams that mirror the structure and pressure of the PMQ exam.",
    label: "Take realistic mock exams",
  },
  {
    src: "/Landing page/Learn the full syllabus/4.png",
    alt: "Avoid common exam traps by learning why frequent candidate mistakes are wrong.",
    label: "Avoid common exam traps",
  },
  {
    src: "/Landing page/Learn the full syllabus/5.png",
    alt: "Remember what matters with memory aids, acronyms and quick-recall techniques.",
    label: "Remember what matters",
  },
  {
    src: "/Landing page/Learn the full syllabus/6.png",
    alt: "Watch or listen anywhere with bite-sized video and audio overviews.",
    label: "Watch or listen anywhere",
    badge: "Pro Bundle",
    badgeTone: "pro",
  },
  {
    src: "/Landing page/Learn the full syllabus/7.png",
    alt: "Sly, your AI tutor, with personalised study planning, adaptive learning and an exam-readiness report.",
    label: "Meet Sly, your AI tutor",
    badge: "AI Pro · launching soon",
    badgeTone: "ai-pro",
  },
];

/**
 * Landing-page product contents.
 *
 * The supplied slides contain their own headlines and supporting copy. The
 * section keeps only the short “What’s included” heading requested above the
 * stack; there are no duplicate overlay captions around the artwork.
 */
export function FeatureStack() {
  return (
    <section
      id="home-features"
      aria-labelledby="home-features-title"
      className="relative overflow-x-clip py-[clamp(3rem,7vw,5rem)]"
    >
      <div className="wrap relative z-[1]">
        <h2
          id="home-features-title"
          className="mb-[clamp(0.9rem,2.2vw,1.4rem)] text-center font-body text-[0.9375rem] font-medium leading-snug text-ink/65"
        >
          What&apos;s included
        </h2>
        <ExpandCards images={SYLLABUS_SLIDES} />
      </div>
    </section>
  );
}
