import type { ReactNode } from "react";

type LockedFeatureProps = {
  unlocked: boolean;
  children: ReactNode;
  /** Optional label under the lock icon. Defaults to "Locked feature". */
  label?: string;
};

/**
 * Shared locked-state shell (LIC-53 / AI_TUTOR_BACKEND_SPEC §11).
 * When locked: dashed border, lock icon, reduced opacity — children stay
 * visible inside so CTAs and copy can still render.
 */
export function LockedFeature({
  unlocked,
  children,
  label = "Locked feature",
}: LockedFeatureProps) {
  if (unlocked) return <>{children}</>;

  return (
    <div
      className="rounded-xl border-[2.5px] border-ink/35 border-dashed bg-paper/60 p-6 opacity-70"
      aria-disabled
    >
      <div className="mb-4 flex items-center gap-3 font-body text-xs font-bold uppercase tracking-wider text-ink/60">
        <span aria-hidden>🔒</span>
        {label}
      </div>
      {children}
    </div>
  );
}
