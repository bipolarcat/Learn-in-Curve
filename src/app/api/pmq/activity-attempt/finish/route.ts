import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import { getPmqTier } from "@/lib/pmq/queries";
import { canAccessRecallActivities } from "@/lib/pmq/tiers";

/**
 * Keepalive / sendBeacon target for abandoning an open attempt when the
 * tab dies. Same auth + Pro gate as the server actions.
 */
export async function POST(request: Request) {
  let body: {
    attemptId?: string;
    outcome?: "completed" | "abandoned";
    moves?: number;
    durationMs?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.attemptId || !body.outcome) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const tier = await getPmqTier(supabase, user.id, PMQ_COURSE_ID);
  if (!canAccessRecallActivities(tier)) {
    return NextResponse.json({ error: "locked" }, { status: 403 });
  }

  const { error } = await supabase.rpc("finish_activity_attempt", {
    p_attempt_id: body.attemptId,
    p_outcome: body.outcome,
    p_moves: body.moves ?? 0,
    p_duration_ms: body.durationMs ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
