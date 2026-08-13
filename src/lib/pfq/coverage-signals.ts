import { createServiceClient } from "@/lib/supabase/admin";

/** Upsert mock/practice results into coverage signals (most recent wins). */
export async function upsertCoverageSignals(input: {
  userId: string;
  source: "practice" | "mock" | "lesson";
  outcomes: Array<{
    learning_outcome: string;
    correct: boolean;
    question_id: string;
  }>;
}): Promise<void> {
  if (!input.outcomes.length) return;
  const supabase = createServiceClient();
  const updatedAt = new Date().toISOString();
  const rows = input.outcomes.map((o) => ({
    user_id: input.userId,
    learning_outcome: o.learning_outcome,
    correct: o.correct,
    source: input.source,
    question_id: o.question_id,
    updated_at: updatedAt,
  }));
  const { error } = await supabase
    .from("pfq_coverage_signals")
    .upsert(rows, { onConflict: "user_id,learning_outcome" });
  if (error) throw error;
}
