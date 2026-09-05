import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import {
  PFQ_COURSE_ID,
  PFQ_LESSONS_ENABLED,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { getPfqLesson } from "@/lib/pfq/content";
import { pfqSectionId } from "@/lib/pfq/section-ids";
import { pfqObjectiveDisplayTitle } from "@/lib/pfq/outcome-titles";
import { PfqObjectiveLessonView } from "@/components/pfq/PfqObjectiveLesson";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  getPfqReachedCountFromProgress,
  getPfqReachedStageIds,
  PFQ_PROGRESS_UNIT_PERCENT,
  type PfqStageSignals,
} from "@/lib/pfq/lesson-stages";

type Props = {
  params: Promise<{ objective: string }>;
};

export async function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({
    objective: String(i + 1),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { objective } = await params;
  const n = Number(objective);
  const lesson = getPfqLesson(n);
  return {
    title: lesson
      ? `LO${n} — ${pfqObjectiveDisplayTitle(n)}`
      : "PFQ Lesson",
    robots: { index: false, follow: false },
  };
}

export default async function PfqLearnObjectivePage({ params }: Props) {
  if (!PFQ_LESSONS_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }

  const { objective: raw } = await params;
  const objective = Number(raw);
  const lesson = getPfqLesson(objective);
  if (!lesson || !Number.isInteger(objective)) {
    notFound();
  }

  await requirePfqProOrRedirect();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }

  const sectionId = pfqSectionId(objective);
  const { data: progress } = await supabase
    .from("section_progress")
    .select(
      "checklist_state, completed_at, orient_reached_at, learn_reached_at, quiz_completed_at",
    )
    .eq("user_id", user.id)
    .eq("section_id", sectionId)
    .maybeSingle();

  const signals = (progress ?? null) as PfqStageSignals | null;
  const checklistState = Array.isArray(progress?.checklist_state)
    ? (progress!.checklist_state as number[])
    : [];
  const completed =
    Boolean(progress?.completed_at) ||
    checklistState.length >= lesson.progress_checkpoint.length;

  const dbReachedStageIds = getPfqReachedStageIds(signals);

  // Course %: sum reached stages across all 10 objectives (optimistic base).
  const sectionIds = Array.from({ length: 10 }, (_, i) => pfqSectionId(i + 1));
  const { data: allProgress } = await supabase
    .from("section_progress")
    .select(
      "section_id, completed_at, orient_reached_at, learn_reached_at, quiz_completed_at",
    )
    .eq("user_id", user.id)
    .eq("course_id", PFQ_COURSE_ID)
    .in("section_id", sectionIds);

  let reachedUnits = 0;
  for (const row of allProgress ?? []) {
    reachedUnits += getPfqReachedCountFromProgress(row as PfqStageSignals);
  }
  // Also count rows that lack course_id but match section ids (legacy).
  if ((allProgress ?? []).length === 0) {
    const { data: legacy } = await supabase
      .from("section_progress")
      .select(
        "section_id, completed_at, orient_reached_at, learn_reached_at, quiz_completed_at",
      )
      .eq("user_id", user.id)
      .in("section_id", sectionIds);
    for (const row of legacy ?? []) {
      reachedUnits += getPfqReachedCountFromProgress(row as PfqStageSignals);
    }
  }

  const completionPercent = Math.min(
    100,
    reachedUnits * PFQ_PROGRESS_UNIT_PERCENT,
  );

  return (
    <div className="min-w-0">
      <PfqObjectiveLessonView
        lesson={lesson}
        checklistState={checklistState}
        completed={completed}
        dbReachedStageIds={dbReachedStageIds}
        completionPercent={completionPercent}
      />
      <p className="mx-auto mt-4 max-w-wrap px-3 pb-10 font-body text-[12px] leading-relaxed text-ink/55 sm:px-5">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
