import Link from "next/link";
import { redirect } from "next/navigation";
import { AiTutorUpgradeCta } from "@/components/pmq/AiTutorUpgradeCta";
import { stampCtaSecondary } from "@/components/stamp-chip";
import { DemoBanner } from "@/components/pmq/DemoBanner";
import { LockedFeature } from "@/components/LockedFeature";
import { MockExamSession } from "@/components/pmq/MockExamSession";
import { PmqCourseHeader } from "@/components/pmq/PmqCourseHeader";
import { isDemoSkipAuth } from "@/lib/demo";
import { pmqMockHref } from "@/lib/pmq/constants";
import { parseMockExamSelection } from "@/lib/pmq/mock-domain";
import {
  getActiveExamSession,
  getAiTutorPriceCents,
  getExamSessionAttempts,
  getExamSessionFlags,
  getMockExamConfig,
  getMockExamQuestions,
  getPmqCourse,
  getPmqTier,
  toPublicMockQuestions,
} from "@/lib/pmq/queries";
import { canAccessMockExam, tierForMockExam } from "@/lib/pmq/tiers";
import { PMQ_PRICING_HREF } from "@/lib/pmq/plans";
import { createClient } from "@/lib/supabase/server";

export default async function PmqMockExamPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; exam?: string }>;
}) {
  const params = await searchParams;
  const selection = parseMockExamSelection(params.tier, params.exam);
  if (!selection) redirect(pmqMockHref("lite", 1));
  const { tier, examSet } = selection;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoSkipAuth()) {
    redirect(
      `/auth/sign-in?next=${encodeURIComponent(pmqMockHref(tier, examSet))}`,
    );
  }

  const course = await getPmqCourse(supabase);
  if (!course) redirect("/courses");

  // Gate on the PAPER. `tier === "full"` lumps papers 2, 3 and 4 together, but
  // Pro buys 2-3 and only AI Pro adds 4 — so an entitlement check here would
  // hand paper 4 to every Pro buyer.
  const userTier = await getPmqTier(supabase, user?.id, course.id);
  if (!canAccessMockExam(userTier, examSet)) {
    const requiredTier = tierForMockExam(examSet);
    const needsAiPro = requiredTier === "ai_pro";

    return (
      <>
        <DemoBanner isSignedIn={!!user} />
        <PmqCourseHeader
          courseName={course.name}
          breadcrumb={[{ label: `Mock Exam ${examSet}` }]}
          showProgress={false}
        />
        <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          <LockedFeature
            unlocked={false}
            label={needsAiPro ? "Part of the AI Pro Bundle" : "Included in Pro"}
          >
            <h1 className="font-display text-2xl font-bold">
              {needsAiPro
                ? "Mock Exam 4 arrives with the AI Pro Bundle"
                : "Unlock AI-marked written answers"}
            </h1>
            <p className="my-3 text-sm leading-relaxed text-ink/75">
              {needsAiPro
                ? "Your plan includes Mock Exams 1–3, all marked by AI. Mock Exam 4 comes with the AI Pro Bundle, which isn't on sale yet."
                : "Mock Exam 1 is free and stays free. The Pro Bundle adds Mock Exams 2 and 3, with written answers marked by AI."}
            </p>
            {needsAiPro ? (
              <Link href={PMQ_PRICING_HREF} className={stampCtaSecondary}>
                See plans
              </Link>
            ) : (
              <AiTutorUpgradeCta
                variant="compact"
                priceCents={getAiTutorPriceCents(course)}
                returnPath={pmqMockHref(tier, examSet)}
                buttonLabel="Unlock Pro"
              />
            )}
          </LockedFeature>
        </main>
      </>
    );
  }

  // Full question content is fetched only after the server-side entitlement gate.
  const questions = await getMockExamQuestions(supabase, examSet);
  const mockConfig = getMockExamConfig(course);

  const activeSession = user
    ? await getActiveExamSession(supabase, user.id, tier, examSet)
    : null;
  const [initialAttempts, initialFlags] =
    activeSession && user
      ? await Promise.all([
          getExamSessionAttempts(supabase, activeSession.id),
          getExamSessionFlags(supabase, user.id, activeSession.id),
        ])
      : [[], []];
  const safeInitialAttempts = initialAttempts.map((attempt) => ({
    ...attempt,
    is_correct: null,
    ai_score: null,
    ai_feedback: null,
    ai_rubric_evidence: null,
  }));

  return (
    <MockExamSession
      courseName={course.name}
      examSet={examSet}
      isSignedIn={!!user}
      tier={tier}
      mockConfig={mockConfig}
      questions={toPublicMockQuestions(questions)}
      activeSession={activeSession}
      initialAttempts={safeInitialAttempts}
      initialFlags={initialFlags}
      isDemo={isDemoSkipAuth() && !user}
    />
  );
}
