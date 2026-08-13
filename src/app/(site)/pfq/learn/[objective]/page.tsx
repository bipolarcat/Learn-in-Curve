import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import {
  PFQ_LESSONS_ENABLED,
  PFQ_LEARN_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { getPfqLesson } from "@/lib/pfq/content";
import { pfqSectionId } from "@/lib/pfq/section-ids";
import { pfqObjectiveDisplayTitle } from "@/lib/pfq/outcome-titles";
import { PfqObjectiveLessonView } from "@/components/pfq/PfqObjectiveLesson";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaSecondary } from "@/components/stamp-chip";

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
    .select("checklist_state, completed_at")
    .eq("user_id", user.id)
    .eq("section_id", sectionId)
    .maybeSingle();

  const checklistState = Array.isArray(progress?.checklist_state)
    ? (progress!.checklist_state as number[])
    : [];
  const completed =
    Boolean(progress?.completed_at) ||
    checklistState.length >= lesson.progress_checkpoint.length;

  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <p className="mb-6">
        <Link href={PFQ_LEARN_HREF} className={stampCtaSecondary}>
          All objectives
        </Link>
      </p>
      <PfqObjectiveLessonView
        lesson={lesson}
        checklistState={checklistState}
        completed={completed}
      />
      <p className="mt-12 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
