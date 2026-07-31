"use client";

import { useState } from "react";
import { LockedFeature } from "@/components/LockedFeature";
import { AiTutorUpgradeCta } from "@/components/pmq/AiTutorUpgradeCta";
import {
  productActionPrimary,
  productSurfaceQuiet,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";

type CourseReportCardProps = {
  /** All 24 LOs complete (completed_at path). */
  courseComplete: boolean;
  hasProEntitlement: boolean;
  /** True when course_completion_reports row exists (Pro generation done). */
  hasReport: boolean;
  courseId: string;
  tutorPriceCents: number;
  returnPath?: string;
};

/**
 * End-of-course report card (LIC-65) — quiet SaaS console language.
 */
export function CourseReportCard({
  courseComplete,
  hasProEntitlement,
  hasReport,
  courseId,
  tutorPriceCents,
  returnPath,
}: CourseReportCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!courseComplete) return null;

  if (!hasProEntitlement) {
    return (
      <LockedFeature unlocked={false} label="End-of-course report">
        <div className="bg-transparent p-0">
          <h3 className="font-body text-[0.9375rem] font-medium tracking-tight text-ink">
            Your personalised report
          </h3>
          <p className="mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-ink/60 text-pretty">
            Finish unlocks a weak/strong meter for every LO, key takeaways, and
            improvement tips — as a downloadable PDF.
          </p>
          <div className="mt-3.5">
            <AiTutorUpgradeCta
              variant="compact"
              size="sm"
              priceCents={tutorPriceCents}
              returnPath={returnPath}
              buttonLabel="Unlock with Pro"
            />
          </div>
        </div>
      </LockedFeature>
    );
  }

  if (!hasReport) return null;

  async function download() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(
        `/api/tutor/course-report?courseId=${encodeURIComponent(courseId)}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "pmq-end-of-course-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${productSurfaceQuiet} overflow-hidden`}>
      <div className="px-4 py-4 sm:px-5">
        <p className="text-[12px] font-medium tracking-tight text-olive">
          Course complete
        </p>
        <h3 className="mt-1 font-body text-[0.9375rem] font-medium tracking-tight text-ink">
          Download your report
        </h3>
        <p className="mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-ink/60 text-pretty">
          Weak/strong meter for every LO, key takeaways, and tips — scored from
          your quizzes.
        </p>
        <button
          type="button"
          onClick={() => void download()}
          disabled={busy}
          aria-busy={busy}
          className={`${productActionPrimary} mt-3.5 w-full !min-h-10 !rounded-lg !text-[13px] !font-semibold sm:w-fit disabled:cursor-wait disabled:opacity-90`}
        >
          {busy ? (
            <>
              <Spinner variant="bars" size={14} className="text-paper" aria-hidden />
              Preparing…
            </>
          ) : (
            "Download PDF"
          )}
        </button>
        {error ? (
          <p
            className="mt-2 font-body text-[12px] font-medium text-ink/55"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
