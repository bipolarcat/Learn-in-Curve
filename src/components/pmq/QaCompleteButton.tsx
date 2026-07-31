"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markSectionComplete } from "@/lib/pmq/actions";

type QaCompleteButtonProps = {
  sectionId: string;
  courseId: string;
  loNumber: number;
};

export function QaCompleteButton({
  sectionId,
  courseId,
  loNumber,
}: QaCompleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await markSectionComplete({
            sectionId,
            courseId,
            loNumber,
            forceQa: true,
          });
          router.refresh();
        });
      }}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-rust/50 bg-rust/5 px-4 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-rust transition-[background-color,border-color] duration-150 ease-[var(--ease-out-quint)] hover:border-rust hover:bg-rust/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:opacity-60"
    >
      QA ONLY - mark this LO complete
    </button>
  );
}
