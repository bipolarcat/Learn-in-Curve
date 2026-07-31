import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiTutorEntitlement } from "@/lib/pmq/queries";
import { canAccessSly, toTier } from "@/lib/pmq/tiers";
import { streamTutorModel } from "@/lib/tutor/callTutorModel";
import { buildSystemPrompt } from "@/lib/tutor/buildSystemPrompt";
import {
  COURSE_COMPLETION_LO,
  FREE_TIER_MESSAGE_CAP,
  TUTOR_CONTEXT_MESSAGE_LIMIT,
} from "@/lib/tutor/constants";
import { loadLoContent } from "@/lib/tutor/loadLoContent";
import { summarizeFairUsage } from "@/lib/tutor/fair-usage";
import {
  countUserMessages,
  fetchTokenUsageRows,
  fetchTutorMessages,
  getEligibleSpacedReview,
  getExamPaceSignal,
  getRecentMistakesForLo,
  getWeakAreasForLo,
  sumTutorCreditGbpCents,
} from "@/lib/tutor/tutor-db";

export const runtime = "nodejs";

function capState(
  hasEntitlement: boolean,
  userMessageCount: number,
  fairUsageExceeded: boolean,
) {
  if (!hasEntitlement && userMessageCount >= FREE_TIER_MESSAGE_CAP) {
    return {
      capReason: "free" as const,
      messagesRemaining: 0,
      locked: true,
    };
  }

  if (hasEntitlement && fairUsageExceeded) {
    return {
      capReason: "fair_usage" as const,
      messagesRemaining: 0,
      locked: true,
    };
  }

  const remaining = hasEntitlement
    ? null
    : Math.max(0, FREE_TIER_MESSAGE_CAP - userMessageCount);

  return {
    capReason: null,
    messagesRemaining: remaining,
    locked: false,
  };
}

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  try {
    const [messages, userMessageCount, entitlement, usageRows, creditGbpCents] =
      await Promise.all([
        fetchTutorMessages(supabase, user.id, courseId),
        countUserMessages(supabase, user.id, courseId),
        getAiTutorEntitlement(supabase, user.id, courseId),
        fetchTokenUsageRows(supabase, user.id, courseId),
        sumTutorCreditGbpCents(supabase, user.id, courseId),
      ]);

    // Sly is AI Pro only — a Pro entitlement must NOT unlock the tutor.
    const hasEntitlement = canAccessSly(toTier(entitlement?.feature));
    const fairUsage = summarizeFairUsage(usageRows, creditGbpCents, {
      hasEntitlement,
    });
    const fairUsageExceeded = hasEntitlement && fairUsage.exceeded;
    const cap = capState(hasEntitlement, userMessageCount, fairUsageExceeded);

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        rating: m.rating,
        createdAt: m.created_at,
      })),
      hasEntitlement,
      fairUsage: hasEntitlement ? fairUsage : null,
      ...cap,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { courseId?: string; loNumber?: number; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { courseId, loNumber, message } = body;
  if (!courseId || !loNumber || !message?.trim()) {
    return NextResponse.json(
      { error: "courseId, loNumber, and message are required" },
      { status: 400 },
    );
  }

  const trimmed = message.trim();
  if (trimmed.length > 4000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  try {
    const [
      userMessageCount,
      entitlement,
      usageRows,
      creditGbpCents,
      weakAreas,
      recentMistakes,
      history,
    ] = await Promise.all([
      countUserMessages(supabase, user.id, courseId),
      getAiTutorEntitlement(supabase, user.id, courseId),
      fetchTokenUsageRows(supabase, user.id, courseId),
      sumTutorCreditGbpCents(supabase, user.id, courseId),
      getWeakAreasForLo(supabase, user.id, courseId, loNumber),
      getRecentMistakesForLo(supabase, user.id, courseId, loNumber),
      fetchTutorMessages(supabase, user.id, courseId),
    ]);

    // LIC-62-adjacent fix (2026-07-28): spacedReview/examPace are topic
    // switches ("by the way, revisit this old mistake" / "here's your exam
    // pace") — injecting them mid-conversation landed one squarely in the
    // middle of a live Socratic quiz exchange in testing, which read as
    // abrupt and confusing. The prompt already said "don't force it if
    // they're clearly mid-thought on something else," but that's a soft
    // instruction and the model doesn't reliably judge conversational
    // timing (same lesson as LIC-61's bold-emphasis fix) — so gate it in
    // code instead. Only consider these signals when the user hasn't sent a
    // message in the last 15 minutes, i.e. this reads as the start of a
    // fresh sitting, not a continuation of something already in progress.
    const lastMessageAt = history.length
      ? new Date(history[history.length - 1].created_at).getTime()
      : null;
    const minutesSinceLastMessage = lastMessageAt
      ? (Date.now() - lastMessageAt) / 60000
      : Infinity;
    const freshSession = minutesSinceLastMessage >= 15;

    const [spacedReview, examPace] = freshSession
      ? await Promise.all([
          getEligibleSpacedReview(supabase, user.id, courseId),
          getExamPaceSignal(supabase, user.id, courseId),
        ])
      : [null, null];

    // Sly is AI Pro only — a Pro entitlement must NOT unlock the tutor.
    const hasEntitlement = canAccessSly(toTier(entitlement?.feature));
    const fairUsage = summarizeFairUsage(usageRows, creditGbpCents, {
      hasEntitlement,
    });
    const fairUsageExceeded = hasEntitlement && fairUsage.exceeded;
    const cap = capState(hasEntitlement, userMessageCount, fairUsageExceeded);

    if (cap.locked) {
      return NextResponse.json(
        {
          error:
            cap.capReason === "free" ? "free_tier_exceeded" : "fair_usage_exceeded",
          capReason: cap.capReason,
          messagesRemaining: 0,
          fairUsage: hasEntitlement ? fairUsage : null,
          locked: true,
        },
        { status: 403 },
      );
    }

    const loObjective = loadLoContent(loNumber)?.lo_code ?? `LO${loNumber}`;
    const systemPrompt = buildSystemPrompt({
      loNumber,
      weakAreas,
      recentMistakes,
      spacedReview,
      examPace,
    });

    const prior = history
      .filter((m) => m.learning_objective !== COURSE_COMPLETION_LO)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const conversationHistory = [
      ...prior,
      { role: "user" as const, content: trimmed },
    ].slice(-TUTOR_CONTEXT_MESSAGE_LIMIT);

    const now = new Date().toISOString();
    const { data: userRow, error: userInsertError } = await supabase
      .from("tutor_messages")
      .insert({
        user_id: user.id,
        course_id: courseId,
        role: "user",
        content: trimmed,
        learning_objective: loObjective,
        created_at: now,
      })
      .select("id, role, content, rating, created_at")
      .single();

    if (userInsertError || !userRow) {
      return NextResponse.json(
        { error: userInsertError?.message ?? "Failed to save message" },
        { status: 500 },
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(sseData(payload)));
        };

        try {
          send({
            type: "user",
            message: {
              id: userRow.id,
              role: userRow.role,
              content: userRow.content,
              rating: userRow.rating,
              createdAt: userRow.created_at,
            },
          });

          let inputTokens = 0;
          let outputTokens = 0;
          let fullContent = "";

          for await (const event of streamTutorModel(
            systemPrompt,
            conversationHistory,
          )) {
            if (event.type === "chunk") {
              send({ type: "chunk", text: event.text });
            } else {
              fullContent = event.result.content;
              inputTokens = event.result.inputTokens;
              outputTokens = event.result.outputTokens;
            }
          }

          const { data: assistantRow, error: assistantInsertError } =
            await supabase
              .from("tutor_messages")
              .insert({
                user_id: user.id,
                course_id: courseId,
                role: "assistant",
                content: fullContent,
                learning_objective: loObjective,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                created_at: new Date().toISOString(),
              })
              .select("id, role, content, rating, created_at")
              .single();

          if (assistantInsertError || !assistantRow) {
            send({
              type: "error",
              error:
                assistantInsertError?.message ?? "Failed to save assistant reply",
            });
            controller.close();
            return;
          }

          const newUserCount = userMessageCount + 1;
          const updatedFairUsage = summarizeFairUsage(
            [
              ...usageRows,
              { input_tokens: inputTokens, output_tokens: outputTokens },
            ],
            creditGbpCents,
            { hasEntitlement },
          );
          const newCap = capState(
            hasEntitlement,
            newUserCount,
            hasEntitlement && updatedFairUsage.exceeded,
          );

          send({
            type: "done",
            reply: {
              id: assistantRow.id,
              role: assistantRow.role,
              content: assistantRow.content,
              rating: assistantRow.rating,
              createdAt: assistantRow.created_at,
            },
            messagesRemaining: newCap.messagesRemaining,
            capReason: newCap.capReason,
            fairUsage: hasEntitlement ? updatedFairUsage : null,
            locked: newCap.locked,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Tutor request failed";
          console.error("tutor chat stream error:", message);
          send({ type: "error", error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tutor request failed";
    console.error("tutor chat error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
