type LoSectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function LoSectionHeading({
  children,
  className = "",
}: LoSectionHeadingProps) {
  return (
    <h2
      className={`font-body text-xl font-bold text-orange tracking-[0.08em] mb-4 block ${className}`}
    >
      {children}
    </h2>
  );
}
