"use client";

import type { ReactNode } from "react";

type PreviewSignupPinProps = {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compat. */
  rangeId?: string;
};

/**
 * Formerly pinned the preview signup beside a compare column.
 * Preview is now a centered AuthDeskPanel only — this is a thin wrapper
 * retained for any leftover call sites.
 */
export function PreviewSignupPin({
  children,
  className = "",
}: PreviewSignupPinProps) {
  return (
    <aside id="preview-signup" className={className}>
      {children}
    </aside>
  );
}
