const items = [
  "APM PMQ EXAM PREP",
  "INTERACTIVE STUDY MATERIAL",
  "TIMED MOCK EXAMS",
  "CERTIFICATE ON PASS",
];

export function Marquee() {
  const track = [...items, ...items].map((item, i) => (
    <span key={`${item}-${i}`} className="mx-7">
      <span className="text-gold">●</span> {item}
    </span>
  ));

  return (
    <div className="marquee overflow-hidden border-b-2 border-ink bg-ink text-cream py-2.5 whitespace-nowrap" aria-hidden>
      <div className="inline-block motion-safe:animate-marquee-v4 font-body text-[13px] tracking-[0.08em]">
        {track}
        {track}
      </div>
    </div>
  );
}
