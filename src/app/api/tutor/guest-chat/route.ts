import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { streamTutorModel } from "@/lib/tutor/callTutorModel";
import { buildSystemPrompt } from "@/lib/tutor/buildSystemPrompt";
import {
  GUEST_CONTEXT_MESSAGE_LIMIT,
  GUEST_MESSAGE_MAX_LENGTH,
  GUEST_TIER_MESSAGE_CAP,
} from "@/lib/tutor/constants";
import {
  claimGuestTutorMessage,
  getGuestTutorUsage,
  hashGuestIp,
  isGuestTutorEnabled,
  recordGuestTutorSpend,
  resolveClientIp,
} from "@/lib/tutor/guest-usage";
import { estimateTokenCostUsd, usdToGbpCents } from "@/lib/tutor/fair-usage";
import { sendGuestBudgetAlertEmail } from "@/lib/tutor/guest-budget-alert";

export const runtime = "nodejs";

type HistoryTurn = { role: "user" | "assistant"; content: string };

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      out.push({ role, content: content.trim().slice(0, GUEST_MESSAGE_MAX_LENGTH) });
    }
  }
  return out.slice(-(GUEST_CONTEXT_MESSAGE_LIMIT - 1));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.json(
      { error: "Signed-in users should use /api/tutor/chat" },
      { status: 400 },
    );
  }

  try {
    const admin = createServiceClient();
    const ipHash = hashGuestIp(resolveClientIp(request));
    const [usage, enabled] = await Promise.all([
      getGuestTutorUsage(admin, ipHash, GUEST_TIER_MESSAGE_CAP),
      isGuestTutorEnabled(admin),
    ]);
    return NextResponse.json({
      messagesRemaining: usage.messagesRemaining,
      locked: usage.locked || usage.messagesRemaining === 0,
      cap: GUEST_TIER_MESSAGE_CAP,
      enabled,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load guest usage";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.json(
      { error: "Signed-in users should use /api/tutor/chat" },
      { status: 400 },
    );
  }

  let body: { message?: string; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trimmed = body.message?.trim() ?? "";
  if (!trimmed) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (trimmed.length > GUEST_MESSAGE_MAX_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Service unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const enabled = await isGuestTutorEnabled(admin);
  if (!enabled) {
    return NextResponse.json(
      {
        error: "guest_trial_unavailable",
        messagesRemaining: 0,
        locked: true,
        cap: GUEST_TIER_MESSAGE_CAP,
      },
      { status: 503 },
    );
  }

  const ipHash = hashGuestIp(resolveClientIp(request));

  let claim;
  try {
    claim = await claimGuestTutorMessage(
      admin,
      ipHash,
      GUEST_TIER_MESSAGE_CAP,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to claim guest message";
    console.error("guest tutor claim error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!claim.allowed) {
    return NextResponse.json(
      {
        error: "guest_cap_exceeded",
        messagesRemaining: 0,
        locked: true,
        cap: GUEST_TIER_MESSAGE_CAP,
      },
      { status: 403 },
    );
  }

  const prior = sanitizeHistory(body.history);
  const conversationHistory = [
    ...prior,
    { role: "user" as const, content: trimmed },
  ].slice(-GUEST_CONTEXT_MESSAGE_LIMIT);

  const systemPrompt = buildSystemPrompt({
    mode: "guest",
    loNumber: 1,
    weakAreas: [],
  });

  const now = new Date().toISOString();
  const userMessageId = `guest-user-${claim.messageCount}`;
  const assistantMessageId = `guest-assistant-${claim.messageCount}`;

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
            id: userMessageId,
            role: "user",
            content: trimmed,
            rating: null,
            createdAt: now,
          },
        });

        let fullContent = "";
        let inputTokens = 0;
        let outputTokens = 0;

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

        send({
          type: "done",
          reply: {
            id: assistantMessageId,
            role: "assistant",
            content: fullContent,
            rating: null,
            createdAt: new Date().toISOString(),
          },
          messagesRemaining: claim.messagesRemaining,
          locked: claim.messagesRemaining === 0,
          cap: GUEST_TIER_MESSAGE_CAP,
        });

        // Global £-cap guardrail: record real Gemini spend for this reply
        // and alert exactly once if it just pushed the total over the cap.
        // Never lets a spend-tracking failure affect the reply already sent.
        try {
          const costUsd = estimateTokenCostUsd(inputTokens, outputTokens);
          const deltaGbpCents = usdToGbpCents(costUsd);
          const budget = await recordGuestTutorSpend(admin, deltaGbpCents);
          if (budget.justCrossed) {
            await sendGuestBudgetAlertEmail(
              budget.totalGbpCents,
              budget.capGbpCents,
            );
          }
        } catch (err) {
          console.error(
            "failed to record guest tutor spend:",
            err instanceof Error ? err.message : err,
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Tutor request failed";
        console.error("guest tutor stream error:", message);
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
}
