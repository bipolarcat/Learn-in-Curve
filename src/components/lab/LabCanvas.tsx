/**
 * Blank stage for homepage / marketing spikes.
 * Inherits the live site shell (header, footer) and body cream + dot grid.
 * Mount experiment components inside — never edit the live home route here.
 */
export function LabCanvas({ children }: { children?: React.ReactNode }) {
  const empty = children == null;

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-3 top-3 z-50 sm:left-4 sm:top-4">
        <span className="font-stamp text-[10px] font-bold uppercase tracking-[0.18em] text-teal/80">
          Lab · not indexed
        </span>
      </div>

      {empty ? (
        <div className="flex min-h-[min(70vh,36rem)] flex-col items-center justify-center px-6 py-16 text-center">
          <p className="mb-2 font-stamp text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
            Blank canvas
          </p>
          <p className="max-w-[36ch] font-body text-[15px] leading-relaxed text-ink/70">
            Same header, footer, and dotted cream as the homepage. Drop a
            component into{" "}
            <code className="font-stamp text-[12px] text-ink">
              src/app/(site)/lab/page.tsx
            </code>
            . Live{" "}
            <code className="font-stamp text-[12px] text-ink">/</code> stays
            untouched.
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
